**Maintenance Checklist (to complete before and during the maintenance window)**

Purpose: checklist paso a paso para que ops y stakeholders firmen y confirmen antes de ejecutar la migración final.

Pre-maintenance (must be done and checked off before start)

- [ ] 1. Confirm staging restore: ops executed `ops/staging_restore.sh` and ran `ops/smoke_tests.sh`. Attach outputs.
- [ ] 2. Verify backups: create at least one full DB dump and copy off-site. Provide path and checksum.
- [ ] 3. Secrets provisioned: `DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PASS`, `JWT_SECRET`, TLS certs and Sentry DSN are set in production environment.
- [ ] 4. Stakeholder approval: maintenance window scheduled and approved (time/date, duration, contacts).
- [ ] 5. Review `final_migration.sql` and sign-off: list reviewers' names and approval timestamps.

On the server (OPS to execute, one by one)

1) PRE-CHECKS

- [ ] Verify services and health:
  - `sudo systemctl status nginx`
  - `curl -fsS http://127.0.0.1:3001/healthz`
  - `sudo pm2 status`

2) DRY-RUN (recommended)

- [ ] Dry-run deploy:
  - `sudo /srv/inventario/inventario-ti/deploy/remote_deploy.sh main --dry-run`
- [ ] Dry-run full maintenance:
  - `sudo /srv/inventario/inventario-ti/ops/run_full_maintenance.sh main --dry-run`

3) FINAL BACKUP (required)

- [ ] Create timestamped DB dump and validate file size > 0 bytes:
  - `TIMESTAMP=$(date +%Y%m%d_%H%M%S)`
  - `BACKUP_DIR=/var/backups/inventario` && `mkdir -p "$BACKUP_DIR"`
  - `mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" --single-transaction --routines --triggers --databases "$DB_NAME" > "$BACKUP_DIR/inventario_${TIMESTAMP}.sql"`
  - `ls -lah "$BACKUP_DIR/inventario_${TIMESTAMP}.sql"`
  - Optional: copy off-site via `scp` and record checksum: `sha256sum`.

4) DEPLOY + FINAL MIGRATION

- [ ] Option A (step-by-step):
  - `sudo /srv/inventario/inventario-ti/deploy/remote_deploy.sh main`
  - `sudo env DB_PASS="$DB_PASS" /srv/inventario/inventario-ti/ops/execute_final_migration.sh`
- [ ] Option B (wrapper):
  - `sudo env DB_PASS="$DB_PASS" /srv/inventario/inventario-ti/ops/run_full_maintenance.sh main`

5) POST-MIGRATION SMOKE & VERIFICATION

- [ ] Health: `curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/healthz` (expect 200)
- [ ] API check: `curl -fsS http://127.0.0.1:3001/api/activos | jq '.' | head -n 20`
- [ ] Logs: `sudo pm2 logs --lines 200` and `sudo journalctl -u nginx --since "5 minutes ago" --no-pager`
- [ ] Manual UI checks: open UI and verify sample activos and `especificaciones` rendering.

6) ROLLBACK (if needed)

- [ ] Restore the most recent backup file:
  - `mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "/var/backups/inventario/inventario_YYYYMMDD_HHMMSS.sql"`
  - `sudo pm2 restart all`

Sign-off (fill during maintenance):

- Ops lead: ____________________  time: ________
- Stakeholder (product/owner): ____________________  time: ________
- Notes / anomalies encountered:
