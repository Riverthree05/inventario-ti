-- FINAL migration (destructive)
-- Run during maintenance window AFTER backups are verified.

-- Safety checks (run manually and inspect results):
SELECT COUNT(*) AS total_rows FROM activos;
SELECT COUNT(*) AS valid_in_old FROM activos WHERE JSON_VALID(especificaciones);
SELECT COUNT(*) AS valid_in_new FROM activos WHERE JSON_VALID(especificaciones_json);

-- If the above results are acceptable, run:
ALTER TABLE activos DROP COLUMN especificaciones;
ALTER TABLE activos CHANGE especificaciones_json especificaciones JSON;

-- Post-checks
SELECT COUNT(*) FROM activos WHERE especificaciones IS NULL;
