-- El producto ahora pertenece a UNA línea de servicio (obligatorio).
-- Backfill de UNA SOLA VEZ: los productos existentes quedan en "Offset".

-- 1) Asegura que exista la línea "Offset" (idempotente, sin depender del seed).
INSERT INTO "service_lines" ("name", "is_active")
VALUES ('Offset', true)
ON CONFLICT ("name") DO NOTHING;

-- 2) Agrega la columna como NULLABLE temporalmente (hay filas existentes).
ALTER TABLE "products" ADD COLUMN "service_line_id" INTEGER;

-- 3) Asigna "Offset" a todos los productos existentes a la fecha.
UPDATE "products"
SET "service_line_id" = (SELECT "id" FROM "service_lines" WHERE "name" = 'Offset')
WHERE "service_line_id" IS NULL;

-- 4) Ahora sí, la vuelve obligatoria.
ALTER TABLE "products" ALTER COLUMN "service_line_id" SET NOT NULL;

-- 5) Llave foránea.
ALTER TABLE "products" ADD CONSTRAINT "products_service_line_id_fkey" FOREIGN KEY ("service_line_id") REFERENCES "service_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
