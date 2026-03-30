import { prisma } from "../config/db.js";

const orderInclude = {
  product_customer: {
    include: {
      third: true,
      product: true,
    },
  },
  measure: true,
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
      measure_cutting: true,
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

const parseOrderId = (id) => parseInt(id, 10);

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
  date_delivery_estimated,
  amount_sheets,
  total_estimated,
  measure_id,
  paper_type_id,
  troquel_id,
  product_customer_id,
  processes,
}) => {
  if (!date_delivery_estimated) {
    return "La fecha estimada de entrega es obligatoria";
  }

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
      prisma.measure.findUnique({ where: { id: Number(measure_id) } }),
      prisma.paper_Type.findUnique({ where: { id: Number(paper_type_id) } }),
      prisma.troqueles.findUnique({ where: { id: Number(troquel_id) } }),
      prisma.product_Customer.findUnique({
        where: { id: Number(product_customer_id) },
      }),
      prisma.process.findMany({
        where: {
          id: { in: processIds },
        },
      }),
    ]);

  if (!measure) {
    return "La medida seleccionada no existe";
  }

  if (!paperType) {
    return "El tipo de papel seleccionado no existe";
  }

  if (!troquel) {
    return "El troquel seleccionado no existe";
  }

  if (!productCustomer) {
    return "El producto del cliente seleccionado no existe";
  }

  if (existingProcesses.length !== processIds.length) {
    return "Uno o más procesos seleccionados no existen";
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
        date_delivery_estimated: new Date(date_delivery_estimated),
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
    const orders = await prisma.header_Production_Order.findMany({
      include: orderInclude,
      orderBy: { date: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener las órdenes",
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

    const order = await prisma.header_Production_Order.findUnique({
      where: { id: orderId },
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

    const existingOrder = await prisma.header_Production_Order.findUnique({
      where: { id: orderId },
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

    const existingOrder = await prisma.header_Production_Order.findUnique({
      where: { id: orderId },
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

    await prisma.$transaction(async (tx) => {
      await deleteOrderDetailDependencies(tx, orderId);
      await tx.header_Production_Order.delete({
        where: { id: orderId },
      });
    });

    res.status(200).json({
      status: "success",
      message: "Orden eliminada exitosamente",
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

    const existingOrder = await prisma.header_Production_Order.findUnique({
      where: { id: orderId },
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
  getOrderById,
  updateOrder,
  deleteOrder,
  orderFinished,
};
