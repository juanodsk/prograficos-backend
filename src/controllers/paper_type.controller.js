import { prisma } from "../config/db.js";

const createPaperType = async (req, res) => {
  try {
    const { name, description, grammage, is_active } = req.body;
    const paperType = await prisma.paper_Type.create({
      data: {
        name,
        description,
        grammage,
        is_active,
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
    const paperTypes = await prisma.paper_Type.findMany();
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
    const paperType = await prisma.paper_Type.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        description,
        grammage,
        is_active,
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

    // Verificar si tiene órdenes asociadas
    const ordersCount = await prisma.header_Production_Order.count({
      where: { paper_type_id: parseInt(id) },
    });

    if (ordersCount > 0) {
      return res.status(400).json({
        status: "error",
        message: `No se puede eliminar, tiene ${ordersCount} órdenes de producción asociadas`,
      });
    }

    await prisma.paper_Type.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      status: "success",
      message: "Tipo de papel eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el tipo de papel" });
  }
};

export {
  createPaperType,
  getPaperType,
  getPaperTypeById,
  updatePaperType,
  deletePaperType,
};
