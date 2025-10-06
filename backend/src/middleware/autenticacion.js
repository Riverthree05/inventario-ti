const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.verificarToken = (req, res, next) => {
    let token;
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decodificado.usuario;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token no válido.' });
    }
};

exports.verificarAdmin = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT r.nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ?', [req.usuario.id]);
        if (rows.length === 0 || rows[0].nombre !== 'administrador') {
             return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar el rol del usuario.' });
    }
};