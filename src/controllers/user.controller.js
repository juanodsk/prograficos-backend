import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};
const createUser = async (req, res) => {
  try {
    const { name, surename, email, password, role, avatar } = req.body;

    //ROLE VALIDATION//
    const validRoles = ["ADMIN", "SUPERVISOR", "EMPLOYEE", "USER"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Rol Invalido" });
    }

    // Verificar si el usuario ya existe
    const userExists = await prisma.user.findUnique({
      where: { email },
    });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Usuario ya existe con este email" });
    }
    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //CREATE USER

    const user = await prisma.user.create({
      data: {
        name,
        surename,
        email,
        password: hashedPassword,
        role: role || "USER",
        avatar,
      },
      select: {
        id: true,
        name: true,
        surename: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Usuario creado exitosamente",
      data: { user },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        name: true,
        surename: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surename, email, password, role } = req.body;

    // Solo ADMIN puede cambiar roles
    if (role && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Solo un administrador puede cambiar roles",
      });
    }

    // Verificar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si viene contraseña nueva, hashearla
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(surename && { surename }),
        ...(email && { email }),
        ...(password && { password: hashedPassword }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        surename: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Usuario actualizado exitosamente",
      data: { user },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const ordersCount = await prisma.header_Production_Order.count({
      where: { user_id: parseInt(id) },
    });

    if (ordersCount > 0) {
      return res.status(400).json({
        status: "error",
        message: `No se puede eliminar, tiene ${ordersCount} órdenes de producción asociadas`,
      });
    }

    // No puede eliminarse a sí mismo
    if (req.user.id === parseInt(id)) {
      return res
        .status(400)
        .json({ message: "No puedes eliminarte a ti mismo" });
    }

    // Verificar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Solo ADMIN puede eliminar ADMIN o SUPERVISOR
    if (
      ["ADMIN", "SUPERVISOR"].includes(userExists.role) &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        message: "Solo un administrador puede eliminar admins o supervisores",
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      status: "success",
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

export { getUsers, createUser, getUserById, updateUser, deleteUser };
