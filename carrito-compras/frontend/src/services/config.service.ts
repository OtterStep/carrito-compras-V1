import api from './api';

export const configService = {
  getAll: async () => {
    const response = await api.get('/config');
    return response.data;
  },
  actualizar: async (clave: string, valor: string) => {
    const response = await api.post('/config', { clave, valor });
    return response.data;
  }
};
