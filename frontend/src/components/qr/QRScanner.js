import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QRScanner() {
  const navigate = useNavigate();
  const scannerRef = useRef(null); // Ref para guardar la instancia del escáner

  useEffect(() => {
    // Asegura que el escáner solo se inicialice una vez
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader", // ID del div donde se renderizará
        { qrbox: { width: 250, height: 250 }, fps: 10 },
        false // Modo verbose desactivado
      );

      const onScanSuccess = (decodedText, decodedResult) => {
        // Asegurarse de parar el escáner ANTES de navegar
        if (scannerRef.current) {
            scannerRef.current.clear().catch(error => {
                console.error("Fallo al limpiar el escáner tras éxito:", error);
            });
            scannerRef.current = null; // Marcar como limpiado
        }
        
        try {
          const url = new URL(decodedText);
          const path = url.pathname;
          const search = url.search || '';
          // Si la URL apunta a la misma origin, navegamos internamente incluyendo los query params
          if (url.origin === window.location.origin) {
            if (path.startsWith('/activos/')) {
              navigate(path + search);
            } else {
              alert('Código QR no válido para esta aplicación.');
            }
          } else {
            // Si es otra origin, redirigimos el navegador completo (por ejemplo, token en query)
            window.location.href = decodedText;
          }
        } catch (e) {
          alert('El código QR no contiene una URL válida.');
        }
      };

      const onScanFailure = (error) => {
        // Ignorar errores de "no se encontró QR"
      };

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner; // Guardar la instancia
    }

    // --- ESTA ES LA FUNCIÓN DE LIMPIEZA ---
    // Se ejecuta automáticamente cuando sales de la página del escáner
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Fallo al limpiar el escáner al desmontar:", error);
        });
        scannerRef.current = null;
      }
    };
    // ------------------------------------
  }, [navigate]); // El array de dependencias es importante

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
      <h2>Escanear Código QR de Activo</h2>
      <p>Apunta la cámara al código QR del equipo.</p>
      <div id="qr-reader"></div>
    </div>
  );
}

export default QRScanner;