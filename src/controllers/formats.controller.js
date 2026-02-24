import { json } from "express";
import { prisma } from "../config/db.js";

const createFormat = async (req, res) => {
  try {
    const { name } = req.body;
    const format = await prisma.format.create({
      data: { name },
    });
    res.status(201).json({
      status: "success",
      message: "Formato creado exitosamente",
      data: format,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al crear el formato",
    });
  }
};
const getFormat = async (req, res) => {
  try {
    const formats = await prisma.format.findMany();
    res.status(200).json({
      status: "success",
      data: formats,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener los formatos",
    });
  }
};
const getFormatById = async (req, res) => {
  try {
    const { id } = req.params;
    const format = await prisma.format.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!format) {
      return res.status(404).json({
        status: "error",
        message: "Formato no encontrado",
      });
    }
    res.status(200).json({
      status: "success",
      data: format,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener el formato",
    });
  }
};
const updateFormat = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;
    const formatExists = await prisma.format.findUnique({
      where: { id: parseInt(id) },
    });
    if (!formatExists) {
      return res.status(404).json({
        status: "error",
        message: "Formato no encontrado",
      });
    }
    const format = await prisma.format.update({
      where: { id: parseInt(id) },
      data: { name, is_active },
    });
    res.status(200).json({
      status: "success",
      message: "Formato actualizado exitosamente",
      data: format,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al actualizar el formato",
    });
  }
};
const deleteFormat = async (req, res) => {
  try {
    const { id } = req.params;
    const formatExists = await prisma.format.findUnique({
      where: { id: parseInt(id) },
    });
    if (!formatExists) {
      return json({
        status: "error",
        message: "Formato no encontrado",
      });
    }
    await prisma.format.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      status: "success",
      message: "Formato eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al eliminar el formato",
    });
  }
};

export { createFormat, getFormat, getFormatById, updateFormat, deleteFormat };
