import { prisma } from "../config/db.js";

const createThirds = async (req, res) => {
  try {
    const { name, email, address, type_person, company_name } = req.body;
    const thirdExists = await prisma.thirds.findUnique({
      where: { email },
    });
    if (thirdExists) {
      return res
        .status(400)
        .json({ message: "Tercero ya existe con este email" });
    }
    const third = await prisma.thirds.create({
      data: {
        name,
        email,
        address,
        type_person,
        company_name,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Tercero creado exitosamente",
      data: { third },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al crear tercero" });
  }
};
const getThirds = async (req, res) => {
  try {
    const thirds = await prisma.thirds.findMany();
    res.status(200).json({
      status: "success",
      message: "Terceros obtenidos exitosamente",
      data: { thirds },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener terceros" });
  }
};
const getThirdsById = async (req, res) => {
  try {
    const { id } = req.params;
    const third = await prisma.thirds.findUnique({
      where: { id: parseInt(id) },
    });
    if (!third) {
      return res.status(404).json({
        status: "error",
        message: "Tercero no encontrado",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Tercero obtenido exitosamente",
      data: { third },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener tercero" });
  }
};
const updateThirds = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, type_person, company_name, is_active } =
      req.body;

    const thirdExists = await prisma.thirds.findUnique({
      where: { id: parseInt(id) },
    });
    if (!thirdExists) {
      return res.status(404).json({
        status: "error",
        message: "Tercero no encontrado",
      });
    }
    const third = await prisma.thirds.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        address,
        type_person,
        company_name,
        is_active,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Tercero actualizado exitosamente",
      data: { third },
    });
  } catch (error) {
    res.json
      .status(500)
      .json({ status: "error", message: "Error al actualizar tercero" });
  }
};
const deleteThirds = async (req, res) => {
  try {
    const { id } = req.params;
    const thirdExists = await prisma.thirds.findUnique({
      where: { id: parseInt(id) },
    });
    if (!thirdExists) {
      return res.status(404).json({
        status: "error",
        message: "Tercero no encontrado",
      });
    }
    await prisma.thirds.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      status: "success",
      message: "Tercero eliminado exitosamente",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al eliminar tercero" });
  }
};

export { createThirds, getThirds, getThirdsById, updateThirds, deleteThirds };
