import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { Link } from 'react-router-dom';
import { Box, Grid, Typography, Paper, CircularProgress, Button, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import StatCard from '../components/dashboard/StatCard';
import ActivoTabla from '../components/activos/ActivoTabla';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activos, setActivos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Usamos Promise.all para cargar todo en paralelo
    Promise.all([
      apiClient.get('/reportes/estadisticas'),
      apiClient.get('/activos') // Asegúrate de que esta ruta sea correcta
    ]).then(([statsRes, activosRes]) => {
      setStats(statsRes.data);
      setActivos(activosRes.data);
      setError(''); // Limpia cualquier error previo si las llamadas tienen éxito
    }).catch(err => {
      console.error('Error al cargar datos del dashboard:', err);
      // Extrae un mensaje de error más específico si es posible
      const errorMessage = err.response?.data?.error || err.message || 'No se pudieron cargar los datos. Verifica la conexión con el servidor o intenta iniciar sesión de nuevo.';
      setError(errorMessage);
      setStats({}); // Poner un objeto vacío para que deje de mostrar "Cargando..."
      setActivos([]);
    });
  }, []); // El array vacío asegura que solo se ejecute una vez al montar

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

  // --- Lógica de Renderizado Corregida ---
  // 1. Si hay un error, lo mostramos primero.
  if (error) {
    return <Typography color="error" sx={{ p: 3 }}>Error: {error}</Typography>;
  }

  // 2. Si no hay error, pero aún no tenemos 'stats', mostramos el indicador de carga.
  if (!stats) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }
  // ------------------------------------

  return (
    <Box sx={{ flexGrow: 1, maxWidth: '100%' }}>
      {/* Header mejorado */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: { xs: 2, md: 4 },
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' }
          }}
        >
          Dashboard
        </Typography>
        <Button
          component={Link}
          to="/activos/nuevo"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          size="large"
          sx={{ 
            px: { xs: 2, md: 4 }, 
            py: { xs: 1, md: 2 }, 
            fontSize: { xs: '0.9rem', md: '1.1rem', lg: '1.2rem' },
            fontWeight: 'bold',
            boxShadow: 3,
            borderRadius: 3,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)',
            '&:hover': { 
              boxShadow: 6,
              background: 'linear-gradient(135deg, #0099cc 0%, #007aa3 100%)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          Agregar Dispositivo
        </Button>
      </Box>
      
      {/* Sección de Tarjetas Responsivas Mejorada */}
      <Grid container spacing={{ xs: 2, md: 3, lg: 4 }} sx={{ mb: { xs: 3, md: 5 } }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total de Activos" value={stats.totalActivos ?? 'N/A'} />
        </Grid>
        {stats.activosPorEstado && stats.activosPorEstado.map((item, index) => (
            <Grid item xs={12} sm={6} lg={3} key={item.estado}>
                <StatCard title={`Activos en "${item.estado}"`} value={item.count ?? 'N/A'} color={COLORS[index % COLORS.length]} />
            </Grid>
        ))}
      </Grid>
      
      {/* Sección de Gráfico y Tabla Responsiva Mejorada */}
      <Grid container spacing={{ xs: 2, md: 3, lg: 4 }}>
        <Grid item xs={12} xl={5}>
          <Paper sx={{ 
            p: { xs: 2, md: 3, lg: 4 }, 
            height: { xs: 400, md: 500, lg: 550 },
            borderRadius: 3,
            boxShadow: 3
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                fontWeight: 600,
                fontSize: { xs: '1.25rem', md: '1.5rem', lg: '1.75rem' }
              }}
            >
              Activos por Estado
            </Typography>
            {stats.activosPorEstado && stats.activosPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie 
                    data={stats.activosPorEstado} 
                    dataKey="count" 
                    nameKey="estado" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    fill="#8884d8" 
                    label
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {stats.activosPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#2c2c2c',
                      border: '2px solid #00bfff',
                      borderRadius: '12px',
                      color: '#ffffff',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
                    }}
                    labelStyle={{
                      color: '#00bfff',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    }}
                    itemStyle={{
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontSize: '14px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : <Typography sx={{mt: 2, textAlign: 'center', color: 'text.secondary'}}>No hay datos de estado para mostrar.</Typography>}
          </Paper>
        </Grid>
        
        <Grid item xs={12} xl={7}>
          <Paper sx={{ 
            p: { xs: 2, md: 3, lg: 4 }, 
            height: { xs: 400, md: 500, lg: 550 },
            borderRadius: 3,
            boxShadow: 3
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                fontWeight: 600,
                fontSize: { xs: '1.25rem', md: '1.5rem', lg: '1.75rem' }
              }}
            >
              Últimos Activos Registrados
            </Typography>
            <ActivoTabla equipos={activos.slice(0, 5)} />
          </Paper>
        </Grid>
      </Grid>

      {/* Botón flotante para dispositivos móviles */}
      <Fab
        component={Link}
        to="/activos/nuevo"
        color="primary"
        aria-label="agregar dispositivo"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' }, // Solo visible en móviles
          boxShadow: 4,
          '&:hover': { boxShadow: 8 }
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default Dashboard;