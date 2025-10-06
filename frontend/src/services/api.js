import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://192.168.1.84:3001/api', 
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;