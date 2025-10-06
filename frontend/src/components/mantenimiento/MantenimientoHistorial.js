import React from 'react';

function MantenimientoHistorial({ mantenimientos }) {
  if (!mantenimientos || mantenimientos.length === 0) {
    return <h4>No hay registros de mantenimiento para este activo.</h4>;
  }

  return (
    <div className="tabla-equipos" style={{ marginTop: '30px' }}>
      <h3>Historial de Mantenimiento</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Técnico</th>
            <th>Fecha Programada</th>
          </tr>
        </thead>
        <tbody>
          {mantenimientos.map(m => (
            <tr key={m.id}>
              <td data-label="ID">{m.id}</td>
              <td data-label="Título">{m.titulo}</td>
              <td data-label="Tipo">{m.tipo}</td>
              <td data-label="Estado">{m.estado}</td>
              <td data-label="Técnico">{m.nombre_tecnico}</td>
              <td data-label="Fecha Programada">{m.fecha_programada ? new Date(m.fecha_programada).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MantenimientoHistorial;