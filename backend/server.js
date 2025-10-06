require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Importar rutas
const usuariosRoutes = require('./src/rutas/usuarios');
const categoriasRoutes = require('./src/rutas/categorias');
const activosRoutes = require('./src/rutas/activos');
const mantenimientoRoutes = require('./src/rutas/mantenimiento');
const qrRoutes = require('./src/rutas/qr');
const reportesRoutes = require('./src/rutas/reportes'); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Muestra logs de las peticiones en la consola

// Conectar las rutas de la API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/activos', activosRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/reportes', reportesRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});