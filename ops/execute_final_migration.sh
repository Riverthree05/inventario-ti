#!/usr/bin/env bash
set -euo pipefail

# execute_final_migration.sh
# Run on the production server during maintenance window.
# This script will:
#  - create a timestamped DB dump
#  - run final_migration.sql (destructive)
#  - restart pm2
#  - run quick smoke checks

DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-}"  # ensure provided in env
DB_NAME="${DB_NAME:-inventario}"
BACKUP_DIR="/var/backups/inventario"
MIGRATION_SQL="/srv/inventario/inventario-ti/final_migration.sql"

if [ -z "$DB_PASS" ]; then
  echo "ERROR: DB_PASS is empty. Export DB_PASS environment variable before running." >&2
  exit 2
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/inventario_${TIMESTAMP}.sql"
echo "Creating DB backup -> $BACKUP_FILE"
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" --single-transaction --routines --triggers --databases "$DB_NAME" > "$BACKUP_FILE"
echo "Backup complete. Size: $(du -h "$BACKUP_FILE" | awk '{print $1}')"

echo "Running final migration SQL: $MIGRATION_SQL"
if [ ! -f "$MIGRATION_SQL" ]; then
  echo "ERROR: Migration SQL not found at $MIGRATION_SQL" >&2
  exit 3
fi

mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$MIGRATION_SQL"
echo "Migration SQL applied."

echo "Restarting app (pm2)"
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart all || pm2 restart inventario || true
else
  echo "pm2 not found; please restart the Node process manager manually."
fi

echo "Waiting for service to settle..."
sleep 5

echo "Health check"
if curl -fsS http://127.0.0.1:3001/healthz >/dev/null 2>&1; then
  echo "Backend health: OK"
else
  echo "Health check failed. Check pm2 logs and consider rollback."
  exit 4
fi

echo "Quick smoke: GET /api/activos (first 5 items)"
curl -fsS -X GET http://127.0.0.1:3001/api/activos | head -n 20

echo "Final migration script completed successfully."

echo "If you need to rollback, restore the latest backup file:"
echo "  mysql -h \"$DB_HOST\" -u \"$DB_USER\" -p\"$DB_PASS\" $DB_NAME < $BACKUP_FILE"
