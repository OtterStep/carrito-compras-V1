import api from './api';

export const configService = {
  getAll: async () => {
    const response = await api.get('/config');
    return response.data;
  },
  actualizar: async (clave: string, valor: string) => {
    const response = await api.post('/config', { clave, valor });
    return response.data;
  },
  getSiteConfig: async () => {
    const response = await api.get('/config/site');
    return response.data;
  },
  updateSiteConfig: async (data: any) => {
    const response = await api.post('/config/site', data);
    return response.data;
  }
};
