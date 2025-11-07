const express = require('express');
const router = express.Router();
const activosControlador = require('../controladores/activosControlador');
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');
const { validarCrearActivo, validarActualizarActivo } = require('../middleware/validation');

router.get('/', verificarToken, activosControlador.obtenerTodos);
router.get('/:id', verificarToken, activosControlador.obtenerPorId);
router.post('/', verificarToken, validarCrearActivo, activosControlador.crear);
router.put('/:id', verificarToken, validarActualizarActivo, activosControlador.actualizar);
router.delete('/:id', verificarToken, verificarAdmin, activosControlador.eliminar);
module.exports = router;