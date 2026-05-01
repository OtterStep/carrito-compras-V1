import api from './api';

export const cuponService = {
  getAll: async () => {
    const response = await api.get('/cupones');
    return response.data;
  },
  getActivos: async () => {
    const response = await api.get('/cupones/activos');
    return response.data;
  },
  validar: async (codigo: string) => {
    const response = await api.get(`/cupones/validar/${codigo}`);
    return response.data;
  },
  crear: async (data: any) => {
    const response = await api.post('/cupones', data);
    return response.data;
  },
  actualizar: async (id: string, data: any) => {
    const response = await api.patch(`/cupones/${id}`, data);
    return response.data;
  },
  eliminar: async (id: string) => {
    const response = await api.delete(`/cupones/${id}`);
    return response.data;
  }
};
