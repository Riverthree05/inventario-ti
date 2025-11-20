#!/usr/bin/env bash
set -euo pipefail

# run_full_maintenance.sh
# Wrapper to run deploy + final migration during maintenance window.
# Usage: sudo ./run_full_maintenance.sh [branch] [--dry-run]

BRANCH="main"
DRY_RUN=0

usage() {
  cat <<EOF
Usage: $0 [branch] [--dry-run|-n]

Runs the safe deploy (remote_deploy.sh) and final migration (ops/execute_final_migration.sh).
Run with --dry-run to only print the commands that would be executed.
EOF
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage ;; 
    -n|--dry-run|--dryrun) DRY_RUN=1; shift ;;
    --) shift; break ;;
    -* ) echo "Unknown option: $1"; usage ;;
    *) BRANCH="$1"; shift ;;
  esac
done

RUN_CMD() {
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[DRY-RUN] $*"
  else
    echo "> $*"
    eval "$@"
  fi
}

DEPLOY_SCRIPT="/srv/inventario/inventario-ti/deploy/remote_deploy.sh"
MIGRATION_SCRIPT="/srv/inventario/inventario-ti/ops/execute_final_migration.sh"

echo "Running full maintenance: deploy branch=$BRANCH, dry-run=$DRY_RUN"

if [ ! -f "$DEPLOY_SCRIPT" ]; then
  echo "ERROR: Deploy script not found at $DEPLOY_SCRIPT" >&2
  exit 2
fi
if [ ! -f "$MIGRATION_SCRIPT" ]; then
  echo "ERROR: Migration script not found at $MIGRATION_SCRIPT" >&2
  exit 3
fi

# 1) Deploy code (will build frontend and restart pm2)
RUN_CMD sudo "$DEPLOY_SCRIPT" "$BRANCH" $([ "$DRY_RUN" -eq 1 ] && echo --dry-run || echo)

# 2) Run final migration
RUN_CMD sudo env DB_PASS="$DB_PASS" "$MIGRATION_SCRIPT"

echo "Full maintenance run finished (dry-run=$DRY_RUN)."
