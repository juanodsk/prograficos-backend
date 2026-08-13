import { prisma } from "../config/db.js";
import { emitProductionChange } from "../utils/realtime.js";

const orderProcessBaseInclude = {
  process: {
    include: {
      machineries: {
        include: {
          machinery: true,
        },
      },
    },
  },
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
      email: true,
      role: true,
    },
  },
  header_order: {
    select: {
      id: true,
      is_active: true,
      measure_id: true,
      order_status: true,
      date: true,
      date_delivery_estimated: true,
    },
  },
};

const orderProcessReadInclude = {
  ...orderProcessBaseInclude,
  process: {
    ...orderProcessBaseInclude.process,
    include: {
      ...orderProcessBaseInclude.process.include,
      field_definitions: {
        orderBy: { sort_order: "asc" },
      },
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
};

const orderProcessFormInclude = {
  ...orderProcessBaseInclude,
  process: {
    ...orderProcessBaseInclude.process,
    include: {
      ...orderProcessBaseInclude.process.include,
      field_definitions: {
        where: { deleted_at: null },
        orderBy: { sort_order: "asc" },
      },
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
};

const parseId = (value) => parseInt(value, 10);

const getOrderedOrderDetails = async (db, headerOrderId) =>
  db.detail_Production_Order.findMany({
    where: {
      header_order_id: headerOrderId,
    },
    select: {
      id: true,
      process_state: true,
      process: {
        select: {
          id: true,
          name: true,
          order: true,
        },
      },
    },
    orderBy: [{ process: { order: "asc" } }, { id: "asc" }],
  });

const getBlockingPreviousProcess = (orderedDetails, detailId) => {
  const currentIndex = orderedDetails.findIndex((detail) => detail.id === detailId);

  if (currentIndex <= 0) {
    return null;
  }

  return (
    orderedDetails
      .slice(0, currentIndex)
      .find((detail) => detail.process_state !== "TERMINADO") || null
  );
};

const syncDynamicFieldValues = async (
  tx,
  detailId,
  processId,
  fieldValues = [],
) => {
  const definitions = await tx.process_Field_Definition.findMany({
    where: { process_id: processId, deleted_at: null },
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
    select: {
      id: true,
      process_state: true,
      quantity_delivered: true,
      quantity_damaged: true,
      process: {
        select: {
          order: true,
        },
      },
    },
    orderBy: [{ process: { order: "asc" } }, { id: "asc" }],
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

  const totalDamaged = details.reduce(
    (total, detail) => total + (detail.quantity_damaged || 0),
    0,
  );

  const lastCompletedDetail = [...details]
    .reverse()
    .find((detail) => detail.process_state === "TERMINADO");

  await tx.header_Production_Order.update({
    where: { id: headerOrderId },
    data: {
      order_status: nextStatus,
      total_damaged: totalDamaged,
      total_delivered: lastCompletedDetail?.quantity_delivered ?? null,
    },
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

    const order = await prisma.header_Production_Order.findFirst({
      where: {
        id: orderId,
        is_active: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Orden no encontrada",
      });
    }

      const processes = await prisma.detail_Production_Order.findMany({
        where: { header_order_id: orderId },
        include: orderProcessReadInclude,
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
      include: orderProcessReadInclude,
    });

    if (!detail || !detail.header_order?.is_active) {
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

    const { machinery_id, measure_cutting_id, observations, field_values } = req.body;

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

    if (!detail.header_order?.is_active) {
      return res.status(400).json({
        status: "error",
        message: "La orden de este proceso está inactiva",
      });
    }

    if (detail.process_state === "TERMINADO") {
      return res.status(400).json({
        status: "error",
        message: "Este proceso ya fue terminado",
      });
    }

    if (detail.process_state === "EN_PROCESO") {
      return res.status(400).json({
        status: "error",
        message: "Este proceso ya fue iniciado y no permite cambiar los datos de entrada",
      });
    }

    const orderedDetails = await getOrderedOrderDetails(
      prisma,
      detail.header_order_id,
    );

    const blockingPreviousProcess = getBlockingPreviousProcess(
      orderedDetails,
      detailId,
    );

    if (blockingPreviousProcess) {
      return res.status(400).json({
        status: "error",
        message: `No puedes iniciar este proceso hasta terminar ${blockingPreviousProcess.process?.name || "el proceso anterior"}`,
      });
    }

    const requestedMachineryId =
      machinery_id != null && machinery_id !== "" ? Number(machinery_id) : null;
    if (requestedMachineryId != null && Number.isNaN(requestedMachineryId)) {
      return res.status(400).json({
        status: "error",
        message: "La maquinaria seleccionada no es válida",
      });
    }

    if (measure_cutting_id != null && measure_cutting_id !== "") {
      return res.status(400).json({
        status: "error",
        message:
          "La medida de corte se toma automáticamente del formato y tamaño de impresión de la orden",
      });
    }

    if (requestedMachineryId) {
      const machinery = await prisma.machinery.findFirst({
        where: {
          id: requestedMachineryId,
          is_active: true,
        },
      });

      if (!machinery) {
        return res.status(400).json({
          status: "error",
          message: "La maquinaria seleccionada no existe o está inactiva",
        });
      }
    }

    const resolvedMeasureCuttingId = detail.header_order?.measure_id || null;

    const now = new Date();

    const updatedDetail = await prisma.$transaction(async (tx) => {
      if (resolvedMeasureCuttingId) {
        await tx.detail_Production_Order.updateMany({
          where: {
            header_order_id: detail.header_order_id,
          },
          data: {
            measure_cutting_id: resolvedMeasureCuttingId,
          },
        });
      }

      await tx.detail_Production_Order.update({
        where: { id: detailId },
        data: {
          start_date: detail.start_date || now,
          start_hour: detail.start_hour || now,
          process_state: "EN_PROCESO",
          user_id: req.user.id,
          machinery_id:
            requestedMachineryId != null ? requestedMachineryId : detail.machinery_id,
          measure_cutting_id: resolvedMeasureCuttingId,
          observations: observations ?? detail.observations,
        },
        include: orderProcessFormInclude,
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
        include: orderProcessFormInclude,
      });
    });

    res.status(200).json({
      status: "success",
      message: "Proceso iniciado exitosamente",
      data: updatedDetail,
    });
    emitProductionChange(req, "process:started", {
      detailId: updatedDetail.id,
      orderId: detail.header_order_id,
      processState: updatedDetail.process_state,
      processName: updatedDetail.process?.name,
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

    const headerOrder = await prisma.header_Production_Order.findFirst({
      where: {
        id: detail.header_order_id,
        is_active: true,
      },
      select: { id: true },
    });

    if (!headerOrder) {
      return res.status(400).json({
        status: "error",
        message: "La orden de este proceso está inactiva",
      });
    }

    if (detail.process_state === "TERMINADO") {
      return res.status(400).json({
        status: "error",
        message: "Este proceso ya fue terminado",
      });
    }

    if (detail.process_state !== "EN_PROCESO") {
      return res.status(400).json({
        status: "error",
        message: "Debes iniciar el proceso antes de poder finalizarlo",
      });
    }

    const hasInputDataChanges =
      machinery_id != null ||
      measure_cutting_id != null ||
      observations != null ||
      (Array.isArray(field_values) && field_values.length > 0);

    if (hasInputDataChanges) {
      return res.status(400).json({
        status: "error",
        message:
          "Al finalizar solo puedes registrar la cantidad entregada y la cantidad dañada",
      });
    }

    const now = new Date();

    const updatedDetail = await prisma.$transaction(async (tx) => {
      await tx.detail_Production_Order.update({
        where: { id: detailId },
        data: {
          start_date: detail.start_date || now,
          start_hour: detail.start_hour || now,
          end_date: now,
          end_hour: now,
          process_state: "TERMINADO",
          user_id: req.user.id,
          quantity_delivered: Number(quantity_delivered),
          quantity_damaged: Number(quantity_damaged),
        },
        include: orderProcessReadInclude,
      });
      await updateHeaderOrderStatus(tx, detail.header_order_id);
      return tx.detail_Production_Order.findUnique({
        where: { id: detailId },
        include: orderProcessReadInclude,
      });
    });

    res.status(200).json({
      status: "success",
      message: "Proceso finalizado exitosamente",
      data: updatedDetail,
    });
    emitProductionChange(req, "process:finished", {
      detailId: updatedDetail.id,
      orderId: detail.header_order_id,
      processState: updatedDetail.process_state,
      processName: updatedDetail.process?.name,
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
