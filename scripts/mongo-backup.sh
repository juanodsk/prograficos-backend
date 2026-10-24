#!/usr/bin/env bash
# Respaldo de la base de documentos (Mongo). Genera un archivo .gz con fecha
# en ./backups del backend. Correr desde cualquier sitio.
#
#   bash scripts/mongo-backup.sh
#
# Variables opcionales:
#   CONTAINER (def: mongo-prograficos)  DB (def: prograficos_documents)
set -euo pipefail

CONTAINER="${CONTAINER:-mongo-prograficos}"
DB="${DB:-prograficos_documents}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$SCRIPT_DIR/../backups"
mkdir -p "$OUT_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$OUT_DIR/${DB}-${STAMP}.gz"

echo "→ Respaldando '$DB' desde el contenedor '$CONTAINER'..."
# mongodump escribe el archive por stdout (--archive) y lo guardamos en el host.
docker exec "$CONTAINER" mongodump --db "$DB" --archive --gzip > "$FILE"

echo "✅ Respaldo creado: $FILE ($(du -h "$FILE" | cut -f1))"
