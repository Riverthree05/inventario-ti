import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>CMMS</h3>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/escaner-qr">Escanear QR</NavLink>
            </nav>
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </div>
        </div>
    );
}

export default Sidebar;