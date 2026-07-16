ALTER TABLE "header_production_orders"
  ADD COLUMN "cavities" INTEGER NOT NULL DEFAULT 1;

UPDATE "header_production_orders" h
SET "cavities" = COALESCE(t."cavities", 1)
FROM "troqueles" t
WHERE h."troquel_id" = t."id";

ALTER TABLE "troqueles"
  DROP COLUMN "cavities";
