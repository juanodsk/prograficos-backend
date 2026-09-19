-- AlterTable: soft delete de troqueles
ALTER TABLE "troqueles" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Unicidad (size, code) SOLO entre no borrados: al soft-deletear (deleted_at NOT
-- NULL) se libera el código para reutilizarlo en un troquel nuevo.
DROP INDEX "troqueles_size_code_key";
CREATE UNIQUE INDEX "troqueles_size_code_active_key" ON "troqueles" ("size", "code") WHERE "deleted_at" IS NULL;
