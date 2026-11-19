import axios from 'axios';

export const AUTH_TOKEN_KEY = 'agora_auth_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://agoraapp-d6agawh0bpchc5aj.eastus-01.azurewebsites.net/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCheckOrLogin =
      url.includes('/users/me') ||
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/confirm-email') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password');

    if (error.response?.status === 401 && !isAuthCheckOrLogin) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      console.warn('Sessão expirada. Redirecionando para o login...');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;