import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        surename: true,
        email: true,
        role: true,
        avatar: true,
        is_active: true,
        createdAt: true,
      },
      orderBy: [{ is_active: "desc" }, { name: "asc" }, { surename: "asc" }],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, surename, email, password, role, avatar, is_active } = req.body;

    // Solo ADMIN puede crear usuarios ADMIN
    if (role === "ADMIN" && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "No tienes permiso para crear usuarios con rol ADMIN",
      });
    }

    const validRoles = ["ADMIN", "SUPERVISOR", "EMPLOYEE", "USER"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true, is_active: true },
    });

    if (userExists) {
      return res.status(400).json({
        message: userExists.is_active
          ? "Ya existe un usuario con este email"
          : "Ya existe un usuario inactivo con este email. Reactívalo editando el registro existente",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        surename,
        email,
        password: hashedPassword,
        role: role || "USER",
        is_active: is_active !== undefined ? Boolean(is_active) : true,
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        name: true,
        surename: true,
        email: true,
        role: true,
        avatar: true,
        is_active: true,
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

    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        name: true,
        surename: true,
        email: true,
        role: true,
        avatar: true,
        is_active: true,
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
    const { name, surename, email, password, role, avatar, is_active } = req.body;

    const userExists = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Solo ADMIN puede editar ADMIN
    if (userExists.role === "ADMIN" && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Solo un administrador puede editar usuarios ADMIN",
      });
    }

    // Validación cambio de rol
    if (role) {
      const rolesPermitidosSupervisor = ["EMPLOYEE", "USER", "SUPERVISOR"];

      if (
        req.user.role === "SUPERVISOR" &&
        !rolesPermitidosSupervisor.includes(role)
      ) {
        return res.status(403).json({
          message: "Un supervisor solo puede asignar roles EMPLOYEE o USER",
        });
      }

      if (req.user.role !== "ADMIN" && req.user.role !== "SUPERVISOR") {
        return res.status(403).json({
          message: "No tienes permisos para cambiar roles",
        });
      }
    }

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
        ...(avatar && { avatar }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
      select: {
        id: true,
        name: true,
        surename: true,
        email: true,
        role: true,
        avatar: true,
        is_active: true,
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

    // No puede eliminarse a sí mismo
    if (req.user.id === parseInt(id)) {
      return res
        .status(400)
        .json({ message: "No puedes eliminarte a ti mismo" });
    }

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

    // Soft delete
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        is_active: false,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Usuario desactivado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

export { getUsers, createUser, getUserById, updateUser, deleteUser };
