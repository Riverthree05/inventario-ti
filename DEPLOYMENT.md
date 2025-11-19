# DEPLOYMENT (Debian / PM2 / nginx)

This document describes step-by-step how to deploy the application to a Debian/Ubuntu server without Docker.

Prerequisites on the server
- Node.js LTS
- nginx
- pm2 (global)
- mysql client (for backups/migration)
- git
- domain DNS pointed to server IP

Quick steps
1. Create a system user for deploy (optional) or use an existing admin user.
2. Clone the repo into `/srv/inventario/inventario-ti`.
3. Edit `backend/.env` with production secrets (DO NOT commit `.env`).
4. Install backend deps: `npm ci --production` and start app with pm2 using `ecosystem.config.js`.
5. Build frontend: `npm ci && npm run build` and copy `build/` to `/var/www/inventario`.
6. Configure nginx: copy `nginx/prod.conf` to `/etc/nginx/sites-available/inventario`, edit `server_name`, enable site and reload nginx.
7. Obtain TLS cert with certbot: `sudo certbot --nginx -d your-domain.com`.

Health checks and smoke tests
- `curl -fS http://127.0.0.1:3001/healthz` or `curl -fS https://your-domain.com/`

Rollback
- If a deploy or migration fails, restore from the latest mysqldump backup and roll back the code by checking out the previous commit and restarting pm2.

Security notes
- Keep secrets out of repo. Use environment variables or a vault.
- Use a DB user with least privileges.
