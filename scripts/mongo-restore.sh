#!/usr/bin/env bash
# Restaura la base de documentos (Mongo) desde un respaldo .gz hecho con
# mongo-backup.sh.
#
#   bash scripts/mongo-restore.sh backups/prograficos_documents-20261024-120000.gz
#
# Por defecto NO sobrescribe documentos existentes. Para reemplazar la base al
# estado del respaldo, exporta DROP=1 (elimina la colección antes de restaurar).
#
# Variables opcionales:
#   CONTAINER (def: mongo-prograficos)  DB (def: prograficos_documents)  DROP (def: 0)
set -euo pipefail

CONTAINER="${CONTAINER:-mongo-prograficos}"
DB="${DB:-prograficos_documents}"
DROP="${DROP:-0}"

FILE="${1:-}"
if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Uso: bash scripts/mongo-restore.sh <ruta-al-respaldo.gz>" >&2
  exit 1
fi

DROP_FLAG=""
if [[ "$DROP" == "1" ]]; then
  echo "⚠️  DROP=1: se eliminarán las colecciones existentes de '$DB' antes de restaurar."
  DROP_FLAG="--drop"
fi

echo "→ Restaurando '$DB' en el contenedor '$CONTAINER' desde $FILE ..."
docker exec -i "$CONTAINER" mongorestore --db "$DB" --archive --gzip $DROP_FLAG < "$FILE"

echo "✅ Restauración completada."
