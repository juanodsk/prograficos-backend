-- ============================================================
-- RBAC relacional: roles, permisos y migración de users.role (enum) -> role_id
-- ============================================================

-- 1) Tablas de seguridad
CREATE TABLE "roles" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

CREATE TABLE "permissions" (
  "id" SERIAL NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

CREATE TABLE "role_permissions" (
  "id" SERIAL NOT NULL,
  "role_id" INTEGER NOT NULL,
  "permission_id" INTEGER NOT NULL,
  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey"
  FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2) Roles base del sistema (is_system = no eliminables)
INSERT INTO "roles" ("name","label","description","is_system","is_active","createdAt","updatedAt") VALUES
  ('ADMIN','Administrador','Acceso total al sistema',true,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('SUPERVISOR','Supervisor','Gestión operativa y de catálogos',true,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('OPERATOR','Operario','Operación de órdenes y procesos',true,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('CUSTOMER','Cliente','Portal del cliente',true,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- 3) Nuevas columnas en users (nullable para backfill)
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "role_id" INTEGER;

-- 4) Backfill username = parte local del email (saneada, única con sufijo id si choca)
UPDATE "users" u
SET "username" = base.uname
FROM (
  SELECT id,
    CASE WHEN cnt > 1 THEN uname || '_' || id ELSE uname END AS uname
  FROM (
    SELECT id,
      COALESCE(NULLIF(lower(regexp_replace(split_part("email", '@', 1), '[^a-z0-9._-]', '', 'g')), ''), 'user') AS uname,
      COUNT(*) OVER (
        PARTITION BY COALESCE(NULLIF(lower(regexp_replace(split_part("email", '@', 1), '[^a-z0-9._-]', '', 'g')), ''), 'user')
      ) AS cnt
    FROM "users"
  ) x
) base
WHERE u.id = base.id;

-- 5) Backfill role_id desde el enum actual; cualquier resto (p.ej. USER) -> OPERATOR
UPDATE "users" u SET "role_id" = r.id
  FROM "roles" r WHERE r.name = u."role"::text;
UPDATE "users" SET "role_id" = (SELECT id FROM "roles" WHERE name = 'OPERATOR')
  WHERE "role_id" IS NULL;

-- 6) Volver obligatorias las columnas y aplicar unicidad + FK
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7) Eliminar el enum anterior
ALTER TABLE "users" DROP COLUMN "role";
DROP TYPE "Role";
