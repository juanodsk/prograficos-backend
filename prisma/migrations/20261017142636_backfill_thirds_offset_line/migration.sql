-- Backfill de UNA SOLA VEZ (migración, no se repite en futuros deploy/seed).
-- Al volverse obligatoria la línea de servicio en los terceros, todos los
-- terceros CLIENTE/PROVEEDOR existentes a la fecha quedan en la línea "Offset".

-- 1) Asegura que la línea "Offset" exista (idempotente), sin depender del seed.
INSERT INTO "service_lines" ("name", "is_active")
VALUES ('Offset', true)
ON CONFLICT ("name") DO NOTHING;

-- 2) Asocia "Offset" a todos los terceros CLIENTE/PROVEEDOR existentes.
INSERT INTO "_ServiceLineToThirds" ("A", "B")
SELECT sl."id", t."id"
FROM "thirds" t
CROSS JOIN "service_lines" sl
WHERE t."type_person" IN ('CLIENTE', 'PROVEEDOR')
  AND sl."name" = 'Offset'
ON CONFLICT ("A", "B") DO NOTHING;
