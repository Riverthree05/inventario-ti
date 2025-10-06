import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      .then(() => navigate(`/activos/${activoId}`))
      .catch(err => setError('Error al registrar el mantenimiento.'));
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Registrar Mantenimiento para Activo #{activoId}</h2>

        <div className="form-field">
          <label>Título:</label>
          <input type="text" name="titulo" value={mantenimiento.titulo} onChange={handleChange} required />
        </div>

        <div className="form-field">
          <label>Tipo de Mantenimiento:</label>
          <select name="tipo" value={mantenimiento.tipo} onChange={handleChange}>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
            <option value="emergencia">Emergencia</option>
          </select>
        </div>

        <div className="form-field">
          <label>Descripción:</label>
          <textarea name="descripcion" value={mantenimiento.descripcion} onChange={handleChange}></textarea>
        </div>

        <div className="form-field">
          <label>Fecha Programada:</label>
          <input type="date" name="fecha_programada" value={mantenimiento.fecha_programada} onChange={handleChange} />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Guardar Mantenimiento</button>
      </form>
    </div>
  );
}

export default MantenimientoForm;