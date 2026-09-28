-- AlterTable
ALTER TABLE "header_production_orders" ADD COLUMN     "total_expected" INTEGER;

-- Backfill de órdenes existentes:
-- total_expected = total_estimated + (sheet_divisions * cavities * pliegos_adicionales)
UPDATE "header_production_orders" h
SET "total_expected" = h."total_estimated"
  + (COALESCE(f."sheet_divisions", 1) * h."cavities" * h."amount_sheets_additional")
FROM "measures" m
JOIN "formats" f ON f."id" = m."format_id"
WHERE h."measure_id" = m."id"
  AND h."total_expected" IS NULL;
