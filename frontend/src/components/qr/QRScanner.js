import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QRScanner() {
  const navigate = useNavigate();
  const scannerRef = useRef(null); // Ref para manejar la instancia del escáner

  useEffect(() => {
    // Asegura que el escáner solo se inicialice una vez
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader", // ID del div donde se renderizará el escáner
        {
          qrbox: { width: 250, height: 250 },
          fps: 10, // Frames por segundo para el video
        },
        false // Modo "verbose" desactivado para no llenar la consola
      );

      const onScanSuccess = (decodedText, decodedResult) => {
        scanner.clear(); // Detener el escáner una vez que se encuentra un resultado
        try {
          // Extraemos la ruta de la URL escaneada
          const url = new URL(decodedText);
          const path = url.pathname;
          
          if (path.startsWith('/activos/')) {
            // Si la ruta es válida, navegamos a ella
            navigate(path);
          } else {
            alert('Código QR no válido para esta aplicación.');
          }
        } catch (e) {
          alert('El código QR no contiene una URL válida.');
        }
      };

      const onScanFailure = (error) => {
        // No hacer nada en caso de fallo (pasa todo el tiempo si no hay un QR en la vista)
      };

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    // Función de limpieza para detener la cámara cuando sales de la página
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [navigate]);

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
      <h2>Escanear Código QR de Activo</h2>
      <p>Apunta la cámara al código QR del equipo.</p>
      {/* Este div es el contenedor donde la librería dibujará el escáner */}
      <div id="qr-reader"></div>
    </div>
  );
}

export default QRScanner;