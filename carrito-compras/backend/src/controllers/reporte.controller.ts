import { Request, Response } from 'express';
import { reporteService } from '../services/reporte.service';

export const reporteController = {
  async reporteOperacional(req: Request, res: Response) {
    const { tipo, fechaInicio, fechaFin, id } = req.query;
    const inicio = fechaInicio ? new Date(fechaInicio as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const fin = fechaFin ? new Date(fechaFin as string) : new Date();

    switch (tipo) {
      case 'ordenes':
        return await reporteService.generarReporteOperacionalOrdenes(res, inicio, fin);
      case 'inventario':
        return await reporteService.generarReporteInventarioValorizado(res);
      case 'stock-bajo':
        return await reporteService.generarReporteStockBajo(res);
      case 'movimientos':
        return await reporteService.generarReporteMovimientosInventario(res, inicio, fin);
      case 'pagos':
        return await reporteService.generarReportePagosRecibidos(res, inicio, fin);
      case 'devoluciones':
        return await reporteService.generarReporteDevoluciones(res, inicio, fin);
      case 'factura':
        return await reporteService.generarFacturaIndividual(res, id as string);
      case 'comprobante':
        return await reporteService.generarComprobanteCompra(res, id as string);
      default:
        return await reporteService.generarReporteOperacionalOrdenes(res, inicio, fin);
    }
  },

  async reporteGestion(req: Request, res: Response) {
    try {
      const { tipo } = req.query;
      
      switch (tipo) {
        case 'rentabilidad':
          return await reporteService.generarReporteGestionRentabilidad(res);
        case 'ventas-categoria':
          return await reporteService.generarReporteGestionVentasCategoria(res);
        case 'carritos':
          return await reporteService.generarReporteGestionCarritos(res);
        case 'clientes':
          return await reporteService.generarReporteGestionClientes(res);
        case 'rotacion':
          return await reporteService.generarReporteGestionRotacion(res);
        case 'ingresos-costos':
          return await reporteService.generarReporteGestionIngresosCostos(res);
        default:
          return await reporteService.generarReporteGestionVentasCategoria(res);
      }
    } catch (error) {
      console.error('Error en reporteController.reporteGestion:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error interno al procesar el reporte de gestión' });
      }
    }
  }
};
