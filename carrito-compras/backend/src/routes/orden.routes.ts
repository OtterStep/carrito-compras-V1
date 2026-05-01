import { Router } from 'express';
import { ordenController } from '../controllers/orden.controller';
import { verifyAccessToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/', verifyAccessToken, ordenController.crear);
router.post('/admin', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'GERENTE']), ordenController.crearAdmin);
router.post('/:id/cancelar', verifyAccessToken, ordenController.cancelar);
router.get('/', verifyAccessToken, ordenController.obtenerMisOrdenes);
router.get('/all', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'VENDEDOR', 'GERENTE']), ordenController.obtenerTodas);
router.get('/:id', verifyAccessToken, ordenController.obtenerDetalle);
router.get('/:id/factura', verifyAccessToken, ordenController.descargarFactura);
router.patch('/:id/estado', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'VENDEDOR', 'GERENTE']), ordenController.actualizarEstado);
router.post('/:id/devolucion', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'GERENTE']), ordenController.procesarDevolucion);

export default router;
