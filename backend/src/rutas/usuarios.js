const express = require('express');
const router = express.Router();
const usuariosController = require('../controladores/usuariosControlador');
const { validarRegistroUsuario, validarLogin } = require('../middleware/validation');

router.post('/registro', validarRegistroUsuario, usuariosController.registrarUsuario);
router.post('/login', validarLogin, usuariosController.loginUsuario);
module.exports = router;