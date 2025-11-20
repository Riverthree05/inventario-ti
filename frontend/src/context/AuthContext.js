import React, { createContext, useState, useContext } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/usuarios/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      return true;
    } catch (error) {
      console.error("Error en el login:", error);
      localStorage.removeItem('token');
      setToken(null);
      return false;
    }
  };

  const register = async (nombre, email, password, rol_id) => {
    try {
      const response = await apiClient.post('/usuarios/registro', { nombre, email, password, rol_id });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Error en el registro:", error);
      const message = error.response?.data?.error || 'Error al registrar el usuario.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  // Return a safe default when the context is not provided (useful for tests)
  return useContext(AuthContext) || { token: null, login: async () => false, register: async () => ({ success: false }), logout: () => {} };
};