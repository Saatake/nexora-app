import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://agoraapp-d6agawh0bpchc5aj.eastus-01.azurewebsites.net/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sessão expirada. Redirecionando para o login...");
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      window.location.href = '/'; 
    }
    
      return Promise.reject(error);
  }
);

export default api;