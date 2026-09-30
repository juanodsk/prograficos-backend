-- AlterTable: prefijo único del cliente
ALTER TABLE "thirds" ADD COLUMN "prefix" VARCHAR(4);

-- AlterTable: código del producto (prefijo + número), único por cliente
ALTER TABLE "products" ADD COLUMN "code" VARCHAR(7);

-- CreateIndex
CREATE UNIQUE INDEX "thirds_prefix_key" ON "thirds"("prefix");

-- CreateIndex
CREATE UNIQUE INDEX "products_third_id_code_key" ON "products"("third_id", "code");
