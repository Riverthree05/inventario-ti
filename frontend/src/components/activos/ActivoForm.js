import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, MenuItem, Typography, Paper, CircularProgress, Alert, InputAdornment, IconButton } from '@mui/material'; // Quité Stack porque no se usaba
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function ActivoForm() {
  const [categorias, setCategorias] = useState([]);
  const [activo, setActivo] = useState({
    categoria_id: '', nombre: '', marca: '', modelo: '', numero_serie: '',
    estado: 'Activo', ubicacion: '', proveedor: '', fecha_compra: '',
    precio_usd: '', responsable: '', notas: ''
  });
  const [especificaciones, setEspecificaciones] = useState({});
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
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
    // bitlocker is stored on the main 'activo' record
    if (name === 'bitlocker') {
      setActivo({ ...activo, bitlocker: value });
      return;
    }
    if (Object.keys(activo).includes(name)) {
      setActivo({ ...activo, [name]: value });
    } else {
      setEspecificaciones({ ...especificaciones, [name]: value });
    }
  };

  const toggleShowRecovery = () => setShowRecoveryKey(prev => !prev);

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
      .then(() => {
        // Mensaje de éxito antes de navegar
        alert('¡Dispositivo guardado con éxito!');
        navigate('/dashboard');
      })
      .catch(err => {
        const errorMessage = err.response?.data?.error || 'Error al guardar el dispositivo.';
        setError(errorMessage);
        
        // Scroll hacia arriba para mostrar el error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  // Estilo optimizado - coincide con la paleta del sistema
  const fieldStyle = {
    mb: 2,
    '& .MuiInputBase-root': { 
      backgroundColor: '#2c2c2c',
      color: 'white',
      '&:hover': { backgroundColor: '#383838' },
      '&.Mui-focused': { backgroundColor: '#383838' }
    },
    '& .MuiInputLabel-root': { 
      color: '#00bfff',
      '&.Mui-focused': { color: '#00bfff' }
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 191, 255, 0.3)',
      '&:hover': { borderColor: '#00bfff' }
    }
  };

  const renderCamposEspecificos = () => {
    const categoriaSeleccionada = categorias.find(c => c.id === Number(activo.categoria_id));
    if (!categoriaSeleccionada) return null;

    switch (categoriaSeleccionada.nombre) {
      case 'Laptop':
      case 'PC de Escritorio':
      case 'Servidor':
        return (
          <>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="CPU" name="cpu" value={especificaciones.cpu || ''} onChange={handleChange} sx={fieldStyle} />
              <TextField fullWidth label="RAM" name="ram" value={especificaciones.ram || ''} onChange={handleChange} sx={fieldStyle} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Disco Duro" name="disco_duro" value={especificaciones.disco_duro || ''} onChange={handleChange} sx={fieldStyle} />
              <TextField fullWidth label="Service Tag" name="service_tag" value={especificaciones.service_tag || ''} onChange={handleChange} sx={fieldStyle} />
            </Box>

            {/* BitLocker: solo para PCs/Laptops/Servidores */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                fullWidth
                label="BitLocker"
                name="bitlocker"
                value={activo.bitlocker || 'unknown'}
                onChange={handleChange}
                sx={fieldStyle}
              >
                <MenuItem value="enabled">Habilitado</MenuItem>
                <MenuItem value="disabled">Deshabilitado</MenuItem>
                <MenuItem value="unknown">Desconocido</MenuItem>
              </TextField>
            </Box>
            {/* Campo seguro para código de recuperación de BitLocker (enmascarado) */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Código de Recuperación BitLocker"
                name="bitlocker_recovery_key"
                type={showRecoveryKey ? 'text' : 'password'}
                value={especificaciones.bitlocker_recovery_key || ''}
                onChange={handleChange}
                sx={fieldStyle}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowRecovery} edge="end" sx={{ color: '#b3b3b3' }}>
                        {showRecoveryKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </>
        );
      case 'YubiKey':
        return <TextField fullWidth label="GID" name="gid" value={especificaciones.gid || ''} onChange={handleChange} sx={fieldStyle} />;
      case 'Switch':
        return <TextField fullWidth type="number" label="Número de Puertos" name="numero_puertos" value={especificaciones.numero_puertos || ''} onChange={handleChange} sx={fieldStyle} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Paper sx={{ 
        p: 3, mb: 3, textAlign: 'center', 
        backgroundColor: '#1e1e1e', 
        border: '1px solid rgba(0, 191, 255, 0.3)' 
      }}>
        <Typography variant="h4" sx={{ color: '#00bfff', fontWeight: 600, mb: 1 }}>
          {id ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
          {id ? 'Modifica la información del dispositivo' : 'Completa los campos para registrar un nuevo dispositivo'}
        </Typography>
      </Paper>

      {/* Formulario */}
      <Paper sx={{ p: 3, backgroundColor: '#1e1e1e', border: '1px solid rgba(0, 191, 255, 0.3)' }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Campos básicos */}
          <TextField
            select fullWidth required
            label="Categoría *"
            name="categoria_id"
            value={activo.categoria_id || ''}
            onChange={handleChange}
            disabled={!!id}
            sx={fieldStyle}
          >
            <MenuItem value="">-- Selecciona una categoría --</MenuItem>
            {categorias.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
            ))}
          </TextField>

          <TextField 
            fullWidth required
            label="Nombre del Dispositivo *" 
            name="nombre" 
            value={activo.nombre || ''} 
            onChange={handleChange}
            sx={fieldStyle}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="Marca" name="marca" value={activo.marca || ''} onChange={handleChange} sx={fieldStyle} />
            <TextField fullWidth label="Modelo" name="modelo" value={activo.modelo || ''} onChange={handleChange} sx={fieldStyle} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="Número de Serie" name="numero_serie" value={activo.numero_serie || ''} onChange={handleChange} sx={fieldStyle} />
            <TextField select fullWidth label="Estado" name="estado" value={activo.estado || 'Activo'} onChange={handleChange} sx={fieldStyle}>
              <MenuItem value="Activo">Activo</MenuItem>
              <MenuItem value="En Mantenimiento">En Mantenimiento</MenuItem>
              <MenuItem value="En reparación">En reparación</MenuItem>
              <MenuItem value="De baja">De baja</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="Ubicación" name="ubicacion" value={activo.ubicacion || ''} onChange={handleChange} sx={fieldStyle} />
            <TextField fullWidth label="Responsable" name="responsable" value={activo.responsable || ''} onChange={handleChange} sx={fieldStyle} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="Proveedor" name="proveedor" value={activo.proveedor || ''} onChange={handleChange} sx={fieldStyle} />
            <TextField fullWidth type="date" label="Fecha de Compra" name="fecha_compra" value={activo.fecha_compra || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={fieldStyle} />
          </Box>

          <TextField fullWidth type="number" label="Precio (USD)" name="precio_usd" value={activo.precio_usd || ''} onChange={handleChange} sx={fieldStyle} />

          {/* Especificaciones dinámicas */}
          {renderCamposEspecificos()}

          <TextField
            fullWidth multiline rows={3}
            label="Notas adicionales"
            name="notas"
            value={activo.notas || ''}
            onChange={handleChange}
            sx={fieldStyle}
          />

          {/* Error */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Botón */}
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            size="large"
            sx={{ 
              mt: 2, backgroundColor: '#00bfff', color: '#1e1e1e',
              '&:hover': { backgroundColor: '#0099cc', transform: 'translateY(-2px)' }
            }}
          >
            {id ? 'Guardar Cambios' : 'Crear Dispositivo'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ActivoForm;