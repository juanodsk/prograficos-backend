-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERVISOR', 'EMPLOYEE', 'USER');

-- CreateEnum
CREATE TYPE "Thirds_type" AS ENUM ('CLIENTE', 'PROVEEDOR', 'OTROS');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "Order_Status" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'TERMINADO', 'ENTREGADO');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surename" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatar" TEXT DEFAULT 'https://img.freepik.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3383.jpg?semt=ais_user_personalization&w=740&q=80',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" TEXT NOT NULL,
    "use_troquel" BOOLEAN NOT NULL DEFAULT false,
    "use_measure" BOOLEAN NOT NULL DEFAULT false,
    "use_inks" BOOLEAN NOT NULL DEFAULT false,
    "is_finished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machinery" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "machinery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formats" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measures" (
    "id" SERIAL NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "format_id" INTEGER NOT NULL,

    CONSTRAINT "measures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "grammage" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "paper_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thirds" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "type_person" "Thirds_type" DEFAULT 'CLIENTE',
    "company_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "thirds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_customer" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "name" TEXT,
    "product_id" INTEGER NOT NULL,
    "third_id" INTEGER NOT NULL,

    CONSTRAINT "product_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "troqueles" (
    "id" SERIAL NOT NULL,
    "elaboration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT,
    "size" "Size" NOT NULL,
    "file" TEXT NOT NULL,

    CONSTRAINT "troqueles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_production_orders" (
    "id" SERIAL NOT NULL,
    "datw" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_delivery_estimated" TIMESTAMP(3) NOT NULL,
    "order_status" "Order_Status" NOT NULL DEFAULT 'PENDIENTE',
    "amount_sheets" INTEGER NOT NULL,
    "total_estimated" INTEGER NOT NULL,
    "total_delivered" INTEGER,
    "total_damaged" INTEGER,
    "measure_id" INTEGER NOT NULL,
    "paper_type_id" INTEGER NOT NULL,
    "troquel_id" INTEGER NOT NULL,
    "product_customer_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "header_production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_production_orders" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "start_hour" TIMESTAMP(3) NOT NULL,
    "end_hour" TIMESTAMP(3),
    "quantity_delivered" INTEGER NOT NULL,
    "quantity_damaged" INTEGER NOT NULL,
    "plastic_type" TEXT,
    "plastic_measure" TEXT,
    "stamping_color" TEXT,
    "observations" TEXT,
    "header_order_id" INTEGER NOT NULL,
    "process_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "machinery_id" INTEGER NOT NULL,
    "measure_cutting_id" INTEGER NOT NULL,

    CONSTRAINT "detail_production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "thirds_email_key" ON "thirds"("email");

-- AddForeignKey
ALTER TABLE "measures" ADD CONSTRAINT "measures_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_customer" ADD CONSTRAINT "product_customer_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_customer" ADD CONSTRAINT "product_customer_third_id_fkey" FOREIGN KEY ("third_id") REFERENCES "thirds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_production_orders" ADD CONSTRAINT "header_production_orders_measure_id_fkey" FOREIGN KEY ("measure_id") REFERENCES "measures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_production_orders" ADD CONSTRAINT "header_production_orders_paper_type_id_fkey" FOREIGN KEY ("paper_type_id") REFERENCES "paper_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_production_orders" ADD CONSTRAINT "header_production_orders_troquel_id_fkey" FOREIGN KEY ("troquel_id") REFERENCES "troqueles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_production_orders" ADD CONSTRAINT "header_production_orders_product_customer_id_fkey" FOREIGN KEY ("product_customer_id") REFERENCES "product_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_production_orders" ADD CONSTRAINT "header_production_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_production_orders" ADD CONSTRAINT "detail_production_orders_header_order_id_fkey" FOREIGN KEY ("header_order_id") REFERENCES "header_production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_production_orders" ADD CONSTRAINT "detail_production_orders_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "processes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_production_orders" ADD CONSTRAINT "detail_production_orders_measure_cutting_id_fkey" FOREIGN KEY ("measure_cutting_id") REFERENCES "measures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_production_orders" ADD CONSTRAINT "detail_production_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_production_orders" ADD CONSTRAINT "detail_production_orders_machinery_id_fkey" FOREIGN KEY ("machinery_id") REFERENCES "machinery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
