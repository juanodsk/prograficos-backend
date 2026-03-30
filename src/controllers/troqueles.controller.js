import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";

const createTroqueles = async (req, res) => {
  try {
    const { elaboration_date, size, file, is_active } = req.body;
    const troqueles = await prisma.troqueles.create({
      data: {
        elaboration_date,
        size,
        file,
        is_active: normalizeIsActive(is_active, true),
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
    const troqueles = await prisma.troqueles.findMany({
      where: buildActiveWhere(req.query),
      orderBy: { elaboration_date: "desc" },
    });
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
    const { elaboration_date, size, file, is_active } = req.body;
    const troquelExists = await prisma.troqueles.findUnique({
      where: { id: parseInt(id) },
    });

    if (!troquelExists) {
      return res.status(404).json({
        status: "error",
        message: "Troquel no encontrado",
      });
    }

    const troquel = await prisma.troqueles.update({
      where: { id: parseInt(id) },
      data: {
        elaboration_date,
        size,
        file,
        is_active: normalizeIsActive(is_active, troquelExists.is_active),
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
    const troquelExists = await prisma.troqueles.findUnique({
      where: { id: parseInt(id) },
    });

    if (!troquelExists) {
      return res.status(404).json({
        status: "error",
        message: "Troquel no encontrado",
      });
    }

    const troquel = await prisma.troqueles.update({
      where: { id: parseInt(id) },
      data: { is_active: false },
    });

    res.status(200).json({
      status: "success",
      message: "Troquel desactivado exitosamente",
      data: troquel,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al desactivar troquel" });
  }
};

export {
  createTroqueles,
  getTroqueles,
  getTroquelesById,
  updateTroqueles,
  deleteTroqueles,
};
