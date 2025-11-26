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

# Minimum free space required (in MiB) for the DB dump (adjust as needed)
MIN_FREE_MIB=500

err() {
  echo "ERROR: $*" >&2
}

info() {
  echo "INFO: $*"
}

if [ -z "$DB_PASS" ]; then
  err "DB_PASS is empty. Export DB_PASS environment variable before running."
  exit 2
fi

# Check Node/npm versions (warn only)
if command -v node >/dev/null 2>&1; then
  NODE_V=$(node -v)
  NPM_V=$(npm -v || echo "(npm not found)")
  info "Node: $NODE_V  npm: $NPM_V"
else
  info "Node not found on server; ensure Node is installed for running pm2-managed app"
fi

# Check DB connectivity
if command -v mysqladmin >/dev/null 2>&1; then
  if ! mysqladmin ping -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" --silent; then
    err "Cannot connect to MySQL with provided credentials (mysqladmin ping failed)."
    exit 2
  fi
else
  # fallback to a simple mysql command
  if ! mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -e "SELECT 1;" >/dev/null 2>&1; then
    err "Cannot connect to MySQL with provided credentials (mysql client test failed)."
    exit 2
  fi
fi

# Check disk free space on backup dir mount
mkdir -p "$BACKUP_DIR"
AVAIL_MIB=$(df -Pm "$BACKUP_DIR" | awk 'NR==2{print $4}')
if [ -z "$AVAIL_MIB" ]; then
  err "Could not determine available disk space on $BACKUP_DIR"
else
  if [ "$AVAIL_MIB" -lt "$MIN_FREE_MIB" ]; then
    err "Insufficient free space on $BACKUP_DIR: ${AVAIL_MIB}MiB available (require >= ${MIN_FREE_MIB}MiB)."
    exit 2
  fi
  info "Available space on $BACKUP_DIR: ${AVAIL_MIB}MiB"
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/inventario_${TIMESTAMP}.sql"
info "Creating DB backup -> $BACKUP_FILE"
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" --single-transaction --routines --triggers --databases "$DB_NAME" > "$BACKUP_FILE"
info "Backup complete. Size: $(du -h "$BACKUP_FILE" | awk '{print $1}')"

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
