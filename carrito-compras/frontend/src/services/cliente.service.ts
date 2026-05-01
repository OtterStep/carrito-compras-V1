import api from './api';

export const clienteService = {
  // Perfil
  getPerfil: async () => {
    const response = await api.get('/cliente/perfil');
    return response.data;
  },
  updatePerfil: async (data: any) => {
    const response = await api.put('/cliente/perfil', data);
    return response.data;
  },

  // Direcciones
  agregarDireccion: async (data: any) => {
    const response = await api.post('/cliente/direcciones', data);
    return response.data;
  },
  eliminarDireccion: async (id: string) => {
    const response = await api.delete(`/cliente/direcciones/${id}`);
    return response.data;
  },

  // Wishlist
  getWishlist: async () => {
    const response = await api.get('/cliente/wishlist');
    return response.data;
  },
  agregarAWishlist: async (productId: string) => {
    const response = await api.post('/cliente/wishlist', { productId });
    return response.data;
  },
  eliminarDeWishlist: async (id: string) => {
    const response = await api.delete(`/cliente/wishlist/${id}`);
    return response.data;
  },

  // Reseñas
  agregarResena: async (data: { productId: string; calificacion: number; comentario: string }) => {
    const response = await api.post('/cliente/resenas', data);
    return response.data;
  },
  getResenasProducto: async (productId: string) => {
    const response = await api.get(`/cliente/productos/${productId}/resenas`);
    return response.data;
  },
};
