/*
  Warnings:

  - You are about to drop the column `datw` on the `header_production_orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "header_production_orders" DROP COLUMN "datw",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "machinery" ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "type" SET DATA TYPE TEXT;
