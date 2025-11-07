#!/usr/bin/env node
/**
 * Ejecuta de forma automática el SQL de migración `db/migrations/0001_convert_especificaciones_to_json.sql`.
 * - Realiza una copia local (JSON) de la columna `especificaciones` antes de ejecutar.
 * - Ejecuta el SQL usando mysql2 con multipleStatements=true.
 * - Realiza comprobaciones antes/después y escribe un informe.
 *
 * Uso:
 *  - Crear un `.env` en `backend/` con variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE
 *  - node ./scripts/execute_migration.js
 *
 * Nota: Esto NO es un reemplazo de un backup completo (mysqldump). Haz backup completo antes de ejecutar.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const MIGRATION_SQL = path.resolve(__dirname, '..', '..', 'db', 'migrations', '0001_convert_especificaciones_to_json.sql');
const BACKUP_DIR = path.resolve(__dirname, '..', '..', 'backups');

async function run() {
  const cfg = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'inventario',
    multipleStatements: true,
  };

  console.log('Configuración DB usada:', { host: cfg.host, port: cfg.port, user: cfg.user, database: cfg.database });

  if (!fs.existsSync(MIGRATION_SQL)) {
    console.error('No se encontró el archivo de migración:', MIGRATION_SQL);
    process.exit(1);
  }

  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
  const backupFile = path.join(BACKUP_DIR, `especificaciones_backup_${timestamp}.json`);

  let conn;
  try {
    conn = await mysql.createConnection(cfg);

    console.log('Conectado a la BD. Realizando conteos previos...');
    const [totalRows] = await conn.query("SELECT COUNT(*) AS total FROM activos");
    const [validJsonRows] = await conn.query("SELECT COUNT(*) AS valid FROM activos WHERE JSON_VALID(especificaciones)");
    const [invalidJsonRows] = await conn.query("SELECT COUNT(*) AS invalid FROM activos WHERE especificaciones IS NOT NULL AND NOT JSON_VALID(especificaciones)");

    console.log(`Total filas en activos: ${totalRows[0].total}`);
    console.log(`Filas con JSON válido en 'especificaciones': ${validJsonRows[0].valid}`);
    console.log(`Filas con texto no válido en 'especificaciones': ${invalidJsonRows[0].invalid}`);

    console.log('Exportando columnas afectadas a backup local:', backupFile);
    const [rows] = await conn.query("SELECT id, especificaciones FROM activos WHERE especificaciones IS NOT NULL");
    fs.writeFileSync(backupFile, JSON.stringify(rows, null, 2), 'utf8');
    console.log('Backup local creado. Por favor guárdalo en un lugar seguro además de tus backups habituales.');

    // Ejecutar pasos de migración de forma idempotente y controlada
    console.log('Comprobando si la columna `especificaciones_json` ya existe...');
    const [colExists] = await conn.query("SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_name='activos' AND column_name='especificaciones_json' AND table_schema=?", [cfg.database]);
    if (colExists[0].cnt === 0) {
      console.log('No existe la columna. Añadiendo `especificaciones_json`...');
      await conn.query("ALTER TABLE activos ADD COLUMN especificaciones_json JSON NULL;");
      console.log('Columna añadida.');
    } else {
      console.log('La columna `especificaciones_json` ya existe. Saltando creación.');
    }

    console.log('Poblando `especificaciones_json` con JSON válido desde `especificaciones`...');
    await conn.query("UPDATE activos SET especificaciones_json = CASE WHEN JSON_VALID(especificaciones) THEN especificaciones ELSE NULL END;");
    console.log('Población completada. Realizando comprobaciones posteriores...');

    const [colCheck] = await conn.query("SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_name='activos' AND column_name='especificaciones_json' AND table_schema=?", [cfg.database]);
    console.log('especificaciones_json column present:', colCheck[0].cnt > 0);

    const [postValid] = await conn.query("SELECT COUNT(*) AS valid FROM activos WHERE JSON_VALID(especificaciones_json)");
    console.log(`Filas con JSON válido en 'especificaciones_json' después de migración: ${postValid[0].valid}`);

    console.log('\n--- Informe de migración ---');
    console.log('Backup local:', backupFile);
    console.log('Total filas:', totalRows[0].total);
    console.log('Válidas antes:', validJsonRows[0].valid);
    console.log('Inválidas antes:', invalidJsonRows[0].invalid);
    console.log('Válidas después (especificaciones_json):', postValid[0].valid);

    console.log('\nSi todo está correcto, puedes proceder a la sección del script que realiza el swap final (DROP/RENAME).');

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error durante la migración:', err);
    if (conn) try { await conn.end(); } catch (e) {}
    process.exit(2);
  }
}

run();
