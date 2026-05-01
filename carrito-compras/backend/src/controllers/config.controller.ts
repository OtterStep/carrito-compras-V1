import { Request, Response } from 'express';
import { configService } from '../services/config.service';

export const configController = {
  async obtenerTodas(req: Request, res: Response) {
    try {
      const configs = await configService.obtenerTodas();
      res.json({ success: true, data: configs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async actualizar(req: Request, res: Response) {
    try {
      const { clave, valor } = req.body;
      const config = await configService.actualizar(clave, valor);
      res.json({ success: true, data: config });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
