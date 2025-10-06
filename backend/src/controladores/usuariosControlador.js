const Usuario = require('../models/usuarios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.registrarUsuario = async (req, res) => {
    const { nombre, email, password, rol_id } = req.body;
    try {
        const usuarioId = await Usuario.crear(nombre, email, password, rol_id);
        res.status(201).json({ message: 'Usuario creado con éxito', usuarioId });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario. El email ya podría existir.' });
    }
};

exports.loginUsuario = async (req, res) => {
    const { email, password } = req.body;
    try {
        const usuario = await Usuario.buscarPorEmail(email);
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const passwordCorrecto = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecto) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const payload = { usuario: { id: usuario.id, rol_id: usuario.rol_id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }, (error, token) => {
            if (error) throw error;
            res.json({ token });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};