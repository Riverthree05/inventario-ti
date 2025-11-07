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
        const logger = require('../utils/logger');
        logger.error({ msg: 'Error en obtenerTodos', error: err.message || err });
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
        const logger = require('../utils/logger');
        logger.error({ msg: 'Error en obtenerPorId', error: err.message || err });
        res.status(500).json({ error: 'Error al obtener el activo' });
    }
};

// CREAR un nuevo activo
exports.crear = async (req, res) => {
    try {
        // Lista de campos permitidos para insertar (evitar pasar campos inesperados que rompan la consulta)
        const camposPermitidos = [
            'bitlocker',
            'categoria_id', 'nombre', 'marca', 'modelo', 'numero_serie',
            'estado', 'ubicacion', 'proveedor', 'fecha_compra', 'precio_usd',
            'responsable', 'notas'
        ];

        const datosActivo = {};
        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) datosActivo[campo] = req.body[campo];
        });

    // Prepare warnings collector
    let warnings = [];

    // Manejar especificaciones (serializar si viene como objeto) con saneamiento
    if (req.body.especificaciones) {
            // Aceptamos especificaciones como string JSON o como objeto.
            let specsObj = {};
            if (typeof req.body.especificaciones === 'string') {
                try { specsObj = JSON.parse(req.body.especificaciones); } catch (e) { specsObj = {}; }
            } else if (typeof req.body.especificaciones === 'object' && req.body.especificaciones !== null) {
                specsObj = req.body.especificaciones;
            }

            const { sanitizeObject } = require('../utils/specsUtils');
            const warnings = [];
            // Sanear y normalizar (también elimina claves sensibles según util)
            const sanitized = sanitizeObject(specsObj, warnings);

            // Si el cliente envió estado bitlocker a nivel de payload, úsalo
            if (req.body.bitlocker && !datosActivo.bitlocker) {
                datosActivo.bitlocker = req.body.bitlocker;
            }

            datosActivo.especificaciones = JSON.stringify(sanitized);
        }

    const [result] = await pool.query('INSERT INTO activos SET ?', datosActivo);
    const resp = { id: result.insertId, message: 'Activo creado con éxito' };
    if (Array.isArray(warnings) && warnings.length) resp.warnings = warnings;
    res.status(201).json(resp);
    } catch (err) {
        const logger = require('../utils/logger');
        logger.error({ msg: 'Error en crear', error: err.message || err });
        
        // Manejo específico de errores comunes
        if (err.code === 'ER_DUP_ENTRY') {
            if (err.sqlMessage.includes('numero_serie')) {
                return res.status(409).json({ 
                    error: 'El número de serie ya existe en el sistema. Por favor, ingresa un número de serie único.' 
                });
            }
            return res.status(409).json({ 
                error: 'Ya existe un activo con esta información. Verifica los datos duplicados.' 
            });
        }
        
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
        
    // Prepare warnings collector
    let warnings = [];

    // Manejar especificaciones aparte (saneamiento y eliminación de datos sensibles)
    if (req.body.especificaciones) {
            let specsObj = {};
            if (typeof req.body.especificaciones === 'string') {
                try { specsObj = JSON.parse(req.body.especificaciones); } catch (e) { specsObj = {}; }
            } else if (typeof req.body.especificaciones === 'object' && req.body.especificaciones !== null) {
                specsObj = req.body.especificaciones;
            }

            const { sanitizeObject } = require('../utils/specsUtils');
            const warnings = [];
            const sanitized = sanitizeObject(specsObj, warnings);

            if (req.body.bitlocker && !datosAActualizar.bitlocker) {
                datosAActualizar.bitlocker = req.body.bitlocker;
            }

            datosAActualizar.especificaciones = JSON.stringify(sanitized);
        }

    const [result] = await pool.query('UPDATE activos SET ? WHERE id = ?', [datosAActualizar, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Activo no encontrado' });
        }
        const resp = { message: 'Activo actualizado con éxito' };
        if (Array.isArray(warnings) && warnings.length) resp.warnings = warnings;
        res.json(resp);
    } catch (err) {
        const logger = require('../utils/logger');
        logger.error({ msg: 'Error en actualizar', error: err.message || err });
        
        // Manejo específico del error de duplicado de número de serie
        if (err.code === 'ER_DUP_ENTRY' && err.message.includes('numero_serie')) {
            return res.status(409).json({ 
                error: '⚠️ Ya existe un dispositivo con este número de serie. Por favor, utilice un número de serie único.' 
            });
        }
        
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
        const logger = require('../utils/logger');
        logger.error({ msg: 'Error en eliminar', error: err.message || err });
        res.status(500).json({ error: 'Error al eliminar el activo' });
    }
};