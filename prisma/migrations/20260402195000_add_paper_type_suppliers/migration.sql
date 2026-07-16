-- CreateTable
CREATE TABLE "paper_type_suppliers" (
  "id" SERIAL NOT NULL,
  "third_id" INTEGER NOT NULL,
  "paper_type_id" INTEGER NOT NULL,
  "purchase_price" DECIMAL(12,2) NOT NULL,

  CONSTRAINT "paper_type_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "paper_type_suppliers_paper_type_id_third_id_key"
ON "paper_type_suppliers"("paper_type_id", "third_id");

-- AddForeignKey
ALTER TABLE "paper_type_suppliers"
ADD CONSTRAINT "paper_type_suppliers_third_id_fkey"
FOREIGN KEY ("third_id") REFERENCES "thirds"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_type_suppliers"
ADD CONSTRAINT "paper_type_suppliers_paper_type_id_fkey"
FOREIGN KEY ("paper_type_id") REFERENCES "paper_types"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
