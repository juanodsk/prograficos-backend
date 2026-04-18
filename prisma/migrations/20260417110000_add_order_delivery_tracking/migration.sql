ALTER TABLE "header_production_orders"
ADD COLUMN "delivered_at" TIMESTAMP(3),
ADD COLUMN "delivered_by_user_id" INTEGER;

ALTER TABLE "header_production_orders"
ADD CONSTRAINT "header_production_orders_delivered_by_user_id_fkey"
FOREIGN KEY ("delivered_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
