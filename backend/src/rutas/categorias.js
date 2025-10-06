const express = require('express');
const router = express.Router();
const categoriasControlador = require('../controladores/categoriasControlador');
const { verificarToken } = require('../middleware/autenticacion');
router.get('/', verificarToken, categoriasControlador.obtenerTodas);
module.exports = router;