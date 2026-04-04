-- CreateEnum
CREATE TYPE "Person_Type" AS ENUM ('NATURAL', 'JURIDICA');

-- CreateEnum
CREATE TYPE "Document_Type" AS ENUM ('NIT', 'CC', 'CE', 'PASAPORTE');

-- AlterTable
ALTER TABLE "thirds"
ADD COLUMN "person_type" "Person_Type",
ADD COLUMN "document_type" "Document_Type",
ADD COLUMN "document_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "thirds_document_type_document_number_key"
ON "thirds"("document_type", "document_number");
