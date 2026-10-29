-- AlterEnum
ALTER TYPE "Size" ADD VALUE 'EXTRA_LARGE';

-- AlterTable
ALTER TABLE "troqueles" ADD COLUMN     "service_line_id" INTEGER;

-- AddForeignKey
ALTER TABLE "troqueles" ADD CONSTRAINT "troqueles_service_line_id_fkey" FOREIGN KEY ("service_line_id") REFERENCES "service_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
