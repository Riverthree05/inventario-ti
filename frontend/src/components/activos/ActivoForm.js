import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, MenuItem, Typography, Grid, Paper, CircularProgress } from '@mui/material'; // Import CircularProgress

function ActivoForm() {
  const [categorias, setCategorias] = useState([]);
  const [activo, setActivo] = useState({
    categoria_id: '', nombre: '', marca: '', modelo: '', numero_serie: '',
    estado: 'Activo', ubicacion: '', proveedor: '', fecha_compra: '',
    precio_usd: '', responsable: '', notas: ''
  });
  const [especificaciones, setEspecificaciones] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    setIsLoading(true); // Start loading
    apiClient.get('/categorias')
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Error al cargar categorías", err));

    if (id) {
      apiClient.get(`/activos/${id}`)
        .then(res => {
          const { especificaciones: specsStr, ...datosComunes } = res.data;
          let especificacionesParseadas = {};
          try {
            // Parse specs only if it's a non-empty string
            if (specsStr && typeof specsStr === 'string') {
              especificacionesParseadas = JSON.parse(specsStr);
            } else if (specsStr) {
               // If it's already an object (shouldn't happen with correct backend)
              especificacionesParseadas = specsStr;
            }
          } catch (e) { console.error("Error al parsear JSON:", e); }

          // Ensure fecha_compra is formatted correctly or set to empty string
          if (datosComunes.fecha_compra) {
            datosComunes.fecha_compra = new Date(datosComunes.fecha_compra).toISOString().split('T')[0];
          } else {
            datosComunes.fecha_compra = ''; // Handle null date
          }

          // Ensure precio_usd is a number or empty string
           datosComunes.precio_usd = datosComunes.precio_usd ? Number(datosComunes.precio_usd) : '';


          setActivo(datosComunes);
          setEspecificaciones(especificacionesParseadas);
          setIsLoading(false); // Stop loading after data is set
        })
        .catch(err => {
          setError("No se pudo cargar el activo para editar.");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false); // Stop loading if it's a new form
    }
  }, [id]); // Dependency array includes id

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (Object.keys(activo).includes(name)) {
      setActivo({ ...activo, [name]: value });
    } else {
      setEspecificaciones({ ...especificaciones, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
     // Combine common fields and specifications, ensuring specs is an object
    const datosCompletos = {
        ...activo,
        // Ensure specs is an object, even if empty, before sending
        especificaciones: (typeof especificaciones === 'object' && especificaciones !== null) ? especificaciones : {}
      };

    const request = id
      ? apiClient.put(`/activos/${id}`, datosCompletos)
      : apiClient.post('/activos', datosCompletos);

    request
      .then(() => navigate('/dashboard'))
      .catch(err => setError(err.response?.data?.error || 'Error al guardar.'));
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;


  const renderCamposEspecificos = () => {
    const categoriaSeleccionada = categorias.find(c => c.id === Number(activo.categoria_id));
    if (!categoriaSeleccionada) return null;

    // Use value={especificaciones.fieldName || ''} for all specific fields
    switch (categoriaSeleccionada.nombre) {
      case 'Laptop':
      case 'PC de Escritorio':
      case 'Servidor':
        return (
          <>
            <Grid item xs={12} sm={6}><TextField fullWidth label="CPU" name="cpu" value={especificaciones.cpu || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="RAM" name="ram" value={especificaciones.ram || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Disco Duro" name="disco_duro" value={especificaciones.disco_duro || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Service Tag" name="service_tag" value={especificaciones.service_tag || ''} onChange={handleChange} /></Grid>
          </>
        );
      case 'YubiKey':
        return <Grid item xs={12} sm={6}><TextField fullWidth label="GID" name="gid" value={especificaciones.gid || ''} onChange={handleChange} /></Grid>;
       case 'Switch':
        return <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Número de Puertos" name="numero_puertos" value={especificaciones.numero_puertos || ''} onChange={handleChange} /></Grid>;
      // Add more cases for other categories here
      default:
        return null;
    }
  };

  return (
    // Use Paper for a nice background and padding
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 2 }}>
        {id ? '✏️ Editar Dispositivo' : '➕ Agregar Nuevo Dispositivo'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {id ? 'Modifica la información del dispositivo seleccionado.' : 'Completa la información para registrar un nuevo dispositivo en el inventario.'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Category Selector */}
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Categoría"
              name="categoria_id"
              value={activo.categoria_id || ''} // Ensure value is controlled
              onChange={handleChange}
              required
              disabled={!!id} // Disable category change when editing
            >
              <MenuItem value="">-- Selecciona una categoría --</MenuItem>
              {categorias.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Common Fields */}
          <Grid item xs={12} sm={6}><TextField fullWidth label="Nombre" name="nombre" value={activo.nombre || ''} onChange={handleChange} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Marca" name="marca" value={activo.marca || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Modelo" name="modelo" value={activo.modelo || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Número de Serie" name="numero_serie" value={activo.numero_serie || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Ubicación" name="ubicacion" value={activo.ubicacion || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Responsable" name="responsable" value={activo.responsable || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Proveedor" name="proveedor" value={activo.proveedor || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Precio (USD)" name="precio_usd" type="number" step="0.01" value={activo.precio_usd || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField
                select
                fullWidth
                label="Estado"
                name="estado"
                value={activo.estado || 'Activo'} // Default to 'Activo' if undefined
                onChange={handleChange}
            >
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="En Mantenimiento">En Mantenimiento</MenuItem>
                <MenuItem value="En reparación">En reparación</MenuItem>
                <MenuItem value="De baja">De baja</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha de Compra"
              name="fecha_compra"
              type="date"
              value={activo.fecha_compra || ''} // Handle null/undefined date
              onChange={handleChange}
              InputLabelProps={{ shrink: true }} // Keep label floated
            />
          </Grid>

          {/* Dynamic Specific Fields */}
          {renderCamposEspecificos()}

          {/* Notes Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notas"
              name="notas"
              value={activo.notas || ''}
              onChange={handleChange}
            />
          </Grid>

          {/* Error Message */}
          {error && <Grid item xs={12}><Typography color="error">{error}</Typography></Grid>}

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, p: 1.5 }}>
              {id ? 'Guardar Cambios' : 'Guardar Activo'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

export default ActivoForm;