-- El proceso ahora pertenece a UNA línea de servicio (obligatorio).
-- Backfill de UNA SOLA VEZ: los procesos existentes quedan en "Offset".

-- 1) Asegura que exista la línea "Offset" (idempotente, sin depender del seed).
INSERT INTO "service_lines" ("name", "is_active")
VALUES ('Offset', true)
ON CONFLICT ("name") DO NOTHING;

-- 2) Agrega la columna como NULLABLE temporalmente (hay filas existentes).
ALTER TABLE "processes" ADD COLUMN "service_line_id" INTEGER;

-- 3) Asigna "Offset" a todos los procesos existentes a la fecha.
UPDATE "processes"
SET "service_line_id" = (SELECT "id" FROM "service_lines" WHERE "name" = 'Offset')
WHERE "service_line_id" IS NULL;

-- 4) Ahora sí, la vuelve obligatoria.
ALTER TABLE "processes" ALTER COLUMN "service_line_id" SET NOT NULL;

-- 5) Llave foránea.
ALTER TABLE "processes" ADD CONSTRAINT "processes_service_line_id_fkey" FOREIGN KEY ("service_line_id") REFERENCES "service_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
