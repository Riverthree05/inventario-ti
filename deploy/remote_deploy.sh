#!/usr/bin/env bash
set -euo pipefail

# remote_deploy.sh
# Deploy script intended to run ON THE SERVER (Debian/Ubuntu)
# Usage (on server): sudo /srv/inventario/inventario-ti/deploy/remote_deploy.sh [branch] [--dry-run]

REPO_DIR="/srv/inventario/inventario-ti"
GIT_REPO_URL="https://github.com/Riverthree05/inventario-ti.git"
BRANCH="main"
WWW_DIR="/var/www/inventario"
DRY_RUN=0

usage() {
  cat <<EOF
Usage: $0 [branch] [--dry-run|-n]

Deploys the given branch on this server. Run with --dry-run to print actions without executing.
Example:
  $0 main
  $0 release-1.2 --dry-run
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

run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[DRY-RUN] $*"
  else
    echo "> $*"
    "$@"
  fi
}

echo "Deploying branch ${BRANCH} to ${REPO_DIR} (dry-run=${DRY_RUN})"

if [ ! -d "$REPO_DIR/.git" ]; then
  run mkdir -p "$REPO_DIR"
  run git clone "$GIT_REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"
run git fetch origin --tags
# Ensure we track the remote branch and match remote state
if [ "$DRY_RUN" -eq 1 ]; then
  echo "[DRY-RUN] would checkout and reset to origin/${BRANCH}"
else
  git checkout -B "$BRANCH" || true
  git reset --hard "origin/${BRANCH}"
  git clean -fd
fi

echo "Installing backend dependencies..."
cd backend
if [ ! -f .env ]; then
  if [ -f .env.sample ]; then
    run cp .env.sample .env
    echo "Copied .env.sample -> .env. Edit .env with production values before proceeding.";
  else
    echo "Warning: .env.sample not found. Create .env with production configuration.";
  fi
fi

run npm ci --only=production

echo "Running non-destructive migrations/backups (if script present)"
if [ -f scripts/execute_migration.js ]; then
  run node scripts/execute_migration.js || echo "Migration script exited with non-zero code (check logs)"
fi

echo "(Re)starting app with pm2"
if command -v pm2 >/dev/null 2>&1; then
  run pm2 startOrReload "$REPO_DIR/ecosystem.config.js" --env production || true
  run pm2 save || true
else
  echo "pm2 not found. Install it: npm i -g pm2";
fi

echo "Building frontend"
cd "$REPO_DIR/frontend"
run npm ci
run npm run build

echo "Updating nginx served files"
run mkdir -p "$WWW_DIR"
BUILD_DIR="$REPO_DIR/frontend/build"
TMP_DIR="/tmp/inventario_build_$(date +%s)"
run mkdir -p "$TMP_DIR"
run rsync -a --delete "$BUILD_DIR/" "$TMP_DIR/"
run rsync -a --delete "$TMP_DIR/" "$WWW_DIR/"
run chown -R www-data:www-data "$WWW_DIR" || true
run rm -rf "$TMP_DIR"

echo "Reloading nginx"
run systemctl reload nginx || run service nginx reload || echo "Could not reload nginx; please check manually"

echo "Health check"
if [ "$DRY_RUN" -eq 1 ]; then
  echo "[DRY-RUN] curl -fsS http://127.0.0.1:3001/healthz"
else
  if curl -fsS http://127.0.0.1:3001/healthz >/dev/null 2>&1; then
    echo "Backend health: OK"
  else
    echo "Backend health check failed; check pm2 logs"
  fi
fi

echo "Deploy finished"
