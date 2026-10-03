import { prisma } from "../config/db.js";
import {
  SYSTEM_ROLES,
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
} from "../constants/permissions.js";

// Sincroniza la seguridad en el arranque, de forma idempotente y NO destructiva:
//  - Garantiza que existan los roles de sistema (sin pisar los existentes).
//  - Hace upsert del catálogo de permisos definido en código.
//  - Siembra role_permissions por defecto SOLO para roles que aún no tengan
//    ninguno asignado (así no se sobreescriben los cambios del admin).
export const syncSecurity = async () => {
  // 1) Roles de sistema
  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { is_system: true },
      create: {
        name: role.name,
        label: role.label,
        description: role.description,
        is_system: true,
      },
    });
  }

  // 2) Catálogo de permisos (fuente de verdad = código)
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { label: perm.label, module: perm.module, description: perm.description ?? null },
      create: {
        key: perm.key,
        label: perm.label,
        module: perm.module,
        description: perm.description ?? null,
      },
    });
  }

  // 3) Asignaciones por defecto, solo si el rol no tiene permisos aún
  const permByKey = new Map(
    (await prisma.permission.findMany({ select: { id: true, key: true } })).map((p) => [
      p.key,
      p.id,
    ]),
  );

  for (const [roleName, keys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    const existingCount = await prisma.rolePermission.count({
      where: { role_id: role.id },
    });
    if (existingCount > 0) continue; // ya configurado: no tocar

    const data = keys
      .map((key) => permByKey.get(key))
      .filter(Boolean)
      .map((permission_id) => ({ role_id: role.id, permission_id }));

    if (data.length > 0) {
      await prisma.rolePermission.createMany({ data, skipDuplicates: true });
    }
  }
};
