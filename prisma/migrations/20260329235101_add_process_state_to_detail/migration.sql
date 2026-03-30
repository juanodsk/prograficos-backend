-- CreateEnum
CREATE TYPE "Process_State" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'TERMINADO');

-- AlterTable
ALTER TABLE "detail_production_orders" ADD COLUMN     "process_state" "Process_State" NOT NULL DEFAULT 'PENDIENTE';
