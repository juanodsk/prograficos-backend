import { prisma } from "../config/db.js";

const createProcess = async (req, res) => {
  try {
    const { name, order, use_troquel, use_measure, use_inks } = req.body;
    const process = await prisma.process.create({
      data: {
        name,
        order,
        use_troquel,
        use_measure,
        use_inks,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Proceso creado exitosamente",
      data: process,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al crear Proceso",
    });
  }
};
const getProcesses = async (req, res) => {
  try {
    const processes = await prisma.process.findMany();
    res.status(200).json({
      status: "success",
      message: "Procesos obtenidos exitosamente",
      data: processes,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener los procesos",
    });
  }
};
const getProcessById = async (req, res) => {
  try {
    const { id } = req.params;
    const process = await prisma.process.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!process) {
      return res.status(404).json({
        status: "error",
        message: "Proceso no encontrado",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Proceso obtenido exitosamente",
      data: process,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener el proceso",
    });
  }
};
const updateProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order, use_troquel, use_measure, use_inks } = req.body;
    const process = await prisma.process.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        order,
        use_troquel,
        use_measure,
        use_inks,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Proceso actualizado exitosamente",
      data: process,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al actualizar el proceso",
    });
  }
};
const deleteProcess = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.process.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({
      status: "success",
      message: "Proceso eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al eliminar el proceso",
    });
  }
};

export {
  createProcess,
  getProcesses,
  getProcessById,
  updateProcess,
  deleteProcess,
};
