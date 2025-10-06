import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { Link } from 'react-router-dom';
import { Box, Grid, Typography, Paper } from '@mui/material';
import StatCard from '../components/dashboard/StatCard';
import ActivoTabla from '../components/activos/ActivoTabla';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activos, setActivos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/reportes/estadisticas').then(res => setStats(res.data)).catch(err => setError('No se pudieron cargar las estadísticas.'));
    apiClient.get('/activos').then(res => setActivos(res.data)).catch(err => setError('No se pudieron cargar los activos.'));
  }, []);

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

  if (error) return <Typography color="error">{error}</Typography>;
  if (!stats) return <p style={{color: 'white'}}>Cargando dashboard...</p>;

  return (
    // ---- INICIA EL CONTENEDOR PRINCIPAL ----
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', marginBottom: 3 }}>
        Dashboard de Inventario
      </Typography>
      
      {/* Sección de Tarjetas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total de Activos" value={stats.totalActivos} />
        </Grid>
        {stats.activosPorEstado.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={item.estado}>
                <StatCard title={`Activos "${item.estado}"`} value={item.count} color={COLORS[index % COLORS.length]} />
            </Grid>
        ))}
      </Grid>
      
      {/* Sección de Gráfico y Tabla */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: 'white', height: '100%' }}>
            <Typography variant="h6">Activos por Estado</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.activosPorEstado} dataKey="count" nameKey="estado" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {stats.activosPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#333' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: 'white', height: '100%' }}>
            <Typography variant="h6">Últimos Activos Registrados</Typography>
            <ActivoTabla equipos={activos.slice(0, 5)} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
    
  );
}

export default Dashboard;