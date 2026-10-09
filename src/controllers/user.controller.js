import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { HttpError } from "../utils/httpError.js";
import {
  uploadUserAvatar,
  removeUserAvatar,
  attachAvatarUrl,
  attachAvatarUrls,
} from "../services/userAvatar.service.js";
import {
  buildInsensitiveContains,
  buildPaginationMeta,
  parsePagination,
  parseSort,
} from "../utils/pagination.js";

// Selección estándar del usuario con su rol (relación).
const userSelect = {
  id: true,
  name: true,
  surename: true,
  username: true,
  email: true,
  role: { select: { id: true, name: true, label: true } },
  avatar: true,
  is_active: true,
  operates_machinery: true,
  avatar_key: true,
  createdAt: true,
};

// Aplana el rol a string (nombre) para no romper la UI actual de usuarios.
const flattenRole = (user) =>
  user
    ? {
        ...user,
        role: user.role?.name ?? null,
        role_label: user.role?.label ?? null,
        role_id: user.role?.id ?? null,
      }
    : user;

// username: minúsculas, sin espacios, solo [a-z0-9._-].
const normalizeUsername = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");

// Resuelve un rol por nombre (debe existir y estar activo).
const resolveRole = (roleName) =>
  prisma.role.findFirst({ where: { name: roleName, is_active: true } });

const buildUserSearchWhere = (rawSearch) => {
  const search = rawSearch?.trim();

  if (!search) {
    return {};
  }

  const numericSearch = Number.parseInt(search, 10);

  const or = [
    { name: buildInsensitiveContains(search) },
    { surename: buildInsensitiveContains(search) },
    { username: buildInsensitiveContains(search) },
    { email: buildInsensitiveContains(search) },
    { role: { is: { name: buildInsensitiveContains(search) } } },
    { role: { is: { label: buildInsensitiveContains(search) } } },
  ];

  if (!Number.isNaN(numericSearch)) {
    or.push({ id: numericSearch });
  }

  return { OR: or };
};

const userSortMap = {
  name: (direction) => [{ name: direction }, { surename: direction }],
  username: (direction) => [{ username: direction }],
  email: (direction) => [{ email: direction }],
  role: (direction) => [{ role: { name: direction } }, { name: "asc" }],
  is_active: (direction) => [
    { is_active: direction },
    { name: "asc" },
    { surename: "asc" },
  ],
};

const getUsers = async (req, res) => {
  try {
    const { page: requestedPage, pageSize } = parsePagination(req.query);
    const { sortBy, sortDirection } = parseSort(req.query, {
      allowedSortBy: Object.keys(userSortMap),
      fallbackSortBy: "is_active",
      fallbackSortDirection: "desc",
    });
    const where = buildUserSearchWhere(req.query?.search);
    const total = await prisma.user.count({ where });
    const meta = buildPaginationMeta(requestedPage, pageSize, total);

    const users = await prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: userSortMap[sortBy](sortDirection),
      skip: (meta.page - 1) * meta.pageSize,
      take: meta.pageSize,
    });

    res.json({
      status: "success",
      data: await attachAvatarUrls(users.map(flattenRole)),
      meta,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, surename, email, password, role, avatar, is_active, operates_machinery } =
      req.body;
    const username = normalizeUsername(req.body?.username);

    // El rol es obligatorio (sin default).
    if (!role) {
      return res.status(400).json({ message: "El rol es obligatorio" });
    }

    // Solo ADMIN puede crear usuarios ADMIN
    if (role === "ADMIN" && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "No tienes permiso para crear usuarios con rol ADMIN",
      });
    }

    const roleRecord = await resolveRole(role);
    if (!roleRecord) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    if (!username || username.length < 6) {
      return res.status(400).json({
        message: "El username es obligatorio (mínimo 6 caracteres, sin espacios)",
      });
    }

    const usernameExists = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "Ya existe un usuario con ese username" });
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
        username,
        email,
        password: hashedPassword,
        role_id: roleRecord.id,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
        operates_machinery: Boolean(operates_machinery),
        ...(avatar && { avatar }),
      },
      select: userSelect,
    });

    res.status(201).json({
      status: "success",
      message: "Usuario creado exitosamente",
      data: { user: await attachAvatarUrl(flattenRole(user)) },
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
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      status: "success",
      data: { user: await attachAvatarUrl(flattenRole(user)) },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surename, email, password, role, avatar, is_active, operates_machinery } =
      req.body;

    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { role: { select: { name: true } } },
    });

    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Solo ADMIN puede editar ADMIN
    if (userExists.role?.name === "ADMIN" && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Solo un administrador puede editar usuarios ADMIN",
      });
    }

    // Validación y resolución de cambio de rol
    let roleId;
    if (role) {
      const rolesPermitidosSupervisor = ["OPERATOR", "SUPERVISOR"];

      if (
        req.user.role === "SUPERVISOR" &&
        !rolesPermitidosSupervisor.includes(role)
      ) {
        return res.status(403).json({
          message: "Un supervisor solo puede asignar roles OPERATOR o SUPERVISOR",
        });
      }

      if (req.user.role !== "ADMIN" && req.user.role !== "SUPERVISOR") {
        return res.status(403).json({
          message: "No tienes permisos para cambiar roles",
        });
      }

      const roleRecord = await resolveRole(role);
      if (!roleRecord) {
        return res.status(400).json({ message: "Rol inválido" });
      }
      roleId = roleRecord.id;
    }

    // username opcional: si llega, se sanea y valida unicidad
    let username;
    if (req.body?.username !== undefined) {
      username = normalizeUsername(req.body.username);
      if (!username || username.length < 6) {
        return res.status(400).json({
          message: "El username debe tener al menos 6 caracteres y sin espacios",
        });
      }
      const taken = await prisma.user.findFirst({
        where: { username, id: { not: parseInt(id) } },
        select: { id: true },
      });
      if (taken) {
        return res
          .status(400)
          .json({ message: "Ya existe un usuario con ese username" });
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
        ...(username && { username }),
        ...(email && { email }),
        ...(password && { password: hashedPassword }),
        ...(roleId && { role_id: roleId }),
        ...(avatar && { avatar }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
        ...(operates_machinery !== undefined && {
          operates_machinery: Boolean(operates_machinery),
        }),
      },
      select: userSelect,
    });

    res.status(200).json({
      status: "success",
      message: "Usuario actualizado exitosamente",
      data: { user: await attachAvatarUrl(flattenRole(user)) },
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
      include: { role: { select: { name: true } } },
    });

    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Solo ADMIN puede eliminar ADMIN o SUPERVISOR
    if (
      ["ADMIN", "SUPERVISOR"].includes(userExists.role?.name) &&
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

// Verifica si un username ya está en uso (para validación en blur del form).
const checkUsername = async (req, res) => {
  try {
    const username = normalizeUsername(req.query?.username);
    const excludeId = req.query?.excludeId ? Number(req.query.excludeId) : null;

    if (!username) {
      return res
        .status(400)
        .json({ status: "error", message: "username requerido" });
    }

    const existing = await prisma.user.findFirst({
      where: {
        username,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    res.status(200).json({
      status: "success",
      data: { exists: Boolean(existing) },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al verificar el username" });
  }
};

// Lista de usuarios que operan maquinaria (flag operates_machinery) y activos,
// sin importar el rol (un SUPERVISOR también puede operar).
const getOperators = async (_req, res) => {
  try {
    const operators = await prisma.user.findMany({
      where: { operates_machinery: true, is_active: true },
      select: { id: true, name: true, surename: true, email: true },
      orderBy: [{ name: "asc" }, { surename: "asc" }],
    });

    res.status(200).json({
      status: "success",
      message: "Operarios obtenidos exitosamente",
      data: operators,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener los operarios",
    });
  }
};

// Sube/reemplaza el avatar del usuario (imagen ya recortada y ≤1MB del front).
const uploadAvatar = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res
        .status(400)
        .json({ status: "error", message: "El id del usuario no es válido" });
    }

    const result = await uploadUserAvatar(userId, req.file);

    res.status(200).json({
      status: "success",
      message: "Avatar actualizado exitosamente",
      data: result,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res
        .status(error.status)
        .json({ status: "error", message: error.message });
    }
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al actualizar el avatar" });
  }
};

// Quita la foto de perfil del usuario (la borra de R2).
const removeAvatar = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res
        .status(400)
        .json({ status: "error", message: "El id del usuario no es válido" });
    }

    const result = await removeUserAvatar(userId);

    res.status(200).json({
      status: "success",
      message: "Foto de perfil eliminada",
      data: result,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res
        .status(error.status)
        .json({ status: "error", message: error.message });
    }
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al eliminar la foto" });
  }
};

export {
  getUsers,
  getOperators,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  checkUsername,
  uploadAvatar,
  removeAvatar,
};
