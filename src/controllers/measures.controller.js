import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";

const measureInclude = {
  format: true,
};

const createMeasure = async (req, res) => {
  try {
    const { width, height, format_id, is_active } = req.body;
    const normalizedWidth = Number(width);
    const normalizedHeight = Number(height);
    const normalizedFormatId = Number(format_id);
    const format = await prisma.format.findFirst({
      where: {
        id: normalizedFormatId,
        is_active: true,
      },
    });

    if (!format) {
      return res.status(400).json({
        status: "error",
        message: "El formato seleccionado no existe o está inactivo",
      });
    }

    const duplicateMeasure = await prisma.measure.findFirst({
      where: {
        width: normalizedWidth,
        height: normalizedHeight,
        format_id: normalizedFormatId,
      },
      include: measureInclude,
    });

    if (duplicateMeasure) {
      return res.status(400).json({
        status: "error",
        message: "Ya existe una medida registrada con ese formato y dimensiones",
        data: duplicateMeasure,
      });
    }

    const measure = await prisma.measure.create({
      data: {
        width: normalizedWidth,
        height: normalizedHeight,
        format_id: normalizedFormatId,
        is_active: normalizeIsActive(is_active, true),
      },
      include: measureInclude,
    });
    res.status(201).json({
      status: "success",
      message: "Medida creada exitosamente",
      data: measure,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al crear la medida",
    });
  }
};
const getMeasure = async (req, res) => {
  try {
    const measures = await prisma.measure.findMany({
      where: buildActiveWhere(req.query),
      include: measureInclude,
      orderBy: [{ width: "asc" }, { height: "asc" }],
    });
    res.status(200).json({
      status: "success",
      data: measures,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener las medidas",
    });
  }
};
const getMeasureById = async (req, res) => {
  try {
    const { id } = req.params;
    const measure = await prisma.measure.findUnique({
      where: {
        id: parseInt(id),
      },
      include: measureInclude,
    });
    if (!measure) {
      return res.status(404).json({
        status: "error",
        message: "Medida no encontrada",
      });
    }
    res.status(200).json({
      status: "success",
      data: measure,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener la medida",
    });
  }
};

const updateMeasure = async (req, res) => {
  try {
    const { id } = req.params;
    const { width, height, format_id, is_active } = req.body;
    const measureId = parseInt(id, 10);
    const normalizedWidth = Number(width);
    const normalizedHeight = Number(height);
    const normalizedFormatId = Number(format_id);
    const measureExists = await prisma.measure.findUnique({
      where: { id: measureId },
    });
    if (!measureExists) {
      return res
        .status(404)
        .json({ status: "error", message: "Medida no encontrada" });
    }

    const format = await prisma.format.findFirst({
      where: {
        id: normalizedFormatId,
        is_active: true,
      },
    });

    if (!format) {
      return res.status(400).json({
        status: "error",
        message: "El formato seleccionado no existe o está inactivo",
      });
    }

    const duplicateMeasure = await prisma.measure.findFirst({
      where: {
        id: { not: measureId },
        width: normalizedWidth,
        height: normalizedHeight,
        format_id: normalizedFormatId,
      },
      include: measureInclude,
    });

    if (duplicateMeasure) {
      return res.status(400).json({
        status: "error",
        message: "Ya existe una medida registrada con ese formato y dimensiones",
        data: duplicateMeasure,
      });
    }

    const measure = await prisma.measure.update({
      where: { id: measureId },
      data: {
        width: normalizedWidth,
        height: normalizedHeight,
        is_active: normalizeIsActive(is_active, measureExists.is_active),
        format: {
          connect: { id: normalizedFormatId },
        },
      },
      include: measureInclude,
    });
    res.status(200).json({
      status: "success",
      message: "Medida actualizada exitosamente",
      data: measure,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al actualizar la medida",
    });
  }
};
const deleteMeasure = async (req, res) => {
  try {
    const { id } = req.params;
    const measureExists = await prisma.measure.findUnique({
      where: { id: parseInt(id) },
    });
    if (!measureExists) {
      return res.status(404).json({
        status: "error",
        message: "Medida no encontrada",
      });
    }
    await prisma.measure.update({
      where: { id: parseInt(id) },
      data: { is_active: false },
    });
    res.status(200).json({
      status: "success",
      message: "Medida desactivada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al desactivar la medida",
    });
  }
};

export {
  createMeasure,
  getMeasure,
  getMeasureById,
  updateMeasure,
  deleteMeasure,
};
