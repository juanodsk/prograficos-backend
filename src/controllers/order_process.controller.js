import { prisma } from "../config/db.js";

const orderProcessInclude = {
  process: {
    include: {
      field_definitions: {
        orderBy: {
          sort_order: "asc",
        },
      },
    },
  },
  machinery: true,
  measure_cutting: true,
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
  header_order: {
    select: {
      id: true,
      order_status: true,
      date: true,
      date_delivery_estimated: true,
    },
  },
};

const parseId = (value) => parseInt(value, 10);

const syncDynamicFieldValues = async (
  tx,
  detailId,
  processId,
  fieldValues = [],
) => {
  const definitions = await tx.process_Field_Definition.findMany({
    where: { process_id: processId },
  });

  const fieldValuesMap = new Map(
    Array.isArray(fieldValues)
      ? fieldValues
          .filter((fieldValue) => fieldValue?.field_definition_id)
          .map((fieldValue) => [
            Number(fieldValue.field_definition_id),
            fieldValue.value,
          ])
      : [],
  );

  for (const definition of definitions) {
    let value = fieldValuesMap.get(definition.id);

    if (value == null || value === "") continue;

    await tx.detail_Process_Field_Value.upsert({
      where: {
        detail_production_order_id_field_definition_id: {
          detail_production_order_id: detailId,
          field_definition_id: definition.id,
        },
      },
      update: {
        value: String(value),
      },
      create: {
        detail_production_order_id: detailId,
        field_definition_id: definition.id,
        value: String(value),
      },
    });
  }
};

const updateHeaderOrderStatus = async (tx, headerOrderId) => {
  const details = await tx.detail_Production_Order.findMany({
    where: { header_order_id: headerOrderId },
    select: { process_state: true },
  });

  if (!details.length) return;

  const allFinished = details.every(
    (detail) => detail.process_state === "TERMINADO",
  );

  const someInProgress = details.some(
    (detail) => detail.process_state === "EN_PROCESO",
  );

  const nextStatus = allFinished
    ? "TERMINADO"
    : someInProgress
      ? "EN_PROCESO"
      : "PENDIENTE";

  await tx.header_Production_Order.update({
    where: { id: headerOrderId },
    data: { order_status: nextStatus },
  });
};

const getOrderProcesses = async (req, res) => {
  try {
    const orderId = parseId(req.params.orderId);

    if (Number.isNaN(orderId)) {
      return res.status(400).json({
        status: "error",
        message: "El id de la orden no es válido",
      });
    }

    const order = await prisma.header_Production_Order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Orden no encontrada",
      });
    }

    const processes = await prisma.detail_Production_Order.findMany({
      where: { header_order_id: orderId },
      include: orderProcessInclude,
      orderBy: {
        process: {
          order: "asc",
        },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Procesos de la orden obtenidos exitosamente",
      data: processes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener los procesos de la orden",
    });
  }
};

const getOrderProcessById = async (req, res) => {
  try {
    const detailId = parseId(req.params.id);

    if (Number.isNaN(detailId)) {
      return res.status(400).json({
        status: "error",
        message: "El id del proceso no es válido",
      });
    }

    const detail = await prisma.detail_Production_Order.findUnique({
      where: { id: detailId },
      include: orderProcessInclude,
    });

    if (!detail) {
      return res.status(404).json({
        status: "error",
        message: "Proceso de la orden no encontrado",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Proceso de la orden obtenido exitosamente",
      data: detail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener el proceso de la orden",
    });
  }
};

const startOrderProcess = async (req, res) => {
  try {
    const detailId = parseId(req.params.id);

    if (Number.isNaN(detailId)) {
      return res.status(400).json({
        status: "error",
        message: "El id del proceso no es válido",
      });
    }

    const { machinery_id, measure_cutting_id, observations, field_values } =
      req.body;

    const detail = await prisma.detail_Production_Order.findUnique({
      where: { id: detailId },
      include: {
        process: {
          include: {
            field_definitions: true,
          },
        },
        header_order: true,
      },
    });

    if (!detail) {
      return res.status(404).json({
        status: "error",
        message: "Proceso de la orden no encontrado",
      });
    }

    if (detail.process_state === "TERMINADO") {
      return res.status(400).json({
        status: "error",
        message: "Este proceso ya fue terminado",
      });
    }

    if (machinery_id) {
      const machinery = await prisma.machinery.findUnique({
        where: { id: Number(machinery_id) },
      });

      if (!machinery) {
        return res.status(400).json({
          status: "error",
          message: "La maquinaria seleccionada no existe",
        });
      }
    }

    if (measure_cutting_id) {
      const measure = await prisma.measure.findUnique({
        where: { id: Number(measure_cutting_id) },
      });

      if (!measure) {
        return res.status(400).json({
          status: "error",
          message: "La medida de corte seleccionada no existe",
        });
      }
    }

    const now = new Date();

    const updatedDetail = await prisma.$transaction(async (tx) => {
      const result = await tx.detail_Production_Order.update({
        where: { id: detailId },
        data: {
          start_date: detail.start_date || now,
          start_hour: detail.start_hour || now,
          process_state: "EN_PROCESO",
          user_id: req.user.id,
          machinery_id: machinery_id ? Number(machinery_id) : detail.machinery_id,
          measure_cutting_id: measure_cutting_id
            ? Number(measure_cutting_id)
            : detail.measure_cutting_id,
          observations: observations ?? detail.observations,
        },
        include: orderProcessInclude,
      });

      await syncDynamicFieldValues(
        tx,
        detailId,
        detail.process_id,
        field_values,
      );
      await updateHeaderOrderStatus(tx, detail.header_order_id);
      return tx.detail_Production_Order.findUnique({
        where: { id: detailId },
        include: orderProcessInclude,
      });
    });

    res.status(200).json({
      status: "success",
      message: "Proceso iniciado exitosamente",
      data: updatedDetail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al iniciar el proceso",
    });
  }
};

const finishOrderProcess = async (req, res) => {
  try {
    const detailId = parseId(req.params.id);

    if (Number.isNaN(detailId)) {
      return res.status(400).json({
        status: "error",
        message: "El id del proceso no es válido",
      });
    }

    const {
      quantity_delivered,
      quantity_damaged,
      observations,
      machinery_id,
      measure_cutting_id,
      field_values,
    } = req.body;

    if (quantity_delivered == null || Number(quantity_delivered) < 0) {
      return res.status(400).json({
        status: "error",
        message: "La cantidad entregada es obligatoria y no puede ser negativa",
      });
    }

    if (quantity_damaged == null || Number(quantity_damaged) < 0) {
      return res.status(400).json({
        status: "error",
        message: "La cantidad dañada es obligatoria y no puede ser negativa",
      });
    }

    const detail = await prisma.detail_Production_Order.findUnique({
      where: { id: detailId },
      include: {
        process: {
          include: {
            field_definitions: true,
          },
        },
      },
    });

    if (!detail) {
      return res.status(404).json({
        status: "error",
        message: "Proceso de la orden no encontrado",
      });
    }

    if (detail.process_state === "TERMINADO") {
      return res.status(400).json({
        status: "error",
        message: "Este proceso ya fue terminado",
      });
    }

    if (machinery_id) {
      const machinery = await prisma.machinery.findUnique({
        where: { id: Number(machinery_id) },
      });

      if (!machinery) {
        return res.status(400).json({
          status: "error",
          message: "La maquinaria seleccionada no existe",
        });
      }
    }

    if (measure_cutting_id) {
      const measure = await prisma.measure.findUnique({
        where: { id: Number(measure_cutting_id) },
      });

      if (!measure) {
        return res.status(400).json({
          status: "error",
          message: "La medida de corte seleccionada no existe",
        });
      }
    }

    const now = new Date();

    const updatedDetail = await prisma.$transaction(async (tx) => {
      const result = await tx.detail_Production_Order.update({
        where: { id: detailId },
        data: {
          start_date: detail.start_date || now,
          start_hour: detail.start_hour || now,
          end_date: now,
          end_hour: now,
          process_state: "TERMINADO",
          user_id: req.user.id,
          machinery_id: machinery_id ? Number(machinery_id) : detail.machinery_id,
          measure_cutting_id: measure_cutting_id
            ? Number(measure_cutting_id)
            : detail.measure_cutting_id,
          quantity_delivered: Number(quantity_delivered),
          quantity_damaged: Number(quantity_damaged),
          observations: observations ?? detail.observations,
        },
        include: orderProcessInclude,
      });

      await syncDynamicFieldValues(
        tx,
        detailId,
        detail.process_id,
        field_values,
      );
      await updateHeaderOrderStatus(tx, detail.header_order_id);
      return tx.detail_Production_Order.findUnique({
        where: { id: detailId },
        include: orderProcessInclude,
      });
    });

    res.status(200).json({
      status: "success",
      message: "Proceso finalizado exitosamente",
      data: updatedDetail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al finalizar el proceso",
    });
  }
};

export {
  finishOrderProcess,
  getOrderProcessById,
  getOrderProcesses,
  startOrderProcess,
};
