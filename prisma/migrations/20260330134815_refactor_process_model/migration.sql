/*
  Warnings:

  - You are about to drop the column `plastic_measure` on the `detail_production_orders` table. All the data in the column will be lost.
  - You are about to drop the column `plastic_type` on the `detail_production_orders` table. All the data in the column will be lost.
  - You are about to drop the column `stamping_color` on the `detail_production_orders` table. All the data in the column will be lost.
  - You are about to drop the column `is_finished` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `use_inks` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `use_measure` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `use_troquel` on the `processes` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Process_Category" AS ENUM ('PREPRENSA', 'CORTE', 'IMPRESION', 'ACABADO', 'TROQUELADO', 'PEGADO', 'EMPAQUE', 'OTRO');

-- CreateEnum
CREATE TYPE "Field_Type" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'DATE', 'TIME', 'SELECT');

-- AlterTable
ALTER TABLE "detail_production_orders" DROP COLUMN "plastic_measure",
DROP COLUMN "plastic_type",
DROP COLUMN "stamping_color";

-- AlterTable
ALTER TABLE "processes" DROP COLUMN "is_finished",
DROP COLUMN "use_inks",
DROP COLUMN "use_measure",
DROP COLUMN "use_troquel",
ADD COLUMN     "category" "Process_Category" NOT NULL DEFAULT 'OTRO';

-- CreateTable
CREATE TABLE "process_field_definitions" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "field_type" "Field_Type" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,
    "options" JSONB,
    "process_id" INTEGER NOT NULL,

    CONSTRAINT "process_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_process_field_values" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "detail_production_order_id" INTEGER NOT NULL,
    "field_definition_id" INTEGER NOT NULL,

    CONSTRAINT "detail_process_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "process_field_definitions_process_id_key_key" ON "process_field_definitions"("process_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "detail_process_field_values_detail_production_order_id_fiel_key" ON "detail_process_field_values"("detail_production_order_id", "field_definition_id");

-- AddForeignKey
ALTER TABLE "process_field_definitions" ADD CONSTRAINT "process_field_definitions_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "processes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_process_field_values" ADD CONSTRAINT "detail_process_field_values_detail_production_order_id_fkey" FOREIGN KEY ("detail_production_order_id") REFERENCES "detail_production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_process_field_values" ADD CONSTRAINT "detail_process_field_values_field_definition_id_fkey" FOREIGN KEY ("field_definition_id") REFERENCES "process_field_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
