import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";

const createMachinery = async (req, res) => {
  try {
    const { name, reference, type, is_active } = req.body;
    const machinery = await prisma.machinery.create({
      data: {
        name,
        reference,
        type,
        is_active: normalizeIsActive(is_active, true),
      },
    });
    res.status(201).json({
      status: "success",
      message: "Máquina creada exitosamente",
      data: machinery,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al crear la máquina",
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
    const { name, reference, type, is_active } = req.body;
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
      data: {
        name,
        reference,
        type,
        is_active: normalizeIsActive(is_active, machineryExists.is_active),
      },
    });
    res.status(200).json({
      status: "success",
      message: "Máquina actualizada exitosamente",
      data: machinery,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al actualizar la máquina",
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
  getMachinery,
  getMachineryById,
  updateMachinery,
  deleteMachinery,
};
