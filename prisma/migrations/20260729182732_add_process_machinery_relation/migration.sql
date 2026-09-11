-- CreateTable
CREATE TABLE "process_machinery" (
    "id" SERIAL NOT NULL,
    "process_id" INTEGER NOT NULL,
    "machinery_id" INTEGER,

    CONSTRAINT "process_machinery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "process_machinery" ADD CONSTRAINT "process_machinery_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_machinery" ADD CONSTRAINT "process_machinery_machinery_id_fkey" FOREIGN KEY ("machinery_id") REFERENCES "machinery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
