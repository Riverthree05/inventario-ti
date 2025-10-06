const pool = require('../config/database');

exports.obtenerTodas = async (req, res) => {
    try {
        const [categorias] = await pool.query('SELECT * FROM categorias ORDER BY nombre ASC');
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};