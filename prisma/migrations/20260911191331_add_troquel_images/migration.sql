-- CreateTable
CREATE TABLE "troquel_images" (
    "id" SERIAL NOT NULL,
    "troquel_id" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "troquel_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "troquel_images" ADD CONSTRAINT "troquel_images_troquel_id_fkey" FOREIGN KEY ("troquel_id") REFERENCES "troqueles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
