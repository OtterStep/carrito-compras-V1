import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const getBaseURL = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  
  // Si parece un ID de Render pero le falta el dominio, se lo agregamos
  if (envUrl.startsWith('srv-') && !envUrl.includes('.')) {
    envUrl = `${envUrl}.onrender.com`;
  }

  // Asegurar que tenga el protocolo https:// si es una URL externa
  if ((envUrl.includes('onrender.com') || envUrl.includes('vercel.app')) && !envUrl.startsWith('http')) {
    envUrl = `https://${envUrl}`;
  }
  
  // Si la URL no termina en /api, se lo agregamos automáticamente
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  const token = state.accessToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Intentar recuperar del localStorage si el estado está vacío momentáneamente
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      try {
        const parsed = JSON.parse(storage);
        const savedToken = parsed.state?.accessToken;
        if (savedToken) {
          config.headers.Authorization = `Bearer ${savedToken}`;
        }
      } catch (e) {
        console.error('Error al parsear auth-storage:', e);
      }
    }
  }
  return config;
});

export default api;
