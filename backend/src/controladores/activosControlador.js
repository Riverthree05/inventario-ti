const pool = require('../config/database');

exports.obtenerTodos = async (req, res) => {
    try {
        const query = `SELECT a.*, c.nombre AS categoria_nombre FROM activos a LEFT JOIN categorias c ON a.categoria_id = c.id ORDER BY a.id DESC;`;
        const [results] = await pool.query(query);
        res.json(results);
    } catch (err) { res.status(500).json({ error: 'Error al consultar los activos' }); }
};
exports.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `SELECT a.*, c.nombre AS categoria_nombre FROM activos a LEFT JOIN categorias c ON a.categoria_id = c.id WHERE a.id = ?;`;
        const [results] = await pool.query(query, [id]);
        if (results.length === 0) return res.status(404).json({ error: 'Activo no encontrado' });
        res.json(results[0]);
    } catch (err) { res.status(500).json({ error: 'Error al consultar el activo' }); }
};
exports.crear = async (req, res) => {
    try {
        const { categoria_id, nombre, ...especificaciones } = req.body;
        const datosComunes = { ...req.body };
        delete datosComunes.especificaciones;
        datosComunes.especificaciones = JSON.stringify(especificaciones);
        const [result] = await pool.query('INSERT INTO activos SET ?', [datosComunes]);
        res.status(201).json({ message: 'Activo creado con éxito', id: result.insertId });
    } catch (err) { res.status(500).json({ error: 'Error al crear el activo' }); }
};
exports.actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoria_id, nombre, ...especificaciones } = req.body;
        const datosAActualizar = { ...req.body };
        delete datosAActualizar.especificaciones;
        datosAActualizar.especificaciones = JSON.stringify(especificaciones);
        const [result] = await pool.query('UPDATE activos SET ? WHERE id = ?', [datosAActualizar, id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Activo no encontrado' });
        res.json({ message: 'Activo actualizado con éxito' });
    } catch (err) { res.status(500).json({ error: 'Error al actualizar el activo' }); }
};
exports.eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM activos WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Activo no encontrado' });
        res.json({ message: 'Activo eliminado con éxito' });
    } catch (err) { res.status(500).json({ error: 'Error al eliminar el activo' }); }
};