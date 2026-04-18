ALTER TABLE "header_production_orders"
DROP CONSTRAINT IF EXISTS "header_production_orders_delivered_by_user_id_fkey";

ALTER TABLE "header_production_orders"
DROP COLUMN IF EXISTS "delivered_at",
DROP COLUMN IF EXISTS "delivered_by_user_id";
