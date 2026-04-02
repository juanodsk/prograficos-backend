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

    const machinery = await prisma.machinery.create({
      data: payload,
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

    const machinery = await prisma.machinery.update({
      where: {
        id: parseInt(id),
      },
      data: payload,
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

    const machinery = await prisma.machinery.update({
      where: {
        id: parseInt(id),
      },
      data: { is_active: false },
    });
    res.status(200).json({
      status: "success",
      message: "Máquina desactivada exitosamente",
      data: machinery,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al desactivar la máquina",
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
