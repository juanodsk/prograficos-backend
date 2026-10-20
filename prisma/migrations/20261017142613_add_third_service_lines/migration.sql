-- CreateTable
CREATE TABLE "_ServiceLineToThirds" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ServiceLineToThirds_AB_unique" ON "_ServiceLineToThirds"("A", "B");

-- CreateIndex
CREATE INDEX "_ServiceLineToThirds_B_index" ON "_ServiceLineToThirds"("B");

-- AddForeignKey
ALTER TABLE "_ServiceLineToThirds" ADD CONSTRAINT "_ServiceLineToThirds_A_fkey" FOREIGN KEY ("A") REFERENCES "service_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceLineToThirds" ADD CONSTRAINT "_ServiceLineToThirds_B_fkey" FOREIGN KEY ("B") REFERENCES "thirds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
