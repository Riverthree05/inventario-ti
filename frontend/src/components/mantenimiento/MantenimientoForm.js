import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  Alert 
} from '@mui/material';
import apiClient from '../../services/api';

function MantenimientoForm() {
  const { activoId } = useParams();
  const navigate = useNavigate();
  const [mantenimiento, setMantenimiento] = useState({
    activo_id: activoId,
    tipo: 'preventivo',
    titulo: '',
    descripcion: '',
    estado: 'programado',
    fecha_programada: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setMantenimiento({ ...mantenimiento, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    apiClient.post('/mantenimientos', mantenimiento)
      .then(() => {
        alert('¡Mantenimiento registrado con éxito!');
        navigate(`/activos/${activoId}`);
      })
      .catch(err => {
        const errorMessage = err.response?.data?.error || 'Error al registrar el mantenimiento.';
        setError(errorMessage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  return (
    <Box sx={{ maxWidth: { xs: '100%', md: '800px', lg: '1000px' }, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Paper 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1a2e1a 0%, #2e4016 50%, #604f0f 100%)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', md: '2.8rem', lg: '3.2rem' },
            mb: 2
          }}
        >
          Registrar Mantenimiento
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: { xs: '1rem', md: '1.2rem' },
            fontWeight: 400
          }}
        >
          Programa un nuevo mantenimiento para el Activo #{activoId}
        </Typography>
      </Paper>

      {/* Form Section */}
      <Paper 
        sx={{ 
          p: { xs: 3, md: 4, lg: 5 }, 
          borderRadius: 3,
          boxShadow: 4,
          background: 'linear-gradient(135deg, #1e1e1e 0%, #2c2c2c 100%)',
          border: '1px solid rgba(255, 193, 7, 0.2)'
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Sección: Información del Mantenimiento */}
            <Grid item xs={12}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#ffc107', 
                  fontWeight: 600, 
                  mb: 3,
                  borderBottom: '2px solid rgba(255, 193, 7, 0.3)',
                  pb: 1
                }}
              >
                Información del Mantenimiento
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título del Mantenimiento"
                name="titulo"
                value={mantenimiento.titulo}
                onChange={handleChange}
                required
                placeholder="Ej: Limpieza de ventiladores y reemplazo de pasta térmica"
                sx={{
                  minHeight: '56px',
                  '& .MuiInputBase-root': { 
                    fontSize: { xs: '1rem', lg: '1.125rem' },
                    minHeight: '56px'
                  },
                  '& .MuiInputLabel-root': { fontSize: { xs: '1rem', lg: '1.125rem' } }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tipo de Mantenimiento"
                name="tipo"
                value={mantenimiento.tipo}
                onChange={handleChange}
                sx={{
                  minHeight: '56px',
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '1rem', lg: '1.125rem' },
                    minHeight: '56px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderColor: 'rgba(255, 193, 7, 0.5)'
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: '#ffc107'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '1rem', lg: '1.125rem' },
                    color: '#ffc107',
                    fontWeight: 'bold',
                    '&.Mui-focused': {
                      color: '#ffc107'
                    }
                  },
                  '& .MuiSelect-select': {
                    color: '#ffffff',
                    fontWeight: '500'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 193, 7, 0.3)',
                    borderWidth: 2
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 193, 7, 0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffc107'
                  }
                }}
              >
                <MenuItem 
                  value="preventivo"
                  sx={{
                    color: '#4caf50',
                    backgroundColor: '#1e1e1e',
                    fontWeight: '600',
                    '&:hover': {
                      backgroundColor: '#2c2c2c',
                      color: '#66bb6a'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      color: '#4caf50',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  Preventivo
                </MenuItem>
                <MenuItem 
                  value="correctivo"
                  sx={{
                    color: '#ff9800',
                    backgroundColor: '#1e1e1e',
                    fontWeight: '600',
                    '&:hover': {
                      backgroundColor: '#2c2c2c',
                      color: '#ffb74d'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 152, 0, 0.2)',
                      color: '#ff9800',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  Correctivo
                </MenuItem>
                <MenuItem 
                  value="emergencia"
                  sx={{
                    color: '#f44336',
                    backgroundColor: '#1e1e1e',
                    fontWeight: '600',
                    '&:hover': {
                      backgroundColor: '#2c2c2c',
                      color: '#ef5350'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(244, 67, 54, 0.2)',
                      color: '#f44336',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  Emergencia
                </MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha Programada"
                name="fecha_programada"
                type="date"
                value={mantenimiento.fecha_programada}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minHeight: '56px',
                  '& .MuiInputBase-root': { 
                    fontSize: { xs: '1rem', lg: '1.125rem' },
                    minHeight: '56px'
                  },
                  '& .MuiInputLabel-root': { fontSize: { xs: '1rem', lg: '1.125rem' } }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Descripción del Mantenimiento"
                name="descripcion"
                value={mantenimiento.descripcion}
                onChange={handleChange}
                placeholder="Describe detalladamente las tareas a realizar durante el mantenimiento..."
                sx={{
                  '& .MuiInputBase-root': { 
                    fontSize: { xs: '1rem', lg: '1.125rem' }
                  },
                  '& .MuiInputLabel-root': { fontSize: { xs: '1rem', lg: '1.125rem' } }
                }}
              />
            </Grid>

            {/* Error Message */}
            {error && (
              <Grid item xs={12}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: { xs: '0.875rem', lg: '1rem' }
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Error al registrar mantenimiento
                  </Typography>
                  <Typography variant="body2">
                    {error}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                size="large"
                sx={{ 
                  mt: { xs: 2, md: 3 }, 
                  p: { xs: 1.5, md: 2, lg: 2.5 },
                  fontSize: { xs: '1rem', md: '1.1rem', lg: '1.2rem' },
                  fontWeight: 'bold',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                  color: '#000',
                  textTransform: 'none',
                  boxShadow: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff8f00 0%, #f57c00 100%)',
                    boxShadow: 6,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Registrar Mantenimiento
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default MantenimientoForm;