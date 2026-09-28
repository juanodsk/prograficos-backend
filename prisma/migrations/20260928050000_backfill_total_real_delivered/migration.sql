-- Backfill de órdenes ya terminadas antes de introducir total_real_delivered:
-- en una orden cerrada el real entregado coincide con total_delivered
-- (entregado del último proceso). Solo aplica a las que aún están en NULL.
UPDATE "header_production_orders"
SET "total_real_delivered" = "total_delivered"
WHERE "order_status" IN ('TERMINADO', 'ENTREGADO')
  AND "total_real_delivered" IS NULL;
