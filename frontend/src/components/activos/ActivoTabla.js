import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip, Box } from '@mui/material';

function ActivoTabla({ equipos }) {
  const navigate = useNavigate();

  const handleRowClick = (id) => {
    navigate(`/activos/${id}`);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activo': return 'success';
      case 'En Mantenimiento': return 'warning';
      case 'En reparación': return 'error';
      case 'De baja': return 'default';
      default: return 'primary';
    }
  };

  if (!equipos || equipos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
          No hay activos para mostrar
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Agrega nuevos dispositivos para comenzar a gestionar tu inventario
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        backgroundColor: '#1e1e1e',
        borderRadius: 3,
        boxShadow: 3,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Table sx={{ minWidth: { xs: 300, md: 650 } }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#2c2c2c' }}>
            <TableCell sx={{ 
              color: '#00bfff', 
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
              py: { xs: 1.5, md: 2 }
            }}>
              ID
            </TableCell>
            <TableCell sx={{ 
              color: '#00bfff', 
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
              py: { xs: 1.5, md: 2 }
            }}>
              Nombre
            </TableCell>
            <TableCell sx={{ 
              color: '#00bfff', 
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
              py: { xs: 1.5, md: 2 },
              display: { xs: 'none', sm: 'table-cell' }
            }}>
              Categoría
            </TableCell>
            <TableCell sx={{ 
              color: '#00bfff', 
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
              py: { xs: 1.5, md: 2 },
              display: { xs: 'none', md: 'table-cell' }
            }}>
              Marca
            </TableCell>
            <TableCell sx={{ 
              color: '#00bfff', 
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
              py: { xs: 1.5, md: 2 }
            }}>
              Estado
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equipos.map((activo) => (
            <TableRow 
              key={activo.id} 
              onClick={() => handleRowClick(activo.id)} 
              hover 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#2c2c2c',
                  transform: 'scale(1.01)',
                  boxShadow: '0 2px 8px rgba(0, 191, 255, 0.2)'
                }
              }}
            >
              <TableCell sx={{ 
                color: '#00bfff',
                fontWeight: 'bold',
                fontSize: { xs: '0.875rem', md: '1rem' },
                py: { xs: 1.5, md: 2 }
              }}>
                #{activo.id}
              </TableCell>
              <TableCell sx={{ 
                color: 'white',
                fontWeight: 500,
                fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
                py: { xs: 1.5, md: 2 }
              }}>
                {activo.nombre}
              </TableCell>
              <TableCell sx={{ 
                color: '#b3b3b3',
                fontSize: { xs: '0.875rem', md: '1rem' },
                py: { xs: 1.5, md: 2 },
                display: { xs: 'none', sm: 'table-cell' }
              }}>
                {activo.categoria_nombre}
              </TableCell>
              <TableCell sx={{ 
                color: '#b3b3b3',
                fontSize: { xs: '0.875rem', md: '1rem' },
                py: { xs: 1.5, md: 2 },
                display: { xs: 'none', md: 'table-cell' }
              }}>
                {activo.marca}
              </TableCell>
              <TableCell sx={{ 
                py: { xs: 1.5, md: 2 }
              }}>
                <Chip
                  label={activo.estado}
                  color={getEstadoColor(activo.estado)}
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ActivoTabla;