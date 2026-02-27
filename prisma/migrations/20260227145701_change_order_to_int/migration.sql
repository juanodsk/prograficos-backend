/*
  Warnings:

  - You are about to drop the column `datw` on the `header_production_orders` table. All the data in the column will be lost.
  - Changed the type of `order` on the `processes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
ALTER TABLE "processes" ADD COLUMN "order_new" INTEGER;

UPDATE "processes" SET "order_new" = "order"::INTEGER;

ALTER TABLE "processes" DROP COLUMN "order";

ALTER TABLE "processes" RENAME COLUMN "order_new" TO "order";

ALTER TABLE "processes" ALTER COLUMN "order" SET NOT NULL;