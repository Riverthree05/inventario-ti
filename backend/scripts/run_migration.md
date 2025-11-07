# Ejecutar migración de `especificaciones` TEXT -> JSON (guía)

Este documento contiene pasos y comandos recomendados para ejecutar la migración ubicada en `db/migrations/0001_convert_especificaciones_to_json.sql`.

IMPORTANTE: No ejecutes en producción sin hacer backup y probar en staging.

1) Hacer backup completo de la base de datos (ejemplo con mysqldump):

```powershell
mysqldump -u root -p --single-transaction --routines --triggers --events inventario > inventario_backup_$(Get-Date -Format yyyyMMdd_HHmmss).sql
```

2) Levantar un MySQL de prueba local (opcional):

```powershell
# desde la raíz del repo
docker compose up -d mysql
```

3) Revisar el script y adaptarlo (si usas otro nombre de tabla/columnas).

4) Probar la migración en una copia de la BD (recomendado):

```powershell
# Importar backup a una BD de prueba antes de correr el script
mysql -u root -p inventario_test < inventario_backup_YYYYMMDD.sql
mysql -u root -p inventario_test < db/migrations/0001_convert_especificaciones_to_json.sql
```

5) Si todo OK, ejecutar en staging (con usuario y host correctos):

```powershell
mysql -u <user> -p -h <host> <database> < db/migrations/0001_convert_especificaciones_to_json.sql
```

Rollback: usa el backup generado en (1) para restaurar si algo falla.

Si quieres, puedo generar un script Node que ejecute la SQL y haga comprobaciones antes/después, pero eso requiere que me indiques credenciales o que lo ejecutes tú y me pases logs.
