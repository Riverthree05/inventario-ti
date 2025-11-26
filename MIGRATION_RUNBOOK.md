# Migration runbook — final destructive migration (TEXT -> JSON)

This runbook describes the safe process to remove the old `especificaciones` TEXT column and rename `especificaciones_json` to `especificaciones` (JSON). Execute only during a maintenance window.

Pre-conditions (MUST):
- A verified full mysqldump backup exists and has been restored successfully in a staging environment.
- Application is placed into read-only mode or traffic is minimized.
- DB user with ALTER TABLE privileges is available.

Steps:
1. Take a final backup (on the DB host or an admin host):

```
mysqldump --single-transaction --routines --triggers --events -u <user> -p<password> <db> > full_backup_$(date +%Y%m%d_%H%M%S).sql
```

2. Verify counts and JSON validity:

```
-- total rows
SELECT COUNT(*) FROM activos;

-- rows with valid JSON in old column
SELECT COUNT(*) FROM activos WHERE JSON_VALID(especificaciones);

-- rows with valid JSON in especificaciones_json
SELECT COUNT(*) FROM activos WHERE JSON_VALID(especificaciones_json);
```

3. If counts match expectations and you are confident, run the destructive SQL (once):

```
ALTER TABLE activos DROP COLUMN especificaciones;
ALTER TABLE activos CHANGE especificaciones_json especificaciones JSON;
```

4. Post-migration checks:

```
-- Ensure no NULLs unless expected
SELECT COUNT(*) FROM activos WHERE especificaciones IS NULL;

-- Sample a few rows
SELECT id, especificaciones FROM activos LIMIT 10;
```

5. Restart application (pm2):

```
pm2 restart inventario-backend
```

6. Run smoke tests and monitor logs for 30–60 minutes.

Rollback plan:
- If something goes wrong, restore the DB from the mysqldump taken in step 1 and redeploy the previous application commit.

Notes:
- This operation is irreversible without a backup restore. Confirm with stakeholders before running.
