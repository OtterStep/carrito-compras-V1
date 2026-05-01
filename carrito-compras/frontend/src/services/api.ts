import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
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
