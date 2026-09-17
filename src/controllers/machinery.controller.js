import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";
import { isValidMachineryType } from "../constants/machineryTypes.js";

const duplicateReferenceMessage = "El código de la máquina ya está siendo utilizado";

const normalizeMachineryPayload = (body, fallbackIsActive = true) => ({
  name: body?.name?.trim(),
  reference: body?.reference?.trim(),
  type: body?.type,
  is_active: normalizeIsActive(body?.is_active, fallbackIsActive),
});

// operator_ids: ids únicos, enteros y positivos. Vacío = sin operarios (válido).
const normalizeOperatorIds = (body) => {
  const raw = body?.operator_ids;
  if (!Array.isArray(raw)) return [];
  const ids = raw
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
  return [...new Set(ids)];
};

// El backend es la autoridad: todos deben operar maquinaria (flag) y estar
// activos, sin importar el rol.
const validateOperatorIds = async (ids) => {
  if (ids.length === 0) return null;
  const count = await prisma.user.count({
    where: { id: { in: ids }, operates_machinery: true, is_active: true },
  });
  if (count !== ids.length) {
    return "Uno o más operarios seleccionados no son válidos o no operan maquinaria";
  }
  return null;
};

const machineryOperatorsInclude = {
  operators: {
    include: {
      user: { select: { id: true, name: true, surename: true, email: true } },
    },
  },
};

const findMachineryByReference = (reference, excludeId = null) =>
  prisma.machinery.findFirst({
    where: {
      reference: {
        equals: reference,
        mode: "insensitive",
      },
      ...(excludeId != null ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, reference: true },
  });

const createMachinery = async (req, res) => {
  try {
    const payload = normalizeMachineryPayload(req.body, true);

    if (!payload.name) {
      return res.status(400).json({
        status: "error",
        message: "El nombre de la máquina es obligatorio",
      });
    }

    if (!payload.reference) {
      return res.status(400).json({
        status: "error",
        message: "La referencia de la máquina es obligatoria",
      });
    }

    if (!payload.type || !isValidMachineryType(payload.type)) {
      return res.status(400).json({
        status: "error",
        message: "El tipo de maquinaria seleccionado no es válido",
      });
    }

    const duplicateMachinery = await findMachineryByReference(payload.reference);

    if (duplicateMachinery) {
      return res.status(409).json({
        status: "warning",
        message: duplicateReferenceMessage,
      });
    }

    const operatorIds = normalizeOperatorIds(req.body);
    const operatorError = await validateOperatorIds(operatorIds);
    if (operatorError) {
      return res.status(400).json({ status: "error", message: operatorError });
    }

    const machinery = await prisma.machinery.create({
      data: {
        ...payload,
        operators: { create: operatorIds.map((user_id) => ({ user_id })) },
      },
      include: machineryOperatorsInclude,
    });
    res.status(201).json({
      status: "success",
      message: "Máquina creada exitosamente",
      data: machinery,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        status: "warning",
        message: duplicateReferenceMessage,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Error al crear la máquina",
    });
  }
};

const validateMachineryReference = async (req, res) => {
  try {
    const reference = req.query?.reference?.trim();
    const excludeId =
      req.query?.excludeId != null && req.query.excludeId !== ""
        ? Number(req.query.excludeId)
        : null;

    if (!reference) {
      return res.status(400).json({
        status: "error",
        message: "El código de la máquina es obligatorio",
      });
    }

    const duplicateMachinery = await findMachineryByReference(reference, excludeId);

    res.status(200).json({
      status: "success",
      message: duplicateMachinery
        ? duplicateReferenceMessage
        : "El código de la máquina está disponible",
      data: {
        available: !duplicateMachinery,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "No se pudo validar el código de la máquina",
    });
  }
};

const getMachinery = async (req, res) => {
  try {
    const machinery = await prisma.machinery.findMany({
      where: buildActiveWhere(req.query),
      orderBy: [{ name: "asc" }, { reference: "asc" }],
      include: machineryOperatorsInclude,
    });
    res.status(200).json({
      status: "success",
      message: "Máquinas obtenidas exitosamente",
      data: machinery,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener las máquinas",
    });
  }
};
const getMachineryById = async (req, res) => {
  try {
    const { id } = req.params;
    const machinery = await prisma.machinery.findUnique({
      where: {
        id: parseInt(id),
      },
      include: machineryOperatorsInclude,
    });
    if (!machinery) {
      return res.status(404).json({
        status: "error",
        message: "Máquina no encontrada",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Máquina obtenida exitosamente",
      data: machinery,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener la máquina",
    });
  }
};
const updateMachinery = async (req, res) => {
  try {
    const { id } = req.params;
    const machineryExists = await prisma.machinery.findUnique({
      where: { id: parseInt(id) },
    });

    if (!machineryExists) {
      return res.status(404).json({
        status: "error",
        message: "Máquina no encontrada",
      });
    }

    const payload = normalizeMachineryPayload(req.body, machineryExists.is_active);

    if (!payload.name) {
      return res.status(400).json({
        status: "error",
        message: "El nombre de la máquina es obligatorio",
      });
    }

    if (!payload.reference) {
      return res.status(400).json({
        status: "error",
        message: "La referencia de la máquina es obligatoria",
      });
    }

    if (!payload.type || !isValidMachineryType(payload.type)) {
      return res.status(400).json({
        status: "error",
        message: "El tipo de maquinaria seleccionado no es válido",
      });
    }

    const duplicateMachinery = await findMachineryByReference(
      payload.reference,
      machineryExists.id,
    );

    if (duplicateMachinery) {
      return res.status(409).json({
        status: "warning",
        message: duplicateReferenceMessage,
      });
    }

    const operatorIds = normalizeOperatorIds(req.body);
    const operatorError = await validateOperatorIds(operatorIds);
    if (operatorError) {
      return res.status(400).json({ status: "error", message: operatorError });
    }

    const machinery = await prisma.machinery.update({
      where: {
        id: parseInt(id),
      },
      data: {
        ...payload,
        // Reemplaza el conjunto de operarios por el nuevo.
        operators: {
          deleteMany: {},
          create: operatorIds.map((user_id) => ({ user_id })),
        },
      },
      include: machineryOperatorsInclude,
    });
    res.status(200).json({
      status: "success",
      message: "Máquina actualizada exitosamente",
      data: machinery,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        status: "warning",
        message: duplicateReferenceMessage,
      });
    }

    res.status(500).json({
      status: "error",
      message: "No se pudo actualizar la máquina",
    });
  }
};
const deleteMachinery = async (req, res) => {
  try {
    const { id } = req.params;
    const machineryExists = await prisma.machinery.findUnique({
      where: { id: parseInt(id) },
    });

    if (!machineryExists) {
      return res.status(404).json({
        status: "error",
        message: "Máquina no encontrada",
      });
    }

    const machineryId = parseInt(id);

    // Borrado real solo si NO tiene asociaciones que intervengan:
    // procesos vinculados (process_machinery) ni uso en órdenes de producción.
    const [processCount, productionCount] = await Promise.all([
      prisma.processMachinery.count({ where: { machinery_id: machineryId } }),
      prisma.detail_Production_Order.count({
        where: { machinery_id: machineryId },
      }),
    ]);

    if (processCount > 0 || productionCount > 0) {
      return res.status(400).json({
        status: "error",
        message:
          "No se puede eliminar la máquina porque tiene procesos u órdenes asociadas. Puedes inactivarla desde la edición.",
      });
    }

    await prisma.machinery.delete({ where: { id: machineryId } });

    res.status(200).json({
      status: "success",
      message: "Máquina eliminada exitosamente",
    });
  } catch (error) {
    console.log(error);

    // Salvaguarda: si una FK impide el borrado, lo tratamos como asociación.
    if (error?.code === "P2003") {
      return res.status(400).json({
        status: "error",
        message:
          "No se puede eliminar la máquina porque tiene registros asociados. Puedes inactivarla desde la edición.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Error al eliminar la máquina",
    });
  }
};

export {
  createMachinery,
  validateMachineryReference,
  getMachinery,
  getMachineryById,
  updateMachinery,
  deleteMachinery,
};
