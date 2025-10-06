const pool = require('../config/database');

exports.crearMantenimiento = async (req, res) => {
    try {
        const { activo_id, tipo, titulo, descripcion, estado, fecha_programada } = req.body;
        const usuario_id = req.usuario.id;
        const nuevoMantenimiento = { activo_id, usuario_id, tipo, titulo, descripcion, estado, fecha_programada };
        const [result] = await pool.query('INSERT INTO mantenimientos SET ?', [nuevoMantenimiento]);
        res.status(201).json({ message: 'Mantenimiento registrado con éxito', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar el mantenimiento' });
    }
};
exports.obtenerMantenimientosPorActivo = async (req, res) => {
    try {
        const { activoId } = req.params;
        const query = `SELECT m.*, u.nombre AS nombre_tecnico FROM mantenimientos m JOIN usuarios u ON m.usuario_id = u.id WHERE m.activo_id = ? ORDER BY m.fecha_programada DESC;`;
        const [results] = await pool.query(query, [activoId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los mantenimientos' });
    }
};