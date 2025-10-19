const pool = require('../config/database');

// OBTENER todos los activos
exports.obtenerTodos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.*, c.nombre as categoria_nombre 
            FROM activos a 
            LEFT JOIN categorias c ON a.categoria_id = c.id
        `);
        res.json(rows);
    } catch (err) {
        console.error("Error en obtenerTodos:", err);
        res.status(500).json({ error: 'Error al obtener los activos' });
    }
};

// OBTENER un activo por ID
exports.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT a.*, c.nombre as categoria_nombre 
            FROM activos a 
            LEFT JOIN categorias c ON a.categoria_id = c.id 
            WHERE a.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Activo no encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error en obtenerPorId:", err);
        res.status(500).json({ error: 'Error al obtener el activo' });
    }
};

// CREAR un nuevo activo
exports.crear = async (req, res) => {
    try {
        const datosActivo = { ...req.body };
        
        // Manejar especificaciones
        if (datosActivo.especificaciones && typeof datosActivo.especificaciones === 'object') {
            datosActivo.especificaciones = JSON.stringify(datosActivo.especificaciones);
        }
        
        const [result] = await pool.query('INSERT INTO activos SET ?', datosActivo);
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Activo creado con éxito' 
        });
    } catch (err) {
        console.error("Error en crear:", err);
        res.status(500).json({ error: 'Error al crear el activo' });
    }
};

// ACTUALIZAR un activo existente
exports.actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Lista de campos permitidos en la tabla activos
        const camposPermitidos = [
            'categoria_id', 'nombre', 'marca', 'modelo', 'numero_serie',
            'estado', 'ubicacion', 'proveedor', 'fecha_compra', 'precio_usd',
            'responsable', 'notas'
        ];
        
        // Filtrar solo campos permitidos
        const datosAActualizar = {};
        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                datosAActualizar[campo] = req.body[campo];
            }
        });
        
        // Manejar especificaciones aparte
        if (req.body.especificaciones) {
            const especificacionesObj = typeof req.body.especificaciones === 'object' 
                ? req.body.especificaciones 
                : {};
            datosAActualizar.especificaciones = JSON.stringify(especificacionesObj);
        }

        const [result] = await pool.query('UPDATE activos SET ? WHERE id = ?', [datosAActualizar, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Activo no encontrado' });
        }
        res.json({ message: 'Activo actualizado con éxito' });
    } catch (err) {
        console.error("Error en actualizar:", err);
        res.status(500).json({ error: 'Error al actualizar el activo' });
    }
};

// ELIMINAR un activo
exports.eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM activos WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Activo no encontrado' });
        }
        res.json({ message: 'Activo eliminado con éxito' });
    } catch (err) {
        console.error("Error en eliminar:", err);
        res.status(500).json({ error: 'Error al eliminar el activo' });
    }
};