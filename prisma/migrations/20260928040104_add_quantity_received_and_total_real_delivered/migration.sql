-- AlterTable
ALTER TABLE "detail_production_orders" ADD COLUMN     "quantity_received" INTEGER;

-- AlterTable
ALTER TABLE "header_production_orders" ADD COLUMN     "total_real_delivered" INTEGER;
