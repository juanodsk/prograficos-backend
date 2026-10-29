/*
  Warnings:

  - Made the column `service_line_id` on table `troqueles` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "troqueles" DROP CONSTRAINT "troqueles_service_line_id_fkey";

-- AlterTable
ALTER TABLE "troqueles" ALTER COLUMN "service_line_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "troqueles" ADD CONSTRAINT "troqueles_service_line_id_fkey" FOREIGN KEY ("service_line_id") REFERENCES "service_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
