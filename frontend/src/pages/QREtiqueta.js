import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';

function QREtiqueta() {
  const [activo, setActivo] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Petición 1: Obtener datos del activo
        const resActivo = await apiClient.get(`/activos/${id}`);
        setActivo(resActivo.data);

        // Petición 2: Obtener la imagen del QR
        const resQR = await apiClient.get(`/qr/activo/${id}`);
        setQrCodeUrl(resQR.data.qrDataUrl);

        // Imprimir solo después de que todo haya cargado
        setTimeout(() => window.print(), 500);
      } catch (err) {
        console.error("Error al cargar datos para la etiqueta", err);
      }
    };
    fetchData();
  }, [id]);

  if (!activo) return <div>Cargando etiqueta...</div>;

  const estiloEtiqueta = {
    width: '300px',
    padding: '20px',
    textAlign: 'center',
    border: '2px dashed black',
    fontFamily: 'Arial, sans-serif'
  };

  return (
    <div style={estiloEtiqueta}>
      <h3>{activo.nombre}</h3>
      <p>ID: {activo.id} | {activo.marca} {activo.modelo}</p>
      {qrCodeUrl ? (
        <img src={qrCodeUrl} alt={`Código QR para ${activo.nombre}`} style={{ width: '250px', height: '250px' }} />
      ) : (
        <p>Generando QR...</p>
      )}
      <p style={{ fontSize: '12px' }}>S/N: {activo.numero_serie}</p>
    </div>
  );
}

export default QREtiqueta;