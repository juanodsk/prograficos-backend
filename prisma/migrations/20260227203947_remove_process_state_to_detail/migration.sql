/*
  Warnings:

  - You are about to drop the column `process_state` on the `detail_production_orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "detail_production_orders" DROP COLUMN "process_state";
