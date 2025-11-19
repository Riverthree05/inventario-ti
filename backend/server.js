require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { applySecurity } = require('./src/middleware/security');

// Importar rutas
const usuariosRoutes = require('./src/rutas/usuarios');
const categoriasRoutes = require('./src/rutas/categorias');
const activosRoutes = require('./src/rutas/activos');
const mantenimientoRoutes = require('./src/rutas/mantenimiento');
const qrRoutes = require('./src/rutas/qr');
const reportesRoutes = require('./src/rutas/reportes'); 

const app = express();

// Middlewares
// Apply security (helmet, rate-limit, cors policy)
applySecurity(app);
app.use(express.json());
app.use(morgan('dev')); // Muestra logs de las peticiones en la consola

// Health endpoint for readiness/liveness checks
app.get('/healthz', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Conectar las rutas de la API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/activos', activosRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/reportes', reportesRoutes);

// Error handler (must be after routes)
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

// Export app for testing; start server only when run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;