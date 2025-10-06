import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function ActivoTabla({ equipos }) {
  const navigate = useNavigate();

  const handleRowClick = (id) => {
    navigate(`/activos/${id}`);
  };

  if (!equipos || equipos.length === 0) {
    return <p style={{ color: 'white' }}>No hay activos para mostrar.</p>;
  }

  return (
    <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Categoría</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Marca</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equipos.map((activo) => (
            <TableRow 
              key={activo.id} 
              onClick={() => handleRowClick(activo.id)} 
              hover 
              sx={{ cursor: 'pointer' }}
            >
              <TableCell sx={{ color: '#ccc' }}>{activo.id}</TableCell>
              <TableCell sx={{ color: 'white' }}>{activo.nombre}</TableCell>
              <TableCell sx={{ color: '#ccc' }}>{activo.categoria_nombre}</TableCell>
              <TableCell sx={{ color: '#ccc' }}>{activo.marca}</TableCell>
              <TableCell sx={{ color: '#ccc' }}>{activo.estado}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ActivoTabla;