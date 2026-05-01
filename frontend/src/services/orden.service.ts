import api from './api';

export const ordenService = {
  crear: async (data: { 
    cartId: string; 
    metodoPago: string; 
    items?: any[]; 
    couponCode?: string;
    direccion: string;
    ciudad: string;
  }) => {
    const response = await api.post('/ordenes', data);
    return response.data;
  },
  cancelar: async (id: string) => {
    const response = await api.post(`/ordenes/${id}/cancelar`);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/ordenes/all');
    return response.data;
  },
  getMisOrdenes: async () => {
    const response = await api.get('/ordenes');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/ordenes/${id}`);
    return response.data;
  },
  crearAdmin: async (data: { email: string; nombre: string; items: any[]; metodoPago: string }) => {
    const response = await api.post('/ordenes/admin', data);
    return response.data;
  },
  descargarFactura: async (id: string) => {
    const response = await api.get(`/ordenes/${id}/factura`, { responseType: 'blob' });
    return response.data;
  },
  actualizarEstado: async (id: string, estado: string) => {
    const response = await api.patch(`/ordenes/${id}/estado`, { estado });
    return response.data;
  },
  procesarDevolucion: async (id: string, motivo: string) => {
    const response = await api.post(`/ordenes/${id}/devolucion`, { motivo });
    return response.data;
  }
};
