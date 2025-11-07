import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import { Box, Paper, Typography } from '@mui/material';

function QREtiqueta() {
  const [activo, setActivo] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resActivo = await apiClient.get(`/activos/${id}`);
        setActivo(resActivo.data);

        const resQR = await apiClient.get(`/qr/activo/${id}`);
        setQrCodeUrl(resQR.data.qrDataUrl);

        // Imprimir solo después de que todo haya cargado
        setTimeout(() => window.print(), 500);
      } catch (err) {
        console.error('Error al cargar datos para la etiqueta', err);
      }
    };
    fetchData();
  }, [id]);

  if (!activo) return <Typography sx={{ p: 3 }}>Cargando etiqueta...</Typography>;

  return (
    <Paper
      elevation={2}
      sx={{
        width: 300,
        p: 2.5,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        mx: 'auto',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <Typography variant="h6" gutterBottom>{activo.nombre}</Typography>
      <Typography variant="body2">ID: {activo.id} | {activo.marca} {activo.modelo}</Typography>

      {qrCodeUrl ? (
        <Box component="img" src={qrCodeUrl} alt={`Código QR para ${activo.nombre}`} sx={{ width: 250, height: 250, mt: 1 }} />
      ) : (
        <Typography sx={{ mt: 2 }}>Generando QR...</Typography>
      )}

      <Typography variant="caption" display="block" sx={{ mt: 1 }}>S/N: {activo.numero_serie}</Typography>
    </Paper>
  );
}

export default QREtiqueta;