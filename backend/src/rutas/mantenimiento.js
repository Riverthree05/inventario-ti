const express = require('express');
const router = express.Router();
const mantenimientoControlador = require('../controladores/mantenimientoControlador');
const { verificarToken } = require('../middleware/autenticacion');
const { validarCrearMantenimiento } = require('../middleware/validation');

router.post('/', verificarToken, validarCrearMantenimiento, mantenimientoControlador.crearMantenimiento);
router.get('/activo/:activoId', verificarToken, mantenimientoControlador.obtenerMantenimientosPorActivo);
module.exports = router;