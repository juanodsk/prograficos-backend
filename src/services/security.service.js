import { prisma } from "../config/db.js";
import { ADMIN_ROLE_NAME } from "../constants/permissions.js";

// Carga un usuario con su rol y el conjunto de permisos (claims) resuelto.
// Fuente única usada por verifyToken y profile (evita duplicar la query).
// ADMIN es superusuario: recibe TODOS los permisos (para UX en el front),
// y además queda marcado isAdmin para el bypass del backend.
export const getUserWithPermissions = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      surename: true,
      username: true,
      email: true,
      avatar: true,
      avatar_key: true,
      is_active: true,
      operates_machinery: true,
      role: {
        select: {
          id: true,
          name: true,
          label: true,
          role_permissions: {
            select: { permission: { select: { key: true } } },
          },
        },
      },
    },
  });

  if (!user) return null;

  const isAdmin = user.role?.name === ADMIN_ROLE_NAME;

  let permissions;
  if (isAdmin) {
    const all = await prisma.permission.findMany({ select: { key: true } });
    permissions = all.map((p) => p.key);
  } else {
    permissions = (user.role?.role_permissions || []).map(
      (rp) => rp.permission.key,
    );
  }

  return {
    id: user.id,
    name: user.name,
    surename: user.surename,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    avatar_key: user.avatar_key,
    is_active: user.is_active,
    operates_machinery: user.operates_machinery,
    role_id: user.role?.id ?? null,
    role: user.role?.name ?? null, // compat: req.user.role sigue siendo el nombre
    role_label: user.role?.label ?? null,
    isAdmin,
    permissions,
  };
};
