const { body, param, validationResult } = require('express-validator');
const { pickAndValidate } = require('../schemas/especificacionesSchemas');

// Helpers
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validators for activos
const pool = require('../config/database');

const validarCrearActivo = [
  body('categoria_id').optional().isInt().withMessage('categoria_id debe ser un entero'),
  body('nombre').exists().withMessage('nombre es requerido').isString().trim().notEmpty(),
  body('numero_serie').exists().withMessage('numero_serie es requerido').isString().trim().notEmpty(),
  body('estado').optional().isString(),
  body('especificaciones').optional().custom(async (value, { req }) => {
    // Aceptamos objeto o string JSON. Además, rechazamos claves sensibles que no deben persistir.
    if (typeof value !== 'object' && typeof value !== 'string') {
      throw new Error('especificaciones debe ser un objeto o string JSON');
    }

    // Si es string, intentar parsear para validar contenido
    let obj = value;
    if (typeof value === 'string') {
      try { obj = JSON.parse(value); } catch (e) { obj = null; }
    }
      if (obj && typeof obj === 'object') {
        if (Object.keys(obj).some(k => k.toLowerCase().includes('bitlocker_recovery_key') || k.toLowerCase().includes('recovery_key'))) {
          throw new Error('especificaciones contiene claves sensibles (bitlocker_recovery_key). No se permiten en el payload');
        }

        // If categoria_id provided, try to validate based on the category name
        let categoriaNombre = null;
        const cid = req.body.categoria_id || req.params?.categoria_id;
        if (cid) {
          try {
            const [rows] = await pool.query('SELECT nombre FROM categorias WHERE id = ?', [cid]);
            if (rows && rows.length) categoriaNombre = rows[0].nombre;
          } catch (e) {
            const logger = require('../utils/logger');
            logger.warn({ msg: 'Error consultando categoria para validacion', error: e.message || e });
          }
        }

        // Pass category name to pickAndValidate so it can select stricter schema when available
        const schemaResult = pickAndValidate(obj, categoriaNombre);
        if (schemaResult && schemaResult.errors) {
          const first = schemaResult.errors[0];
          throw new Error(`especificaciones: tipo ${schemaResult.schema} - ${first.instancePath || ''} ${first.message}`);
        }
    }
    return true;
  }),
  handleValidation
];

const validarActualizarActivo = [
  param('id').isInt().withMessage('id debe ser un entero'),
  body('categoria_id').optional().isInt().withMessage('categoria_id debe ser un entero'),
  body('numero_serie').optional().isString().trim(),
  body('nombre').optional().isString().trim(),
  body('especificaciones').optional().custom(async (value, { req }) => {
    if (typeof value !== 'object' && typeof value !== 'string') {
      throw new Error('especificaciones debe ser un objeto o string JSON');
    }

    let obj = value;
    if (typeof value === 'string') {
      try { obj = JSON.parse(value); } catch (e) { obj = null; }
    }
    if (obj && typeof obj === 'object') {
      if (Object.keys(obj).some(k => k.toLowerCase().includes('bitlocker_recovery_key') || k.toLowerCase().includes('recovery_key'))) {
        throw new Error('especificaciones contiene claves sensibles (bitlocker_recovery_key). No se permiten en el payload');
      }

      let categoriaNombre = null;
      const cid = req.body.categoria_id || req.params?.categoria_id;
      if (cid) {
        try {
          const [rows] = await pool.query('SELECT nombre FROM categorias WHERE id = ?', [cid]);
          if (rows && rows.length) categoriaNombre = rows[0].nombre;
        } catch (e) {
          console.warn('Error consultando categoria para validacion:', e.message || e);
        }
      }

      const schemaResult = pickAndValidate(obj);
      if (schemaResult && schemaResult.errors) {
        const first = schemaResult.errors[0];
        throw new Error(`especificaciones: tipo ${schemaResult.schema} - ${first.instancePath || ''} ${first.message}`);
      }
    }
    return true;
  }),
  handleValidation
];

// Validators for mantenimientos
const validarCrearMantenimiento = [
  body('activo_id').exists().isInt().withMessage('activo_id es requerido y debe ser entero'),
  body('tipo').exists().isIn(['preventivo', 'correctivo', 'emergencia']).withMessage('tipo inválido'),
  body('titulo').exists().isString().trim().notEmpty(),
  body('fecha_programada').optional().isISO8601().withMessage('fecha_programada debe ser una fecha válida'),
  handleValidation
];

// Validators for usuarios
const validarRegistroUsuario = [
  body('nombre').exists().isString().trim().notEmpty(),
  body('email').exists().isEmail().withMessage('email inválido'),
  body('password').exists().isLength({ min: 6 }).withMessage('password debe tener al menos 6 caracteres'),
  body('rol_id').optional().isInt(),
  handleValidation
];

const validarLogin = [
  body('email').exists().isEmail().withMessage('email inválido'),
  body('password').exists().withMessage('password es requerido'),
  handleValidation
];

module.exports = {
  validarCrearActivo,
  validarActualizarActivo,
  validarCrearMantenimiento,
  validarRegistroUsuario,
  validarLogin
};
