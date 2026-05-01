import { Request, Response } from 'express';
import { cuponService } from '../services/cupon.service';

export const cuponController = {
  async crear(req: Request, res: Response) {
    try {
      const cupon = await cuponService.crear(req.body);
      res.status(201).json({ success: true, data: cupon });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async obtenerTodos(req: Request, res: Response) {
    try {
      const cupones = await cuponService.obtenerTodos();
      res.json({ success: true, data: cupones });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async obtenerActivos(req: Request, res: Response) {
    try {
      const cupones = await cuponService.obtenerActivos();
      res.json({ success: true, data: cupones });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async validar(req: Request, res: Response) {
    try {
      const { codigo } = req.params;
      const cupon = await cuponService.validar(codigo);
      res.json({ success: true, data: cupon });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cupon = await cuponService.actualizar(id, req.body);
      res.json({ success: true, data: cupon });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await cuponService.eliminar(id);
      res.json({ success: true, message: 'Cupón eliminado' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
};
