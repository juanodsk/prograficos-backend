import { prisma } from "../config/db.js";
import { ADMIN_ROLE_NAME } from "../constants/permissions.js";

// Normaliza el nombre interno del rol: MAYÚSCULAS, A-Z 0-9 _.
const normalizeRoleName = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");

// ───────────── LISTAR ROLES ─────────────
const getRoles = async (_req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: [{ is_system: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        label: true,
        description: true,
        is_system: true,
        is_active: true,
        _count: { select: { users: true, role_permissions: true } },
      },
    });

    const data = roles.map(({ _count, ...role }) => ({
      ...role,
      users_count: _count?.users ?? 0,
      permissions_count: _count?.role_permissions ?? 0,
    }));

    res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Error al obtener roles" });
  }
};

// ───────────── OBTENER ROL (con sus permisos) ─────────────
const getRoleById = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const role = await prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        label: true,
        description: true,
        is_system: true,
        is_active: true,
        role_permissions: { select: { permission_id: true } },
      },
    });

    if (!role) {
      return res.status(404).json({ status: "error", message: "Rol no encontrado" });
    }

    const { role_permissions, ...rest } = role;
    res.status(200).json({
      status: "success",
      data: {
        ...rest,
        permission_ids: role_permissions.map((rp) => rp.permission_id),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Error al obtener el rol" });
  }
};

// ───────────── CATÁLOGO DE PERMISOS ─────────────
const getPermissions = async (_req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { key: "asc" }],
      select: { id: true, key: true, label: true, module: true, description: true },
    });
    res.status(200).json({ status: "success", data: permissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Error al obtener permisos" });
  }
};

// ───────────── CREAR ROL ─────────────
const createRole = async (req, res) => {
  try {
    const name = normalizeRoleName(req.body?.name);
    const label = req.body?.label?.trim();
    const description = req.body?.description?.trim() || null;

    if (!name || name.length < 3) {
      return res.status(400).json({
        status: "error",
        message: "El nombre interno del rol es obligatorio (mínimo 3, A-Z 0-9 _)",
      });
    }
    if (!label) {
      return res
        .status(400)
        .json({ status: "error", message: "La etiqueta del rol es obligatoria" });
    }

    const exists = await prisma.role.findUnique({ where: { name } });
    if (exists) {
      return res
        .status(400)
        .json({ status: "error", message: "Ya existe un rol con ese nombre" });
    }

    const role = await prisma.role.create({
      data: { name, label, description, is_system: false, is_active: true },
    });

    res.status(201).json({
      status: "success",
      message: "Rol creado exitosamente",
      data: role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Error al crear el rol" });
  }
};

// ───────────── ACTUALIZAR ROL ─────────────
// El `name` es inmutable (el código referencia los roles por nombre).
const updateRole = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return res.status(404).json({ status: "error", message: "Rol no encontrado" });
    }

    const label = req.body?.label?.trim();
    const description = req.body?.description?.trim() || null;
    const is_active = req.body?.is_active;

    if (label !== undefined && !label) {
      return res
        .status(400)
        .json({ status: "error", message: "La etiqueta del rol es obligatoria" });
    }

    // Los roles de sistema no se pueden desactivar (el código depende de ellos).
    const data = {
      ...(label !== undefined && { label }),
      ...(description !== undefined && { description }),
      ...(is_active !== undefined && !role.is_system && {
        is_active: Boolean(is_active),
      }),
    };

    const updated = await prisma.role.update({ where: { id }, data });
    res.status(200).json({
      status: "success",
      message: "Rol actualizado exitosamente",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Error al actualizar el rol" });
  }
};

// ───────────── ELIMINAR ROL ─────────────
const deleteRole = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const role = await prisma.role.findUnique({
      where: { id },
      select: { id: true, is_system: true, _count: { select: { users: true } } },
    });

    if (!role) {
      return res.status(404).json({ status: "error", message: "Rol no encontrado" });
    }
    if (role.is_system) {
      return res.status(400).json({
        status: "error",
        message: "No se puede eliminar un rol del sistema",
      });
    }
    if (role._count.users > 0) {
      return res.status(400).json({
        status: "error",
        message: "No se puede eliminar un rol con usuarios asignados",
      });
    }

    await prisma.role.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "Rol eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Error al eliminar el rol" });
  }
};

// ───────────── ASIGNAR PERMISOS A UN ROL ─────────────
const updateRolePermissions = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return res.status(404).json({ status: "error", message: "Rol no encontrado" });
    }
    if (role.name === ADMIN_ROLE_NAME) {
      return res.status(400).json({
        status: "error",
        message: "El rol ADMIN ya tiene todos los permisos (superusuario)",
      });
    }

    const permissionIds = Array.isArray(req.body?.permissionIds)
      ? [...new Set(req.body.permissionIds.map((n) => Number(n)).filter(Boolean))]
      : [];

    // Solo se aceptan ids de permisos existentes.
    const validPermissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
      select: { id: true },
    });
    const validIds = validPermissions.map((p) => p.id);

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { role_id: id } }),
      prisma.rolePermission.createMany({
        data: validIds.map((permission_id) => ({ role_id: id, permission_id })),
        skipDuplicates: true,
      }),
    ]);

    res.status(200).json({
      status: "success",
      message: "Permisos del rol actualizados",
      data: { permission_ids: validIds },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al actualizar los permisos del rol" });
  }
};

export {
  getRoles,
  getRoleById,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
};
