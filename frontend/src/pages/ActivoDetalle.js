import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import MantenimientoHistorial from '../components/mantenimiento/MantenimientoHistorial';
// Importar componentes de Material-UI
import { Box, Typography, Paper, Grid, Button, Divider, CircularProgress } from '@mui/material';

function ActivoDetalle() {
  const [activo, setActivo] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // La lógica para cargar datos se mantiene igual
    apiClient.get(`/activos/${id}`)
      .then(res => {
        const data = res.data || {};
        setActivo(data);
        if (Array.isArray(data.warnings) && data.warnings.length) setWarnings(data.warnings);
      })
      .catch(err => {
        console.error('Error al obtener el activo:', err);
        setError('No se pudo cargar la información del activo.');
      });

    apiClient.get(`/mantenimientos/activo/${id}`)
      .then(res => setMantenimientos(res.data))
      .catch(err => console.error('Error al obtener mantenimientos:', err));

    apiClient.get(`/qr/activo/${id}`)
      .then(res => setQrCodeUrl(res.data.qrDataUrl))
      .catch(err => console.error('Error al obtener el QR:', err));
  }, [id]);

  const handleEliminar = () => {
    if (!activo) return;
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar el activo "${activo.nombre}"?`);
    if (confirmar) {
      apiClient.delete(`/activos/${id}`)
        .then(() => navigate('/dashboard'))
        .catch(err => setError(err.response?.data?.error || 'No se pudo eliminar el activo.'));
    }
  };

  const handleImprimir = () => {
    window.open(`/activos/etiqueta/${id}`, '_blank');
  };

  // Mostrar error si existe
  if (error) return <Typography color="error" sx={{ p: 3 }}>Error: {error}</Typography>;
  // Mostrar indicador de carga si los datos aún no llegan
  if (!activo) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  // Parsear especificaciones de forma segura
  let especificaciones = {};
  if (activo.especificaciones && typeof activo.especificaciones === 'string') {
    try {
      especificaciones = JSON.parse(activo.especificaciones);
    } catch (e) {
      console.error("Error al parsear especificaciones JSON:", e);
    }
  } else if (activo.especificaciones) {
    especificaciones = activo.especificaciones;
  }

  // Helper para renderizar valores de especificaciones de forma segura
  const renderSpecValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'object') {
      // Arreglo -> lista simple
      if (Array.isArray(val)) {
        return (
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {val.map((it, idx) => (
              <li key={idx}>{renderSpecValue(it)}</li>
            ))}
          </Box>
        );
      }

      // Objeto -> listar claves/valores anidados
      return (
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {Object.entries(val).map(([k, v]) => (
            <li key={k}>
              <strong>{k.replace(/_/g, ' ').toUpperCase()}:</strong> {renderSpecValue(v)}
            </li>
          ))}
        </Box>
      );
    }

    // Primitivo
    return String(val);
  };

  return (
    // Usar Paper como contenedor principal
    <Paper sx={{ p: 3, margin: 'auto', maxWidth: 1200, flexGrow: 1 }}>
      {/* Mostrar advertencias de sanitización si las hay */}
      {warnings.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {warnings.map((w, idx) => (
            <Box key={idx} sx={{ mb: 1, p: 1, borderLeft: '4px solid #ff9800', backgroundColor: '#fff8e1' }}>
              <strong>Advertencia:</strong> {w}
            </Box>
          ))}
        </Box>
      )}
      <Typography variant="h4" gutterBottom>{activo.nombre}</Typography>

      <Grid container spacing={4}>
        {/* Columna Izquierda: Datos y Especificaciones */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>Datos Generales</Typography>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, mb: 2 }}>
            <li><strong>Categoría:</strong> {activo.categoria_nombre || 'N/A'}</li>
            <li><strong>Marca:</strong> {activo.marca || 'N/A'}</li>
            <li><strong>Modelo:</strong> {activo.modelo || 'N/A'}</li>
            <li><strong>Número de Serie:</strong> {activo.numero_serie || 'N/A'}</li>
            <li><strong>Estado:</strong> {activo.estado || 'N/A'}</li>
            <li><strong>Ubicación:</strong> {activo.ubicacion || 'N/A'}</li>
            <li><strong>Responsable:</strong> {activo.responsable || 'N/A'}</li>
            <li><strong>Proveedor:</strong> {activo.proveedor || 'N/A'}</li>
            <li><strong>Fecha Compra:</strong> {activo.fecha_compra ? new Date(activo.fecha_compra).toLocaleDateString() : 'N/A'}</li>
            <li><strong>Precio (USD):</strong> ${activo.precio_usd || '0.00'}</li>
            <li><strong>Notas:</strong> {activo.notas || 'N/A'}</li>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>Especificaciones</Typography>
          <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
            {Object.keys(especificaciones).length > 0 ? (
              Object.entries(especificaciones).map(([key, value]) => (
                <li key={key}>
                  <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong>{' '}
                  {renderSpecValue(value)}
                </li>
              ))
            ) : (
              <li>No hay especificaciones adicionales para esta categoría.</li>
            )}
          </Box>
        </Grid>

        {/* Columna Derecha: QR */}
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Código QR</Typography>
          {qrCodeUrl ? (
            <Box component="img" src={qrCodeUrl} alt={`QR para ${activo.nombre}`} sx={{ width: '100%', maxWidth: 200, border: '1px solid', borderColor: 'divider', p: 1, mt: 1 }} />
          ) : <CircularProgress sx={{ mt: 2 }} />}
          <Button variant="outlined" onClick={handleImprimir} sx={{ mt: 2 }} fullWidth>
            Imprimir Etiqueta
          </Button>
        </Grid>
      </Grid>

      {/* Historial de Mantenimiento */}
      <Box sx={{ mt: 4 }}>
        <MantenimientoHistorial mantenimientos={mantenimientos} />
      </Box>

      {/* Botones de Acción */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        <Button variant="contained" component={Link} to="/dashboard">Volver al Dashboard</Button>
        <Button variant="outlined" color="primary" component={Link} to={`/activos/editar/${id}`}>Editar</Button>
        <Button variant="contained" color="error" onClick={handleEliminar}>Eliminar</Button>
        <Button variant="contained" color="success" component={Link} to={`/mantenimientos/nuevo/${id}`}>Registrar Mantenimiento</Button>
      </Box>
    </Paper>
  );
}

export default ActivoDetalle;