## Provisionar secretos en el servidor (no en repo)

Preferido: usar un Secret Manager (HashiCorp Vault, AWS Secrets Manager, Azure KeyVault). Si no hay uno, usar variables de entorno en el servicio gestionador (pm2 or systemd).

Ejemplos para `pm2` (ecosystem.config.js):

1. Crear un archivo `prod.env` en el servidor (fuera del repo):

```
DB_HOST=127.0.0.1
DB_USER=prod_user
DB_PASS=supersecret
DB_NAME=inventario
JWT_SECRET=supersecretjwt
SENTRY_DSN=https://xxxxx@sentry.io/123
```

2. Iniciar pm2 usando `--env production` o pasar el archivo de env con `pm2 start ecosystem.config.js --env production`.

Ejemplo `systemd` (export envs en un archivo `/etc/systemd/system/inventario.service.d/env.conf`):

[Service]
Environment="DB_HOST=127.0.0.1"
Environment="DB_USER=prod_user"
Environment="DB_PASS=supersecret"

Notas de seguridad:
- No guardar `prod.env` en VCS.
- Asegurar permisos 600 en archivos que contengan secretos.
- Rotar secretos si hubo exposición.
