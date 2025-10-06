const express = require('express');
const router = express.Router();
const reportesControlador = require('../controladores/reportesControlador');
const { verificarToken } = require('../middleware/autenticacion');

router.get('/estadisticas', verificarToken, reportesControlador.obtenerEstadisticas);

module.exports = router;