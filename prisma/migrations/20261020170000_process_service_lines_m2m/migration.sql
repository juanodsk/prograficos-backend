-- El proceso pasa de pertenecer a UNA línea a pertenecer a 1 o varias (m2m).
-- Migración que PRESERVA datos: pasa el service_line_id actual al pivote y
-- luego elimina la columna. Corre una sola vez.

-- 1) Tabla pivote implícita de Prisma (_ProcessToServiceLine): A=Process, B=ServiceLine.
CREATE TABLE "_ProcessToServiceLine" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProcessToServiceLine_AB_unique" ON "_ProcessToServiceLine"("A", "B");

-- CreateIndex
CREATE INDEX "_ProcessToServiceLine_B_index" ON "_ProcessToServiceLine"("B");

-- AddForeignKey
ALTER TABLE "_ProcessToServiceLine" ADD CONSTRAINT "_ProcessToServiceLine_A_fkey" FOREIGN KEY ("A") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcessToServiceLine" ADD CONSTRAINT "_ProcessToServiceLine_B_fkey" FOREIGN KEY ("B") REFERENCES "service_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2) Backfill: cada proceso conserva su línea actual como primera relación.
INSERT INTO "_ProcessToServiceLine" ("A", "B")
SELECT "id", "service_line_id" FROM "processes"
WHERE "service_line_id" IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3) Elimina la FK y la columna escalar anterior.
ALTER TABLE "processes" DROP CONSTRAINT "processes_service_line_id_fkey";
ALTER TABLE "processes" DROP COLUMN "service_line_id";
