import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";

const createPaperType = async (req, res) => {
  try {
    const { name, description, grammage, is_active } = req.body;
    const paperType = await prisma.paper_Type.create({
      data: {
        name,
        description,
        grammage,
        is_active: normalizeIsActive(is_active, true),
      },
    });
    res.status(201).json({
      status: "success",
      message: "Tipo de papel creado exitosamente",
      data: paperType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al crear el tipo de papel",
    });
  }
};
const getPaperType = async (req, res) => {
  try {
    const paperTypes = await prisma.paper_Type.findMany({
      where: buildActiveWhere(req.query),
      orderBy: { name: "asc" },
    });
    res.status(200).json({
      status: "success",
      message: "Tipos de papel obtenidos exitosamente",
      data: paperTypes,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener los tipos de papel",
    });
  }
};
const getPaperTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const paperType = await prisma.paper_Type.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!paperType) {
      return res.status(404).json({
        status: "error",
        message: "Tipo de papel no encontrado",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Tipo de papel obtenido exitosamente",
      data: paperType,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener el tipo de papel",
    });
  }
};
const updatePaperType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, grammage, is_active } = req.body;
    const paperTypeExists = await prisma.paper_Type.findUnique({
      where: { id: parseInt(id) },
    });

    if (!paperTypeExists) {
      return res.status(404).json({
        status: "error",
        message: "Tipo de papel no encontrado",
      });
    }

    const paperType = await prisma.paper_Type.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        description,
        grammage,
        is_active: normalizeIsActive(is_active, paperTypeExists.is_active),
      },
    });
    res.status(200).json({
      status: "success",
      message: "Tipo de papel actualizado exitosamente",
      data: paperType,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al actualizar el tipo de papel",
    });
  }
};
const deletePaperType = async (req, res) => {
  try {
    const { id } = req.params;
    const paperTypeExists = await prisma.paper_Type.findUnique({
      where: { id: parseInt(id) },
    });

    if (!paperTypeExists) {
      return res.status(404).json({
        status: "error",
        message: "Tipo de papel no encontrado",
      });
    }

    await prisma.paper_Type.update({
      where: { id: parseInt(id) },
      data: { is_active: false },
    });

    res.status(200).json({
      status: "success",
      message: "Tipo de papel desactivado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al desactivar el tipo de papel" });
  }
};

export {
  createPaperType,
  getPaperType,
  getPaperTypeById,
  updatePaperType,
  deletePaperType,
};
