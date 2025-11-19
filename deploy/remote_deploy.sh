#!/usr/bin/env bash
set -euo pipefail

# remote_deploy.sh
# Example deploy script to run ON THE SERVER (Debian/Ubuntu)
# Usage (on server): sudo /srv/inventario/inventario-ti/deploy/remote_deploy.sh [branch]

REPO_DIR="/srv/inventario/inventario-ti"
GIT_REPO_URL="https://github.com/Riverthree05/inventario-ti.git"
BRANCH=${1:-main}
WWW_DIR="/var/www/inventario"

echo "Deploying branch ${BRANCH} to ${REPO_DIR}"

if [ ! -d "$REPO_DIR" ]; then
  mkdir -p "$REPO_DIR"
  git clone "$GIT_REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "Installing backend dependencies..."
cd backend
if [ ! -f .env ]; then
  if [ -f .env.sample ]; then
    cp .env.sample .env
    echo "Copied .env.sample -> .env. Edit .env with production values before proceeding.";
  else
    echo "Warning: .env.sample not found. Create .env with production configuration.";
  fi
fi

npm ci --production

echo "Running non-destructive migrations/backups (if script present)"
if [ -f scripts/execute_migration.js ]; then
  node scripts/execute_migration.js || echo "Migration script exited with non-zero code (check logs)"
fi

echo "(Re)starting app with pm2"
if command -v pm2 >/dev/null 2>&1; then
  pm2 startOrReload ../ecosystem.config.js --env production || true
  pm2 save || true
else
  echo "pm2 not found. Install it: npm i -g pm2";
fi

echo "Building frontend"
cd ../frontend
npm ci
npm run build

echo "Updating nginx served files"
mkdir -p "$WWW_DIR"
cp -r build/* "$WWW_DIR/"
chown -R www-data:www-data "$WWW_DIR" || true

echo "Reloading nginx"
systemctl reload nginx || service nginx reload || true

echo "Health check"
curl -fsS http://127.0.0.1:3001/ || echo "Backend health check failed; check pm2 logs"

echo "Deploy finished"
