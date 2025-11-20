**Maintenance Playbook**

Purpose: pasos copy-paste para ejecutar la migración final (destructiva) en producción.

Pre-requirements (must have before starting):
- Maintenance window scheduled and stakeholders informed.
- SSH access to production server and sudo privileges.
- Production environment variables (DB credentials, JWT_SECRET, etc.) are provisioned on the server (not in repo).
- Confirmed successful staging restore and smoke tests.

1) PREPARE & VERIFY

- On your workstation, fetch latest `ops/deploy-helpers` y revisar `final_migration.sql` y `ops/execute_final_migration.sh`.

- En el servidor de producción, verificar que la app responde `/healthz`:

  sudo systemctl status nginx
  curl -fsS http://127.0.0.1:3001/healthz

2) TAKE A FULL DATABASE BACKUP (required)

- Crear dump con timestamp (reemplazar variables):

  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_DIR=/var/backups/inventario
  mkdir -p "$BACKUP_DIR"
  mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" --single-transaction --routines --triggers --databases "$DB_NAME" > "$BACKUP_DIR/inventario_${TIMESTAMP}.sql"

- Verificar el backup:

  ls -lah "$BACKUP_DIR/inventario_${TIMESTAMP}.sql"

3) OPTIONAL: COPY BACKUP OFF-SERVER

  scp "$BACKUP_DIR/inventario_${TIMESTAMP}.sql" <backup-user>@<backup-host>:/path/to/secure/storage/

4) RUN FINAL MIGRATION (destructive)

- Ejecutar en servidor (modificará esquema):

  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < /srv/inventario/inventario-ti/final_migration.sql

- Revisar errores en la salida o en logs de MySQL.

5) RESTART APP & VERIFY

  sudo pm2 restart all || sudo pm2 restart inventario || true
  sleep 5
  curl -fsS http://127.0.0.1:3001/healthz || (echo "healthcheck failed" && exit 2)

6) SMOKE TESTS

- Ejemplos de smoke tests:

  curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/healthz
  curl -fsS -X GET http://127.0.0.1:3001/api/activos | jq '.' | head -n 5

7) ROLLBACK (si es necesario)

- Restaurar el dump:

  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$BACKUP_DIR/inventario_${TIMESTAMP}.sql"
  sudo pm2 restart all

8) POST-MIGRATION CHECKS

- Verificar flujos CRUD y muestras de `especificaciones` en la UI.
- Revisar logs: `pm2 logs inventario` y `journalctl -u nginx`.
- Confirmar que el monitoreo y alertas están OK.

Notes & Safety:
- No ejecutar la migración destructiva sin backup verificado y prueba de restauración en staging.
- Si quieren que ejecute comandos, compartir acceso o salida y guío el siguiente paso.
