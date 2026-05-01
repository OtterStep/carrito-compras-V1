import api from './api';

export const usuarioService = {
  getAll: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};
