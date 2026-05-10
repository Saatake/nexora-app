import axios from 'axios';

const api = axios.create({
  baseURL: 'https://agoraapp-d6agawh0bpchc5aj.eastus-01.azurewebsites.net/api', // URL da Nuvem
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
