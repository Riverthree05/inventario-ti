#!/usr/bin/env bash
# Restore a production dump into staging and run validation queries.
# Usage: ./staging_restore.sh /path/to/dump.sql

set -euo pipefail

DUMP_PATH="$1"
DB_HOST="localhost"
DB_USER="staging_user"
DB_NAME="inventario_staging"

if [ -z "$DUMP_PATH" ]; then
  echo "Usage: $0 /path/to/dump.sql" >&2
  exit 2
fi

echo "Restoring $DUMP_PATH into $DB_NAME on $DB_HOST"
mysql -h "$DB_HOST" -u "$DB_USER" -p -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;"
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < "$DUMP_PATH"

echo "Running validation queries..."
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" -e "SELECT COUNT(*) AS total_rows FROM activos;"
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" -e "SELECT COUNT(*) AS valid_in_old FROM activos WHERE JSON_VALID(especificaciones);"
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" -e "SELECT COUNT(*) AS valid_in_new FROM activos WHERE JSON_VALID(especificaciones_json);"

echo "If counts look good, proceed to smoke tests (ops/smoke_tests.sh) and review data samples manually."
