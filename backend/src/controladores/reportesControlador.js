const pool = require('../config/database');

exports.obtenerEstadisticas = async (req, res) => {
    try {
        const [totalResult] = await pool.query('SELECT COUNT(*) AS total FROM activos');
        const [porEstadoResult] = await pool.query('SELECT estado, COUNT(*) AS count FROM activos GROUP BY estado');
        const [porCategoriaResult] = await pool.query('SELECT c.nombre, COUNT(a.id) AS count FROM categorias c LEFT JOIN activos a ON c.id = a.categoria_id GROUP BY c.nombre');

        res.json({
            totalActivos: totalResult[0].total,
            activosPorEstado: porEstadoResult,
            activosPorCategoria: porCategoriaResult
        });
    } catch (error) {
        console.error('Error al generar estadísticas:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};