/*
  Warnings:

  - You are about to drop the column `active` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `formats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reference]` on the table `machinery` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `processes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `product_customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `troqueles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "detail_production_orders" DROP CONSTRAINT "detail_production_orders_user_id_fkey";

-- AlterTable
ALTER TABLE "detail_production_orders" ALTER COLUMN "start_date" DROP NOT NULL,
ALTER COLUMN "start_hour" DROP NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "formats" ALTER COLUMN "is_active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "measures" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "paper_types" ALTER COLUMN "is_active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "processes" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "product_customer" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "active",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "troqueles" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "avatar" SET DEFAULT 'https://img.freepik.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3383.jpg';

-- CreateIndex
CREATE UNIQUE INDEX "formats_name_key" ON "formats"("name");

-- CreateIndex
CREATE UNIQUE INDEX "machinery_reference_key" ON "machinery"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "processes_name_key" ON "processes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_customer_code_key" ON "product_customer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "troqueles_code_key" ON "troqueles"("code");

-- AddForeignKey
ALTER TABLE "detail_production_orders" ADD CONSTRAINT "detail_production_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
