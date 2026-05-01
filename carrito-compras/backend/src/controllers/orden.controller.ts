import { Request, Response } from 'express';
import { ordenService } from '../services/orden.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const ordenController = {
  async crear(req: AuthRequest, res: Response) {
    try {
      const { cartId, metodoPago, items, couponCode, direccion, ciudad } = req.body;
      const userId = req.user!.id;
      const orden = await ordenService.crearOrden(userId, cartId, { metodoPago, direccion, ciudad, itemsManuales: items, couponCode });
      res.status(201).json({ success: true, data: orden });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async cancelar(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const orden = await ordenService.cancelarOrden(id, userId);
      res.json({ success: true, data: orden });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async crearAdmin(req: AuthRequest, res: Response) {
    try {
      const orden = await ordenService.crearOrdenAdmin(req.body);
      res.status(201).json({ success: true, data: orden });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async actualizarEstado(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const orden = await ordenService.cambiarEstado(id, estado);
      res.json({ success: true, data: orden });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async obtenerTodas(req: AuthRequest, res: Response) {
    try {
      const ordenes = await ordenService.obtenerTodas();
      res.json({ success: true, data: ordenes });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async obtenerMisOrdenes(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const ordenes = await ordenService.obtenerPorUsuario(userId);
      res.json({ success: true, data: ordenes });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async obtenerDetalle(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const orden = await ordenService.obtenerPorId(id);
      
      if (!orden) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      // Seguridad: Solo admin/gerente o el dueño de la orden
      const rolesConAcceso = ['ADMIN', 'GERENTE_VENTAS', 'VENDEDOR'];
      if (!rolesConAcceso.includes(req.user!.rol) && orden.userId !== req.user!.id) {
        return res.status(403).json({ success: false, message: 'No tiene permisos para ver esta orden' });
      }

      res.json({ success: true, data: orden });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async descargarFactura(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const orden = await ordenService.obtenerPorId(id);
      if (!orden) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      
      // Seguridad: Solo admin/gerente o el dueño de la orden
      const rolesConAcceso = ['ADMIN', 'GERENTE_VENTAS', 'VENDEDOR'];
      if (!rolesConAcceso.includes(req.user!.rol) && orden.userId !== req.user!.id) {
        return res.status(403).json({ success: false, message: 'No tiene permisos para descargar esta factura' });
      }

      // Aquí llamaremos al generador de PDF
      const { generarFacturaPDF } = await import('../utils/pdfGenerator');
      await generarFacturaPDF(orden, res);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async procesarDevolucion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const orden = await ordenService.procesarDevolucion(id, motivo);
      res.json({ success: true, data: orden });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
};
