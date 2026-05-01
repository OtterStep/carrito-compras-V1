import { Request, Response } from 'express';
import { estadisticasService } from '../services/estadisticas.service';

export const estadisticasController = {
  async resumen(req: Request, res: Response) {
    try {
      const data = await estadisticasService.resumen();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async tendenciaVentas(req: Request, res: Response) {
    try {
      const data = await estadisticasService.tendenciaMensual();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async analisisABC(req: Request, res: Response) {
    try {
      const abc = await estadisticasService.analisisABC();
      res.json({ success: true, data: abc });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async rfmSegmentacion(req: Request, res: Response) {
    try {
      const rfm = await estadisticasService.calcularRFM();
      res.json({ success: true, data: rfm });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async mapaCalor(req: Request, res: Response) {
    try {
      const data = await estadisticasService.mapaCalorVentas();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async tasaAbandono(req: Request, res: Response) {
    try {
      const data = await estadisticasService.tasaAbandono();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async cohorte(req: Request, res: Response) {
    try {
      const data = await estadisticasService.cohorteClientes();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async correlacionDescuento(req: Request, res: Response) {
    try {
      const data = await estadisticasService.correlacionDescuentoVenta();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async ticketPromedioSegmento(req: Request, res: Response) {
    try {
      const data = await estadisticasService.distribucionTicketPromedio();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
