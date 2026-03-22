import { prisma } from "../config/db.js";
import multer from "multer";

// Configuración de multer para archivos en memoria (20MB máximo)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ───────────── CREAR TROQUEL ─────────────
const createTroqueles = async (req, res) => {
  try {
    const { elaboration_date, size, is_active } = req.body;
    const file = req.file;

    const troquel = await prisma.troqueles.create({
      data: {
        elaboration_date: new Date(elaboration_date),
        size,
        is_active: is_active === "true",
        file: file?.buffer.toString("base64") || null, // Base64
        file_name: file?.originalname || null, // Nombre original
      },
    });

    res.status(201).json({
      status: "success",
      message: "Troquel creado exitosamente",
      data: troquel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al crear troquel",
    });
  }
};

// ───────────── OBTENER TODOS LOS TROQUELES ─────────────
const getTroqueles = async (req, res) => {
  try {
    const troqueles = await prisma.troqueles.findMany();
    res.status(200).json({
      status: "success",
      message: "Troqueles obtenidos exitosamente",
      data: troqueles,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener troqueles" });
  }
};

// ───────────── OBTENER TROQUEL POR ID ─────────────
const getTroquelesById = async (req, res) => {
  try {
    const { id } = req.params;
    const troquel = await prisma.troqueles.findUnique({
      where: { id: parseInt(id) },
    });

    if (!troquel) {
      return res
        .status(404)
        .json({ status: "error", message: "Troquel no encontrado" });
    }

    res.status(200).json({
      status: "success",
      message: "Troquel obtenido exitosamente",
      data: troquel,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener troquel" });
  }
};

// ───────────── ACTUALIZAR TROQUEL ─────────────
const updateTroqueles = async (req, res) => {
  try {
    const { id } = req.params;
    const { elaboration_date, size, is_active } = req.body;

    // Preparar datos a actualizar
    let dataToUpdate = {
      elaboration_date: new Date(elaboration_date),
      size,
      is_active: is_active === "true",
    };

    // Si hay archivo nuevo, actualizar Base64 y nombre
    if (req.file) {
      dataToUpdate.file = req.file.buffer.toString("base64");
      dataToUpdate.file_name = req.file.originalname;
    }

    const troquel = await prisma.troqueles.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.status(200).json({
      status: "success",
      message: "Troquel actualizado exitosamente",
      data: troquel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al actualizar troquel",
    });
  }
};

// ───────────── ELIMINAR TROQUEL ─────────────
const deleteTroqueles = async (req, res) => {
  try {
    const { id } = req.params;

    const ordersCount = await prisma.header_Production_Order.count({
      where: { paper_type_id: parseInt(id) },
    });

    if (ordersCount > 0) {
      return res.status(400).json({
        status: "error",
        message: `No se puede eliminar, tiene ${ordersCount} órdenes de producción asociadas`,
      });
    }

    const troquel = await prisma.troqueles.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      status: "success",
      message: "Troquel eliminado exitosamente",
      data: troquel,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al eliminar troquel" });
  }
};

export {
  createTroqueles,
  getTroqueles,
  getTroquelesById,
  updateTroqueles,
  deleteTroqueles,
  upload, // Exportamos multer para usarlo en las rutas
};
