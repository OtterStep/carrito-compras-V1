import { Router } from 'express';
import { estadisticasController } from '../controllers/estadistica.controller';
import { verifyAccessToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Resumen para el dashboard (más roles permitidos)
router.get('/resumen', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO', 'VENDEDOR', 'GERENTE']), estadisticasController.resumen);

// Estadísticas detalladas
router.use(verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO', 'GERENTE']));

router.get('/tendencia', estadisticasController.tendenciaVentas);
router.get('/abc', estadisticasController.analisisABC);
router.get('/rfm', estadisticasController.rfmSegmentacion);
router.get('/heatmap', estadisticasController.mapaCalor);
router.get('/abandono', estadisticasController.tasaAbandono);
router.get('/cohorte', estadisticasController.cohorte);
router.get('/correlacion-descuento', estadisticasController.correlacionDescuento);
router.get('/ticket-segmento', estadisticasController.ticketPromedioSegmento);

export default router;
