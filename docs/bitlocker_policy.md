# Política de manejo de BitLocker y claves de recuperación

Fecha: 2025-11-06

Resumen
-------
Este documento describe la política adoptada para el manejo del estado de BitLocker y las claves de recuperación en el sistema Inventario-TI.

Decisión actual
---------------
- No se almacenarán las claves de recuperación de BitLocker en la base de datos en texto plano ni cifrado directo en la BD por defecto.
- Se añade una columna `bitlocker` en el modelo de activos para indicar el estado: `enabled`, `disabled`, `unknown`.

Recomendaciones
---------------
- Si se requiere guardar claves de recuperación por razones operativas, usar un *secret manager* (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault) o
  almacenar cifradas fuera de la BD con una llave de cifrado administrada por el equipo de infraestructura.
- Evitar exponer las claves por la API. Si es necesario mostrar una clave temporalmente, usar un flujo de entrega seguro (por ejemplo, un enlace temporal que se muestra una sola vez).

Implementación técnica
----------------------
- El backend admite el campo `bitlocker` como atributo del activo y puede persistirlo cuando exista la columna en la tabla `activos`.
- No se añade por defecto ninguna columna `bitlocker_recovery_key` en la BD.

Operación y procedimientos
---------------------------
1. Generación/Registro de claves: las claves se deben generar y almacenar en el secret manager.
2. Acceso: los técnicos con permisos pueden solicitar la clave mediante un proceso que lea el secret manager y devuelva la clave sólo dentro de una sesión autenticada y registrada.
3. Auditoría: todas las lecturas/entregas de claves deben registrarse en el sistema de logs con la identificación del usuario y timestamp.

Notas
-----
Si deseas cambiar la política y permitir el almacenamiento cifrado en BD (decisión B), documenta la llave de cifrado y yo puedo implementar la encriptación/desencriptación en el backend.
