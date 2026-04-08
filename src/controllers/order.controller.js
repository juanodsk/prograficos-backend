import { prisma } from "../config/db.js";
import { emitProductionChange } from "../utils/realtime.js";

const finishedOrderStatuses = ["TERMINADO", "ENTREGADO"];
const activeOrderStatuses = ["PENDIENTE", "EN_PROCESO"];
const knownOrderStatuses = [
  "PENDIENTE",
  "EN_PROCESO",
  "TERMINADO",
  "ENTREGADO",
];
const defaultPageSize = 10;
const maxPageSize = 50;

const orderInclude = {
  product_customer: {
    include: {
      third: true,
      product: true,
    },
  },
  measure: {
    include: {
      format: true,
    },
  },
  paper_type: true,
  troquel: true,
  user: {
    select: {
      id: true,
      name: true,
      surename: true,
    },
  },
  detail_production_orders: {
    include: {
      process: true,
      machinery: true,
      measure_cutting: {
        include: {
          format: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          surename: true,
        },
      },
    },
    orderBy: {
      process: {
        order: "asc",
      },
    },
  },
};

const orderListSelect = {
  id: true,
  date: true,
  date_delivery_estimated: true,
  order_status: true,
  amount_sheets: true,
  total_estimated: true,
  product_customer: {
    select: {
      name: true,
      third: {
        select: {
          name: true,
        },
      },
      product: {
        select: {
          name: true,
        },
      },
    },
  },
};

const auditOrderInclude = {
  product_customer: {
    include: {
      third: true,
      product: true,
    },
  },
  measure: {
    include: {
      format: true,
    },
  },
  paper_type: true,
  troquel: true,
  user: {
    select: {
      id: true,
      name: true,
      surename: true,
      email: true,
      role: true,
    },
  },
  detail_production_orders: {
    include: {
      process: true,
      machinery: true,
      measure_cutting: {
        include: {
          format: true,
        },
      },
      field_values: {
        include: {
          field_definition: true,
        },
        orderBy: {
          field_definition: {
            sort_order: "asc",
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          surename: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      process: {
        order: "asc",
      },
    },
  },
};

const parseOrderId = (id) => parseInt(id, 10);

const parsePagination = (query) => {
  const requestedPage = Number.parseInt(query?.page, 10);
  const requestedPageSize = Number.parseInt(query?.pageSize, 10);

  return {
    page: Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage,
    pageSize: Number.isNaN(requestedPageSize)
      ? defaultPageSize
      : Math.min(Math.max(requestedPageSize, 1), maxPageSize),
  };
};

const buildPaginationMeta = (requestedPage, pageSize, total) => {
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;
  const page = Math.min(requestedPage, totalPages);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

const buildOrderStatusFilter = (statusGroup) => {
  if (statusGroup === "finished") {
    return {
      order_status: {
        in: finishedOrderStatuses,
      },
    };
  }

  if (statusGroup === "active") {
    return {
      order_status: {
        in: activeOrderStatuses,
      },
    };
  }

  return null;
};

const buildInsensitiveContains = (value) => ({
  contains: value,
  mode: "insensitive",
});

const buildOrderSearchFilter = (rawSearch, options = {}) => {
  const search = rawSearch?.trim();

  if (!search) {
    return null;
  }

  const normalizedSearch = search.toLowerCase();
  const numericSearch = Number.parseInt(search, 10);
  const matchedStatuses = knownOrderStatuses.filter((status) =>
    status.toLowerCase().includes(normalizedSearch),
  );

  const or = [
    {
      product_customer: {
        is: {
          name: buildInsensitiveContains(search),
        },
      },
    },
    {
      product_customer: {
        is: {
          third: {
            is: {
              name: buildInsensitiveContains(search),
            },
          },
        },
      },
    },
    {
      product_customer: {
        is: {
          product: {
            is: {
              name: buildInsensitiveContains(search),
            },
          },
        },
      },
    },
  ];

  if (!Number.isNaN(numericSearch)) {
    or.push({ id: numericSearch });
  }

  if (matchedStatuses.length > 0) {
    or.push({
      order_status: {
        in: matchedStatuses,
      },
    });
  }

  if (options.includeAuditActors) {
    or.push({
      user: {
        is: {
          OR: [
            { name: buildInsensitiveContains(search) },
            { surename: buildInsensitiveContains(search) },
            { email: buildInsensitiveContains(search) },
          ],
        },
      },
    });

    or.push({
      detail_production_orders: {
        some: {
          user: {
            is: {
              OR: [
                { name: buildInsensitiveContains(search) },
                { surename: buildInsensitiveContains(search) },
                { email: buildInsensitiveContains(search) },
              ],
            },
          },
        },
      },
    });
  }

  return { OR: or };
};

const buildWhere = (...filters) => {
  const validFilters = filters.filter(Boolean);

  if (validFilters.length === 0) {
    return {};
  }

  if (validFilters.length === 1) {
    return validFilters[0];
  }

  return {
    AND: validFilters,
  };
};

const getClosingProcess = (details = []) =>
  [...details]
    .reverse()
    .find((detail) => detail.process_state === "TERMINADO") || null;

const attachOrderAuditSummary = (order) => {
  const details = order.detail_production_orders || [];
  const closingProcess = getClosingProcess(details);

  const deliveredTotal =
    order.total_delivered ?? closingProcess?.quantity_delivered ?? 0;

  const damagedTotal = details.reduce(
    (total, detail) => total + (detail.quantity_damaged || 0),
    0,
  );

  return {
    ...order,
    audit_summary: {
      closed_at: closingProcess?.end_hour || closingProcess?.end_date || null,
      closed_by: closingProcess?.user || null,
      process_count: details.length,
      completed_processes: details.filter(
        (detail) => detail.process_state === "TERMINADO",
      ).length,
      delivered_total: deliveredTotal,
      damaged_total: order.total_damaged ?? damagedTotal,
    },
  };
};

const buildAuditSummary = (orders = []) => {
  const users = new Set();

  const totals = orders.reduce(
    (accumulator, order) => {
      const details = order.detail_production_orders || [];
      const closingProcess = getClosingProcess(details);
      const deliveredTotal =
        order.total_delivered ?? closingProcess?.quantity_delivered ?? 0;
      const damagedTotal =
        order.total_damaged ??
        details.reduce(
          (detailTotal, detail) => detailTotal + (detail.quantity_damaged || 0),
          0,
        );

      details.forEach((detail) => {
        if (detail.user_id) {
          users.add(detail.user_id);
        }
      });

      accumulator.deliveredTotal += deliveredTotal;
      accumulator.damagedTotal += damagedTotal;
      return accumulator;
    },
    { deliveredTotal: 0, damagedTotal: 0 },
  );

  return {
    totalClosed: orders.length,
    deliveredTotal: totals.deliveredTotal,
    damagedTotal: totals.damagedTotal,
    operators: users.size,
  };
};

const deleteOrderDetailDependencies = async (tx, headerOrderId) => {
  const detailIds = await tx.detail_Production_Order.findMany({
    where: { header_order_id: headerOrderId },
    select: { id: true },
  });

  const ids = detailIds.map((detail) => detail.id);

  if (ids.length > 0) {
    await tx.detail_Process_Field_Value.deleteMany({
      where: {
        detail_production_order_id: { in: ids },
      },
    });
  }

  await tx.detail_Production_Order.deleteMany({
    where: { header_order_id: headerOrderId },
  });
};

const validateOrderPayload = async ({
  // date_delivery_estimated,
  amount_sheets,
  total_estimated,
  measure_id,
  paper_type_id,
  troquel_id,
  product_customer_id,
  processes,
}) => {
  // if (!date_delivery_estimated) {
  //   return "La fecha estimada de entrega es obligatoria";
  // }

  if (!amount_sheets || amount_sheets <= 0) {
    return "La cantidad de hojas debe ser mayor a 0";
  }

  if (!total_estimated || total_estimated <= 0) {
    return "El total estimado debe ser mayor a 0";
  }

  if (!Array.isArray(processes) || processes.length === 0) {
    return "Debes seleccionar al menos un proceso";
  }

  const processIds = [
    ...new Set(processes.map((processId) => Number(processId))),
  ];

  if (processIds.some((processId) => Number.isNaN(processId))) {
    return "Los procesos enviados no son válidos";
  }

  const [measure, paperType, troquel, productCustomer, existingProcesses] =
    await Promise.all([
      prisma.measure.findFirst({
        where: {
          id: Number(measure_id),
          is_active: true,
        },
      }),
      prisma.paper_Type.findFirst({
        where: {
          id: Number(paper_type_id),
          is_active: true,
        },
      }),
      prisma.troqueles.findFirst({
        where: {
          id: Number(troquel_id),
          is_active: true,
        },
      }),
      prisma.product_Customer.findFirst({
        where: {
          id: Number(product_customer_id),
          is_active: true,
        },
      }),
      prisma.process.findMany({
        where: {
          id: { in: processIds },
          is_active: true,
        },
      }),
    ]);

  if (!measure) {
    return "La medida seleccionada no existe o está inactiva";
  }

  if (!paperType) {
    return "El tipo de papel seleccionado no existe o está inactivo";
  }

  if (!troquel) {
    return "El troquel seleccionado no existe o está inactivo";
  }

  if (!productCustomer) {
    return "El producto del cliente seleccionado no existe o está inactivo";
  }

  if (existingProcesses.length !== processIds.length) {
    return "Uno o más procesos seleccionados no existen o están inactivos";
  }

  return null;
};

const createOrder = async (req, res) => {
  try {
    const {
      date_delivery_estimated,
      amount_sheets,
      total_estimated,
      measure_id,
      paper_type_id,
      troquel_id,
      product_customer_id,
      processes,
    } = req.body;

    const validationError = await validateOrderPayload({
      date_delivery_estimated,
      amount_sheets: Number(amount_sheets),
      total_estimated: Number(total_estimated),
      measure_id,
      paper_type_id,
      troquel_id,
      product_customer_id,
      processes,
    });

    if (validationError) {
      return res.status(400).json({
        status: "error",
        message: validationError,
      });
    }

    const order = await prisma.header_Production_Order.create({
      data: {
        date_delivery_estimated: date_delivery_estimated
          ? new Date(date_delivery_estimated)
          : null,
        amount_sheets: Number(amount_sheets),
        total_estimated: Number(total_estimated),
        measure_id: Number(measure_id),
        paper_type_id: Number(paper_type_id),
        troquel_id: Number(troquel_id),
        product_customer_id: Number(product_customer_id),
        user_id: req.user.id,
        detail_production_orders: {
          create: [
            ...new Set(processes.map((processId) => Number(processId))),
          ].map((processId) => ({
            process_id: processId,
            measure_cutting_id: Number(measure_id),
            quantity_delivered: 0,
            quantity_damaged: 0,
          })),
        },
      },
      include: orderInclude,
    });

    res.status(201).json({
      status: "success",
      message: "Orden creada exitosamente",
      data: order,
    });
    emitProductionChange(req, "order:created", {
      orderId: order.id,
      orderStatus: order.order_status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al crear la orden",
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const { page: requestedPage, pageSize } = parsePagination(req.query);
    const statusGroup =
      req.query?.statusGroup === "finished" ? "finished" : "active";
    const searchFilter = buildOrderSearchFilter(req.query?.search);
    const baseWhere = { is_active: true };
    const listWhere = buildWhere(
      baseWhere,
      buildOrderStatusFilter(statusGroup),
      searchFilter,
    );
    const filteredWhere = buildWhere(baseWhere, searchFilter);

    const [
      total,
      summaryTotal,
      pendingCount,
      progressCount,
      finishedCount,
      activeTabCount,
      finishedTabCount,
    ] = await Promise.all([
      prisma.header_Production_Order.count({ where: listWhere }),
      prisma.header_Production_Order.count({ where: baseWhere }),
      prisma.header_Production_Order.count({
        where: buildWhere(baseWhere, { order_status: "PENDIENTE" }),
      }),
      prisma.header_Production_Order.count({
        where: buildWhere(baseWhere, { order_status: "EN_PROCESO" }),
      }),
      prisma.header_Production_Order.count({
        where: buildWhere(baseWhere, {
          order_status: {
            in: finishedOrderStatuses,
          },
        }),
      }),
      prisma.header_Production_Order.count({
        where: buildWhere(filteredWhere, {
          order_status: {
            in: activeOrderStatuses,
          },
        }),
      }),
      prisma.header_Production_Order.count({
        where: buildWhere(filteredWhere, {
          order_status: {
            in: finishedOrderStatuses,
          },
        }),
      }),
    ]);

    const meta = buildPaginationMeta(requestedPage, pageSize, total);

    const orders = await prisma.header_Production_Order.findMany({
      where: listWhere,
      select: orderListSelect,
      orderBy: { date: "desc" },
      skip: (meta.page - 1) * meta.pageSize,
      take: meta.pageSize,
    });

    res.status(200).json({
      status: "success",
      data: orders,
      meta,
      summary: {
        total: summaryTotal,
        pending: pendingCount,
        progress: progressCount,
        finished: finishedCount,
      },
      tabs: {
        active: activeTabCount,
        finished: finishedTabCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener las órdenes",
    });
  }
};

const getClosedOrdersAudit = async (req, res) => {
  try {
    const { page: requestedPage, pageSize } = parsePagination(req.query);
    const closedWhere = {
      is_active: true,
      order_status: {
        in: finishedOrderStatuses,
      },
    };
    const searchFilter = buildOrderSearchFilter(req.query?.search, {
      includeAuditActors: true,
    });
    const listWhere = buildWhere(closedWhere, searchFilter);

    const [total, summaryOrders] = await Promise.all([
      prisma.header_Production_Order.count({ where: listWhere }),
      prisma.header_Production_Order.findMany({
        where: closedWhere,
        select: {
          id: true,
          total_delivered: true,
          total_damaged: true,
          detail_production_orders: {
            select: {
              quantity_delivered: true,
              quantity_damaged: true,
              process_state: true,
              end_hour: true,
              end_date: true,
              user_id: true,
            },
            orderBy: [{ process: { order: "asc" } }, { id: "asc" }],
          },
        },
      }),
    ]);

    const meta = buildPaginationMeta(requestedPage, pageSize, total);

    const orders = await prisma.header_Production_Order.findMany({
      where: listWhere,
      include: auditOrderInclude,
      orderBy: {
        date: "desc",
      },
      skip: (meta.page - 1) * meta.pageSize,
      take: meta.pageSize,
    });

    res.status(200).json({
      status: "success",
      message: "Auditoría de órdenes cerradas obtenida exitosamente",
      data: orders.map(attachOrderAuditSummary),
      meta,
      summary: buildAuditSummary(summaryOrders),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener la auditoría de órdenes cerradas",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);

    if (Number.isNaN(orderId)) {
      return res.status(400).json({
        status: "error",
        message: "El id de la orden no es válido",
      });
    }

    const order = await prisma.header_Production_Order.findFirst({
      where: {
        id: orderId,
        is_active: true,
      },
      include: orderInclude,
    });

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Orden no encontrada",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Orden obtenida exitosamente",
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener la orden",
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);

    if (Number.isNaN(orderId)) {
      return res.status(400).json({
        status: "error",
        message: "El id de la orden no es válido",
      });
    }

    const existingOrder = await prisma.header_Production_Order.findFirst({
      where: {
        id: orderId,
        is_active: true,
      },
      include: {
        detail_production_orders: true,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        status: "error",
        message: "Orden no encontrada",
      });
    }

    const hasStartedProcesses = existingOrder.detail_production_orders.some(
      (detail) => detail.process_state !== "PENDIENTE",
    );

    if (hasStartedProcesses) {
      return res.status(400).json({
        status: "error",
        message:
          "La orden no se puede editar porque ya tiene procesos iniciados o finalizados",
      });
    }

    const {
      date_delivery_estimated,
      amount_sheets,
      total_estimated,
      measure_id,
      paper_type_id,
      troquel_id,
      product_customer_id,
      processes,
      order_status,
    } = req.body;

    const validationError = await validateOrderPayload({
      date_delivery_estimated,
      amount_sheets: Number(amount_sheets),
      total_estimated: Number(total_estimated),
      measure_id,
      paper_type_id,
      troquel_id,
      product_customer_id,
      processes,
    });

    if (validationError) {
      return res.status(400).json({
        status: "error",
        message: validationError,
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      await deleteOrderDetailDependencies(tx, orderId);

      return tx.header_Production_Order.update({
        where: { id: orderId },
        data: {
          date_delivery_estimated: new Date(date_delivery_estimated),
          amount_sheets: Number(amount_sheets),
          total_estimated: Number(total_estimated),
          measure_id: Number(measure_id),
          paper_type_id: Number(paper_type_id),
          troquel_id: Number(troquel_id),
          product_customer_id: Number(product_customer_id),
          order_status: order_status || existingOrder.order_status,
          detail_production_orders: {
            create: [
              ...new Set(processes.map((processId) => Number(processId))),
            ].map((processId) => ({
              process_id: processId,
              measure_cutting_id: Number(measure_id),
              quantity_delivered: 0,
              quantity_damaged: 0,
            })),
          },
        },
        include: orderInclude,
      });
    });

    res.status(200).json({
      status: "success",
      message: "Orden actualizada exitosamente",
      data: updatedOrder,
    });
    emitProductionChange(req, "order:updated", {
      orderId: updatedOrder.id,
      orderStatus: updatedOrder.order_status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al actualizar la orden",
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);

    if (Number.isNaN(orderId)) {
      return res.status(400).json({
        status: "error",
        message: "El id de la orden no es válido",
      });
    }

    const existingOrder = await prisma.header_Production_Order.findFirst({
      where: {
        id: orderId,
        is_active: true,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        status: "error",
        message: "Orden no encontrada",
      });
    }

    await prisma.header_Production_Order.update({
      where: { id: orderId },
      data: { is_active: false },
    });

    res.status(200).json({
      status: "success",
      message: "Orden desactivada exitosamente",
    });
    emitProductionChange(req, "order:deleted", {
      orderId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar la orden",
    });
  }
};

const orderFinished = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);

    if (Number.isNaN(orderId)) {
      return res.status(400).json({
        status: "error",
        message: "El id de la orden no es válido",
      });
    }

    const existingOrder = await prisma.header_Production_Order.findFirst({
      where: {
        id: orderId,
        is_active: true,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        status: "error",
        message: "Orden no encontrada",
      });
    }

    const order = await prisma.header_Production_Order.update({
      where: { id: orderId },
      data: { order_status: "TERMINADO" },
      include: orderInclude,
    });

    res.status(200).json({
      status: "success",
      message: "Orden finalizada exitosamente",
      data: order,
    });
    emitProductionChange(req, "order:finished", {
      orderId: order.id,
      orderStatus: order.order_status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al finalizar la orden",
    });
  }
};

export {
  createOrder,
  getOrders,
  getClosedOrdersAudit,
  getOrderById,
  updateOrder,
  deleteOrder,
  orderFinished,
};
