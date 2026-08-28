import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://agoraapp-d6agawh0bpchc5aj.eastus-01.azurewebsites.net/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // redireciona para login só em rotas protegidas, não no /auth/me de restauração de sessão
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/me')) {
      console.warn("Sessão expirada. Redirecionando para o login...");
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;