-- Draft migration: convert 'especificaciones' TEXT column to JSON (MySQL compatible)
-- Run this on a backup copy first. Adjust types depending on MySQL version.

-- 1) Add new JSON column
ALTER TABLE activos ADD COLUMN especificaciones_json JSON NULL;

-- 2) Populate new column from existing text column (safely parsing only valid JSON)
UPDATE activos
SET especificaciones_json = CASE
  WHEN JSON_VALID(especificaciones) THEN especificaciones
  ELSE NULL
END;

-- 3) After verifying data in `especificaciones_json`, perform a safe swap:
--    NOTE: run on a cloned DB first and backup before performing destructive steps.
--
-- START TRANSACTION;
-- -- Option A: rename by dropping old column and renaming new one
-- ALTER TABLE activos DROP COLUMN especificaciones;
-- ALTER TABLE activos CHANGE COLUMN especificaciones_json especificaciones JSON NULL;
-- COMMIT;

-- Rollback (if you added the new column and want to remove it):
-- ALTER TABLE activos DROP COLUMN especificaciones_json;

-- Additional notes and helpers:
-- - This script assumes MySQL >= 5.7 which supports JSON type.
-- - Rows with invalid JSON remain NULL in the new column; consider exporting those rows and cleaning manually.
-- - To index common fields for searching, create generated/stored columns and indices. Example:
--   ALTER TABLE activos ADD COLUMN specs_cpu VARCHAR(128) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(especificaciones, '$.cpu'))) STORED;
--   CREATE INDEX idx_specs_cpu ON activos(specs_cpu);

-- Backup recommendation before running migration (example):
-- mysqldump -h $DB_HOST -u $DB_USER -p $DB_DATABASE > backup_especificaciones_before_migration.sql
