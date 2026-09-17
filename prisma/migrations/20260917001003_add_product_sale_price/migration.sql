-- AlterTable: agrega el precio de venta del producto (COP, opcional)
ALTER TABLE "products" ADD COLUMN "sale_price" DECIMAL(12,2);
