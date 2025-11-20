## Migration checklist (destructive final step)

Pre-conditions (before maintenance window):

1. Take full production backup (mysqldump with --single-transaction) and copy it to a safe place off the server.
   - Command example:
     mysqldump -u PROD_USER -p --single-transaction --quick --lock-tables=false inventario > /tmp/inventario_backup.sql

2. Restore backup into staging and validate using `ops/staging_restore.sh /path/to/inventario_backup.sql`.
3. Run `ops/validate_backup.sql` queries and confirm counts for `especificaciones` and `especificaciones_json`.
4. Ensure monitoring and alerting are configured and `/healthz` is reachable on staging.
5. Confirm that any active deployment is paused and no writes will occur during the maintenance window.

During maintenance window (production):

1. Put app into maintenance mode (if applicable) or notify users of downtime.
2. Take a final backup (mysqldump) and verify checksum/size matches prior backup expectations.
3. Run safety queries:
   - SELECT COUNT(*) AS total_rows FROM activos;
   - SELECT COUNT(*) AS valid_in_old FROM activos WHERE JSON_VALID(especificaciones);
   - SELECT COUNT(*) AS valid_in_new FROM activos WHERE JSON_VALID(especificaciones_json);
   Review the numbers; if acceptable, proceed.
4. Execute the destructive SQL (from `final_migration.sql`):
   - ALTER TABLE activos DROP COLUMN especificaciones;
   - ALTER TABLE activos CHANGE especificaciones_json especificaciones JSON;

5. Run post-migration checks:
   - SELECT COUNT(*) FROM activos WHERE especificaciones IS NULL;
   - Run smoke tests (ops/smoke_tests.sh) and validate application behavior.

Rollback plan:
- If migration fails or data missing, stop services immediately and restore from the final backup:
  mysql -u PROD_USER -p inventario < /path/to/final_backup.sql
- Notify stakeholders and revert to previous application snapshot if available.

Contact:
- DB Admin: ops@example.com
- Developer on-call: dev@example.com
