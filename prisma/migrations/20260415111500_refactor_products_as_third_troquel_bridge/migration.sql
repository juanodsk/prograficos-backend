ALTER TABLE "header_production_orders"
  ADD COLUMN "product_id" INTEGER;

ALTER TABLE "products" RENAME TO "products_legacy";
ALTER TABLE "products_legacy" RENAME CONSTRAINT "products_pkey" TO "products_legacy_pkey";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S'
      AND c.relname = 'products_id_seq'
      AND n.nspname = 'public'
  ) THEN
    ALTER SEQUENCE "products_id_seq" RENAME TO "products_legacy_id_seq";
  END IF;
END $$;

ALTER INDEX IF EXISTS "products_name_key" RENAME TO "products_legacy_name_key";

CREATE TABLE "products" (
  "id" SERIAL NOT NULL,
  "troquel_id" INTEGER NOT NULL,
  "third_id" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "products_troquel_id_third_id_key"
ON "products"("troquel_id", "third_id");

ALTER TABLE "products"
  ADD CONSTRAINT "products_troquel_id_fkey"
    FOREIGN KEY ("troquel_id") REFERENCES "troqueles"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "products_third_id_fkey"
    FOREIGN KEY ("third_id") REFERENCES "thirds"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "products" ("troquel_id", "third_id", "is_active")
SELECT DISTINCT
  h."troquel_id",
  pc."third_id",
  COALESCE(pc."is_active", TRUE)
FROM "header_production_orders" h
JOIN "product_customer" pc
  ON pc."id" = h."product_customer_id";

UPDATE "header_production_orders" h
SET "product_id" = p."id"
FROM "product_customer" pc,
     "products" p
WHERE h."product_customer_id" = pc."id"
  AND p."troquel_id" = h."troquel_id"
  AND p."third_id" = pc."third_id";

DELETE FROM "products"
WHERE "id" NOT IN (
  SELECT DISTINCT "product_id"
  FROM "header_production_orders"
  WHERE "product_id" IS NOT NULL
);

ALTER TABLE "header_production_orders"
  ALTER COLUMN "product_id" SET NOT NULL;

ALTER TABLE "header_production_orders"
  ADD CONSTRAINT "header_production_orders_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "header_production_orders"
  DROP CONSTRAINT IF EXISTS "header_production_orders_product_customer_id_fkey";

ALTER TABLE "header_production_orders"
  DROP COLUMN "product_customer_id";

DROP TABLE IF EXISTS "product_customer";
DROP TABLE IF EXISTS "products_legacy";
