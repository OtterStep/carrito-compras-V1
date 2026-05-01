import api from './api';

export const estadisticaService = {
  getResumen: async () => {
    const response = await api.get('/estadisticas/resumen');
    return response.data;
  },
  getTendencia: async () => {
    const response = await api.get('/estadisticas/tendencia');
    return response.data;
  },
  getAnalisisABC: async () => {
    const response = await api.get('/estadisticas/abc');
    return response.data;
  },
  getRFM: async () => {
    const response = await api.get('/estadisticas/rfm');
    return response.data;
  },
  getHeatmap: async () => {
    const response = await api.get('/estadisticas/heatmap');
    return response.data;
  },
  getAbandono: async () => {
    const response = await api.get('/estadisticas/abandono');
    return response.data;
  },
  getCohorte: async () => {
    const response = await api.get('/estadisticas/cohorte');
    return response.data;
  },
  getCorrelacionDescuento: async () => {
    const response = await api.get('/estadisticas/correlacion-descuento');
    return response.data;
  },
  getTicketSegmento: async () => {
    const response = await api.get('/estadisticas/ticket-segmento');
    return response.data;
  }
};
