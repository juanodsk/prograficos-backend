import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";

const createPaperType = async (req, res) => {
  try {
    const { name, description, grammage, is_active } = req.body;
    const normalizedName = name?.trim();
    const normalizedDescription = description?.trim();
    const normalizedGrammage = Number(grammage);

    const duplicatePaperType = await prisma.paper_Type.findFirst({
      where: {
        name: normalizedName,
        description: normalizedDescription,
        grammage: normalizedGrammage,
      },
    });

    if (duplicatePaperType) {
      return res.status(400).json({
        status: "error",
        message: "Ya existe un tipo de papel con ese nombre, descripcion y gramaje",
        data: duplicatePaperType,
      });
    }

    const paperType = await prisma.paper_Type.create({
      data: {
        name: normalizedName,
        description: normalizedDescription,
        grammage: normalizedGrammage,
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
    const paperTypeId = parseInt(id, 10);
    const normalizedName = name?.trim();
    const normalizedDescription = description?.trim();
    const normalizedGrammage = Number(grammage);
    const paperTypeExists = await prisma.paper_Type.findUnique({
      where: { id: paperTypeId },
    });

    if (!paperTypeExists) {
      return res.status(404).json({
        status: "error",
        message: "Tipo de papel no encontrado",
      });
    }

    const duplicatePaperType = await prisma.paper_Type.findFirst({
      where: {
        id: { not: paperTypeId },
        name: normalizedName,
        description: normalizedDescription,
        grammage: normalizedGrammage,
      },
    });

    if (duplicatePaperType) {
      return res.status(400).json({
        status: "error",
        message: "Ya existe un tipo de papel con ese nombre, descripcion y gramaje",
        data: duplicatePaperType,
      });
    }

    const paperType = await prisma.paper_Type.update({
      where: {
        id: paperTypeId,
      },
      data: {
        name: normalizedName,
        description: normalizedDescription,
        grammage: normalizedGrammage,
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
