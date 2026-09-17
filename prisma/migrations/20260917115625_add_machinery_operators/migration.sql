-- CreateTable: pivote maquinaria <-> operarios
CREATE TABLE "machinery_operators" (
    "id" SERIAL NOT NULL,
    "machinery_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "machinery_operators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "machinery_operators_machinery_id_user_id_key" ON "machinery_operators"("machinery_id", "user_id");

-- AddForeignKey
ALTER TABLE "machinery_operators" ADD CONSTRAINT "machinery_operators_machinery_id_fkey" FOREIGN KEY ("machinery_id") REFERENCES "machinery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machinery_operators" ADD CONSTRAINT "machinery_operators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
