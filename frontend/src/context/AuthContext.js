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

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  // Return a safe default when the context is not provided (useful for tests)
  return useContext(AuthContext) || { token: null, login: async () => false, logout: () => {} };
};