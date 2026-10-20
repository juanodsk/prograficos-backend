import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";

// Líneas de servicio (Offset, Cartón Microcorrugado, Serigrafía…). Catálogo
// simple: nombre único, descripción opcional y estado activo/inactivo.

const getServiceLines = async (req, res) => {
  try {
    const lines = await prisma.serviceLine.findMany({
      where: buildActiveWhere(req.query),
      orderBy: [{ name: "asc" }],
    });
    res.status(200).json({ status: "success", data: lines });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener las líneas de servicio",
    });
  }
};

const getServiceLineById = async (req, res) => {
  try {
    const line = await prisma.serviceLine.findUnique({
      where: { id: Number.parseInt(req.params.id, 10) },
    });
    if (!line) {
      return res
        .status(404)
        .json({ status: "error", message: "Línea de servicio no encontrada" });
    }
    res.status(200).json({ status: "success", data: line });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener la línea de servicio",
    });
  }
};

const createServiceLine = async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const description = req.body?.description?.trim() || null;

    if (!name) {
      return res
        .status(400)
        .json({ status: "error", message: "El nombre es obligatorio" });
    }

    const exists = await prisma.serviceLine.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (exists) {
      return res.status(400).json({
        status: "error",
        message: "Ya existe una línea de servicio con ese nombre",
      });
    }

    const line = await prisma.serviceLine.create({
      data: {
        name,
        description,
        is_active: normalizeIsActive(req.body?.is_active, true),
      },
    });
    res.status(201).json({
      status: "success",
      message: "Línea de servicio creada exitosamente",
      data: line,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al crear la línea de servicio",
    });
  }
};

const updateServiceLine = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const line = await prisma.serviceLine.findUnique({ where: { id } });
    if (!line) {
      return res
        .status(404)
        .json({ status: "error", message: "Línea de servicio no encontrada" });
    }

    const name = req.body?.name?.trim();
    const description = req.body?.description?.trim() || null;

    if (!name) {
      return res
        .status(400)
        .json({ status: "error", message: "El nombre es obligatorio" });
    }

    const duplicate = await prisma.serviceLine.findFirst({
      where: {
        id: { not: id },
        name: { equals: name, mode: "insensitive" },
      },
    });
    if (duplicate) {
      return res.status(400).json({
        status: "error",
        message: "Ya existe una línea de servicio con ese nombre",
      });
    }

    const updated = await prisma.serviceLine.update({
      where: { id },
      data: {
        name,
        description,
        is_active: normalizeIsActive(req.body?.is_active, line.is_active),
      },
    });
    res.status(200).json({
      status: "success",
      message: "Línea de servicio actualizada exitosamente",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al actualizar la línea de servicio",
    });
  }
};

const deleteServiceLine = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const line = await prisma.serviceLine.findUnique({ where: { id } });
    if (!line) {
      return res
        .status(404)
        .json({ status: "error", message: "Línea de servicio no encontrada" });
    }

    await prisma.serviceLine.delete({ where: { id } });
    res.status(200).json({
      status: "success",
      message: "Línea de servicio eliminada exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar la línea de servicio",
    });
  }
};

export {
  getServiceLines,
  getServiceLineById,
  createServiceLine,
  updateServiceLine,
  deleteServiceLine,
};
