import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

function ActivoForm() {
  const [categorias, setCategorias] = useState([]);
  const [activo, setActivo] = useState({
    categoria_id: '',
    nombre: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    estado: 'Activo',
    ubicacion: '',
    proveedor: '',
    fecha_compra: '',
    precio_usd: '',
    responsable: '',
    notas: ''
  });
  const [especificaciones, setEspecificaciones] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    apiClient.get('/categorias')
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Error al cargar categorías", err));
    
    if (id) {
        // Lógica para cargar los datos del activo en modo edición
    } else {
        setIsLoading(false);
    }
  }, [id]);

  const handleActivoChange = (e) => {
    setActivo({ ...activo, [e.target.name]: e.target.value });
  };

  const handleEspecificacionesChange = (e) => {
    setEspecificaciones({ ...especificaciones, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const datosCompletos = { ...activo, ...especificaciones };
    
    const request = id 
      ? apiClient.put(`/activos/${id}`, datosCompletos) 
      : apiClient.post('/activos', datosCompletos);

    request
      .then(() => navigate('/dashboard'))
      .catch(err => setError(err.response?.data?.error || 'Error al guardar.'));
  };
  
  if (isLoading) return <div style={{ color: 'white' }}>Cargando formulario...</div>;

  const renderCamposEspecificos = () => {
    const categoriaSeleccionada = categorias.find(c => c.id === Number(activo.categoria_id));
    if (!categoriaSeleccionada) return null;

    switch (categoriaSeleccionada.nombre) {
      case 'Laptop':
      case 'PC de Escritorio':
      case 'Servidor':
        return (
          <>
            <div className="form-field"><label>CPU:</label><input type="text" name="cpu" value={especificaciones.cpu || ''} onChange={handleEspecificacionesChange} /></div>
            <div className="form-field"><label>RAM:</label><input type="text" name="ram" value={especificaciones.ram || ''} onChange={handleEspecificacionesChange} /></div>
            <div className="form-field"><label>Disco Duro:</label><input type="text" name="disco_duro" value={especificaciones.disco_duro || ''} onChange={handleEspecificacionesChange} /></div>
            <div className="form-field"><label>Service Tag:</label><input type="text" name="service_tag" value={especificaciones.service_tag || ''} onChange={handleEspecificacionesChange} /></div>
          </>
        );
      case 'YubiKey':
        return (
          <div className="form-field"><label>GID:</label><input type="text" name="gid" value={especificaciones.gid || ''} onChange={handleEspecificacionesChange} /></div>
        );
      case 'Switch':
        return (
          <div className="form-field"><label>Número de Puertos:</label><input type="number" name="numero_puertos" value={especificaciones.numero_puertos || ''} onChange={handleEspecificacionesChange} /></div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>{id ? 'Editar Activo' : 'Añadir Nuevo Activo'}</h2>
        
        <div className="form-field">
          <label>Categoría:</label>
          <select name="categoria_id" value={activo.categoria_id} onChange={handleActivoChange} required>
            <option value="">-- Selecciona una categoría --</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-columns">
          <div className="form-column">
            <div className="form-field"><label>Nombre:</label><input type="text" name="nombre" value={activo.nombre || ''} onChange={handleActivoChange} required /></div>
            <div className="form-field"><label>Marca:</label><input type="text" name="marca" value={activo.marca || ''} onChange={handleActivoChange} /></div>
            <div className="form-field"><label>Modelo:</label><input type="text" name="modelo" value={activo.modelo || ''} onChange={handleActivoChange} /></div>
            <div className="form-field"><label>Número de Serie:</label><input type="text" name="numero_serie" value={activo.numero_serie || ''} onChange={handleActivoChange} /></div>
            <div className="form-field"><label>Ubicación:</label><input type="text" name="ubicacion" value={activo.ubicacion || ''} onChange={handleActivoChange} /></div>
            <div className="form-field"><label>Proveedor:</label><input type="text" name="proveedor" value={activo.proveedor || ''} onChange={handleActivoChange} /></div>
            <div className="form-field"><label>Responsable:</label><input type="text" name="responsable" value={activo.responsable || ''} onChange={handleActivoChange} /></div>
          </div>
          <div className="form-column">
            <div className="form-field"><label>Fecha de Compra:</label><input type="date" name="fecha_compra" value={activo.fecha_compra || ''} onChange={handleActivoChange} /></div>
            <div className="form-field"><label>Precio (USD):</label><input type="number" step="0.01" name="precio_usd" value={activo.precio_usd || ''} onChange={handleActivoChange} /></div>
            <div className="form-field">
              <label>Estado:</label>
              <select name="estado" value={activo.estado || 'Activo'} onChange={handleActivoChange}>
                <option value="Activo">Activo</option>
                <option value="En reparación">En reparación</option>
                <option value="De baja">De baja</option>
              </select>
            </div>
            <div className="form-field"><label>Notas:</label><textarea name="notas" value={activo.notas || ''} onChange={handleActivoChange}></textarea></div>
            
            {renderCamposEspecificos()}
          </div>
        </div>
        
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <button type="submit">Guardar Activo</button>
      </form>
    </div>
  );
}

export default ActivoForm;
