import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import MantenimientoHistorial from '../components/mantenimiento/MantenimientoHistorial';

function ActivoDetalle() {
  const [activo, setActivo] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar datos del activo
    apiClient.get(`/activos/${id}`)
      .then(response => setActivo(response.data))
      .catch(err => setError('No se pudo cargar la información del activo.'));

    // Cargar historial de mantenimientos
    apiClient.get(`/mantenimientos/activo/${id}`)
      .then(response => setMantenimientos(response.data))
      .catch(err => console.error('Error al obtener mantenimientos:', err));
      
    // Cargar la imagen del código QR
    apiClient.get(`/qr/activo/${id}`)
      .then(response => setQrCodeUrl(response.data.qrDataUrl))
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

  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  if (!activo) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const especificaciones = activo.especificaciones && typeof activo.especificaciones === 'string'
    ? JSON.parse(activo.especificaciones)
    : activo.especificaciones || {};

  return (
    <div style={{ padding: '20px' }}>
      <h1>Detalles del Activo: {activo.nombre}</h1>
      
      <h3>Datos Generales</h3>
      <ul>
        <li><strong>ID:</strong> {activo.id}</li>
        <li><strong>Categoría:</strong> {activo.categoria_nombre}</li>
        <li><strong>Marca:</strong> {activo.marca}</li>
        <li><strong>Modelo:</strong> {activo.modelo}</li>
        <li><strong>Número de Serie:</strong> {activo.numero_serie}</li>
        <li><strong>Estado:</strong> {activo.estado}</li>
        <li><strong>Ubicación:</strong> {activo.ubicacion}</li>
      </ul>

      <h3>Especificaciones</h3>
      <ul>
        {Object.entries(especificaciones).map(([key, value]) => (
          <li key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {String(value)}</li>
        ))}
      </ul>

      <MantenimientoHistorial mantenimientos={mantenimientos} />

      <div style={{ marginTop: '30px' }}>
        <h3>Código QR</h3>
        {qrCodeUrl ? (
          <img 
            src={qrCodeUrl}
            alt={`Código QR para ${activo.nombre}`} 
            style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}
          />
        ) : (
          <p>Generando QR...</p>
        )}
        <p>Escanea este código para acceder rápidamente a esta página.</p>
        <button onClick={handleImprimir} style={{ marginTop: '10px' }}>Imprimir Etiqueta QR</button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link to="/dashboard" style={{ marginRight: '10px' }}>Volver</Link>
        <Link to={`/activos/editar/${activo.id}`} style={{ marginRight: '10px' }}><button>Editar</button></Link>
        <button onClick={handleEliminar} style={{ backgroundColor: '#dc3545', color: 'white' }}>Eliminar</button>
        <Link to={`/mantenimientos/nuevo/${activo.id}`}><button style={{ marginLeft: '10px', backgroundColor: '#28a745' }}>Registrar Mantenimiento</button></Link>
      </div>
    </div>
  );
}

export default ActivoDetalle;