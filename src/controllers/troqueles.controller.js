import { prisma } from "../config/db.js";

const createTroqueles = async (req, res) => {
  try {
    const { elaboration_date, size, file } = req.body;
    const troqueles = await prisma.troqueles.create({
      data: {
        elaboration_date,
        size,
        file,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Troquel creado exitosamente",
      data: troqueles,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al crear troquel" });
  }
};
const getTroqueles = async (req, res) => {
  try {
    const troqueles = await prisma.troqueles.findMany();
    res.status(200).json({
      status: "success",
      message: "Troqueles obtenidos exitosamente",
      data: troqueles,
    });
  } catch (error) {
    res.json({ status: "error", message: "Error al obtener troqueles" });
  }
};
const getTroquelesById = async (req, res) => {
  try {
    const { id } = req.params;
    const troquel = await prisma.troqueles.findUnique({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      status: "success",
      message: "Troquel obtenido exitosamente",
      data: troquel,
    });
  } catch (error) {
    res.json({ status: "error", message: "Error al obtener troquel" });
  }
};
const updateTroqueles = async (req, res) => {
  try {
    const { id } = req.params;
    const { elaboration_date, size, file } = req.body;
    const troquel = await prisma.troqueles.update({
      where: { id: parseInt(id) },
      data: {
        elaboration_date,
        size,
        file,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Troquel actualizado exitosamente",
      data: troquel,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al actualizar troquel" });
  }
};
const deleteTroqueles = async (req, res) => {
  try {
    const { id } = req.params;
    const troquel = await prisma.troqueles.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      status: "success",
      message: "Troquel eliminado exitosamente",
      data: troquel,
    });
  } catch (error) {
    res.json({ status: "error", message: "Error al eliminar troquel" });
  }
};

export {
  createTroqueles,
  getTroqueles,
  getTroquelesById,
  updateTroqueles,
  deleteTroqueles,
};
