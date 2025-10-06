const express = require('express');
const router = express.Router();
const qrControlador = require('../controladores/qrControlador');
const { verificarToken } = require('../middleware/autenticacion');

// La URL será /api/qr/activo/1
router.get('/activo/:activoId', verificarToken, qrControlador.generarQR);

module.exports = router;