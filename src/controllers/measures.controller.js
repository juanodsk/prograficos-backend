import { prisma } from "../config/db.js";

const createMeasure = async (req, res) => {
  try {
    const { width, height, format_id } = req.body;
    const measure = await prisma.measure.create({
      data: {
        width,
        height,
        format_id,
      },
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
    const measures = await prisma.measure.findMany();
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
    const { width, height, format_id } = req.body;
    const measureExists = await prisma.measure.findUnique({
      where: { id: parseInt(id) },
    });
    if (!measureExists) {
      return res
        .status(404)
        .json({ status: "error", message: "Medida no encontrada" });
    }
    const measure = await prisma.measure.update({
      where: { id: parseInt(id) },
      data: {
        width,
        height,
        format: {
          connect: { id: format_id },
        },
      },
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
    const ordersCount = await prisma.header_Production_Order.count({
      where: { paper_type_id: parseInt(id) },
    });

    if (ordersCount > 0) {
      return res.status(400).json({
        status: "error",
        message: `No se puede eliminar, tiene ${ordersCount} órdenes de producción asociadas`,
      });
    }

    await prisma.measure.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      status: "success",
      message: "Medida eliminada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al eliminar la medida",
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
