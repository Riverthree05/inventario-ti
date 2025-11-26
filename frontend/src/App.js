import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Importación de Componentes y Páginas
import Login from './components/auth/Login';
import Registro from './components/auth/Registro';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Reportes from './pages/Reportes';
import ActivoForm from './components/activos/ActivoForm';
import ActivoDetalle from './pages/ActivoDetalle';
import MantenimientoForm from './components/mantenimiento/MantenimientoForm';
import EscanerQR from './pages/EscanerQR';
import QREtiqueta from './pages/QREtiqueta';
import "./App.css";

function App() {
  const { token } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      window.history.replaceState({}, document.title, location.pathname);
      window.location.reload();
    }
  }, [location]);

  return (
    <Routes>
      {/* Rutas públicas para Login y Registro */}
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
      <Route path="/registro" element={!token ? <Registro /> : <Navigate to="/" />} />
      
      {/* Rutas Protegidas que usarán el Layout con Sidebar */}
      <Route element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/escaner-qr" element={<EscanerQR />} />
          <Route path="/activos/nuevo" element={<ActivoForm />} />
          <Route path="/activos/editar/:id" element={<ActivoForm />} />
          <Route path="/activos/:id" element={<ActivoDetalle />} />
          <Route path="/mantenimientos/nuevo/:activoId" element={<MantenimientoForm />} />
      </Route>
      
      {/* Ruta de impresión sin el Layout/Sidebar */}
      <Route path="/activos/etiqueta/:id" element={token ? <QREtiqueta /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;