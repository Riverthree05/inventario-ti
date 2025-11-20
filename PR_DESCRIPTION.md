# PR: ops: deploy helpers + backend audit fixes

Resumen:
- Incluye helpers y runbooks para despliegue en Debian (pm2 + nginx), scripts de migración y validaciones.
- Aplica correcciones de seguridad en backend (`js-yaml`) y ajustes menores en `server.js` (/healthz).
- Ejecuté `npm ci`, `npm audit fix` y las pruebas locales (backend y frontend) en el entorno de desarrollo. Backend: 2 suites, 4 tests passed. Frontend build and tests passed locally.

Archivos principales añadidos:
- `ecosystem.config.js` — pm2 config para backend
- `nginx/prod.conf` — ejemplo de configuración nginx
- `deploy/remote_deploy.sh` — script para servidor Debian
- `final_migration.sql` — SQL para la fase final (destructiva) de migración
- `MIGRATION_RUNBOOK.md` — runbook de migración detallado
- `DEPLOYMENT.md` — notas rápidas de despliegue
- `ops/*` — runbooks y scripts para staging/validación/migration checklist

Checklist para merge (requerido antes de promover a producción):
1. Confirmar backups: ejecutar `ops/staging_restore.sh` para restaurar backup en staging y validar integridad.
2. Provisionar secretos en el servidor (DB credentials, `JWT_SECRET`, Sentry DSN, TLS certs). No subir secretos al repo.
3. Habilitar protección de rama en GitHub (requerir PRs, checks y revisores).
4. Ejecutar smoke/e2e en staging usando `ops/smoke_tests.sh` y validar logs/monitoring.
5. Programar ventana de mantenimiento y aprobar `final_migration.sql`.

Instrucciones rápidas:
 - Para revisar runbooks: `ops/migration_checklist.md`, `ops/staging_restore.sh`, `ops/smoke_tests.sh`.
 - Para push/merge: espere a que ops confirme restores y que la protección de rama esté activada.

Notas de seguridad:
- No hay claves o secretos en este PR. Asegurarse de usar un Secret Manager o variables de entorno en el servidor.

Si quieres, puedo añadir más pasos de verificación automáticos o ejecutar los comandos de validación en la máquina remota si me das acceso.
