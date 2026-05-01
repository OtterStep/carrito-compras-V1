import api from './api';

export interface PagoData {
  ordenId: string;
  tarjeta: string;
  cvv: string;
  expiracion: string;
  nombre: string;
}

export const pagoService = {
  async procesar(data: PagoData) {
    const response = await api.post('/pagos/procesar', data);
    return response.data;
  }
};
