-- CreateEnum
CREATE TYPE "Process_State" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'FINALIZADO');

-- DropForeignKey
ALTER TABLE "detail_production_orders" DROP CONSTRAINT "detail_production_orders_machinery_id_fkey";

-- DropForeignKey
ALTER TABLE "detail_production_orders" DROP CONSTRAINT "detail_production_orders_measure_cutting_id_fkey";

-- AlterTable
ALTER TABLE "detail_production_orders" ADD COLUMN     "process_state" "Process_State" NOT NULL DEFAULT 'PENDIENTE',
ALTER COLUMN "machinery_id" DROP NOT NULL,
ALTER COLUMN "measure_cutting_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "detail_production_orders" ADD CONSTRAINT "detail_production_orders_measure_cutting_id_fkey" FOREIGN KEY ("measure_cutting_id") REFERENCES "measures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_production_orders" ADD CONSTRAINT "detail_production_orders_machinery_id_fkey" FOREIGN KEY ("machinery_id") REFERENCES "machinery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
