DROP INDEX IF EXISTS "troqueles_code_key";

CREATE UNIQUE INDEX "troqueles_size_code_key"
ON "troqueles"("size", "code");

DROP INDEX IF EXISTS "products_troquel_id_third_id_key";
