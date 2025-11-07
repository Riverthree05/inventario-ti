Feat: serializar y sanear `especificaciones` (frontend + backend)

Resumen de cambios:

- Frontend: `ActivoForm` ahora evita enviar `bitlocker_recovery_key` y muestra un mensaje informativo.
- Backend:
  - Normaliza keys de `especificaciones` a snake_case y serializa como JSON antes de persistir.
  - Añade `specsUtils` para saneamiento (quita claves sensibles, trunca strings/arrays, límites).
  - Añade validación con Ajv y heurística / categoría para `especificaciones`.
  - Reemplaza logs por Winston (con rotación diaria) y reporta advertencias (warnings) en la respuesta cuando aplica.
  - Tests unitarios e integración añadidos.
- DB: añade `db/migrations/0001_convert_especificaciones_to_json.sql` (draft) para migrar `especificaciones` a columna JSON.

Impacto y riesgos:
- No se aplicaron cambios destructivos en la DB en este branch.
- La validación ahora puede rechazar payloads que antes pasaban si no cumplen campos mínimos por categoría (ej: laptops sin `cpu` o `ram`). Esto puede requerir adaptar formularios o datos históricos.
- Logging genera ficheros en `backend/logs/` por rotación diaria.

Pasos de verificación (QA):
1. Backend:
   - `cd backend; npm install; npm test` -> todos los tests deben pasar.
   - Levantar el servidor: `node server.js` y probar `POST /api/activos` con `especificaciones` válidas/invalidas.
2. Frontend:
   - `cd frontend; npm install; npm run build` -> build debe completar (warnings no bloqueantes posibles por dependencia `html5-qrcode`).
3. DB migration (manual, no ejecutada):
   - Revisar `db/migrations/0001_convert_especificaciones_to_json.sql`, ejecutar en copia de la BD y verificar datos migrados.

Checklist antes de merge:
- [ ] Confirmar que formularios actuales envían los campos mínimos requeridos por categoría o adaptar frontend.
- [ ] Ejecutar migration en staging y verificar queries.
- [ ] Actualizar documentación interna de administración (cómo manejar claves de recuperación). 

Notas para reviewers:
- Presta atención a `backend/src/utils/specsUtils.js` (saneamiento) y a `backend/src/middleware/validation.js` (cambios en validación async que consultan `categorias`).
- Si hay compatibilidad con datos antiguos, recomendamos ejecutar la migración en staging y revisar manualmente registros con `especificaciones` no válidas.
