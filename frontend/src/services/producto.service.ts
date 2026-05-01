import api from './api';

export const productoService = {
  getAll: async (params: any = {}) => {
    const response = await api.get('/productos', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/productos', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/productos/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/productos/${id}`);
  },
};
