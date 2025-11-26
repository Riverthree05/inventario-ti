-- Validation SQL to inspect data before final migration
SELECT COUNT(*) AS total_rows FROM activos;
SELECT COUNT(*) AS valid_in_old FROM activos WHERE JSON_VALID(especificaciones);
SELECT COUNT(*) AS valid_text_nonempty FROM activos WHERE especificaciones IS NOT NULL AND TRIM(especificaciones) != '';
SELECT COUNT(*) AS valid_in_new FROM activos WHERE JSON_VALID(especificaciones_json);
-- Sample some rows where especificaciones_json is NULL but especificaciones looks JSON-ish
SELECT id, especificaciones FROM activos WHERE especificaciones_json IS NULL AND especificaciones LIKE '{%"' LIMIT 50;
