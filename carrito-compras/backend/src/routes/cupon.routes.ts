import { Router } from 'express';
import { cuponController } from '../controllers/cupon.controller';
import { verifyAccessToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Públicos (o para clientes al validar en checkout)
router.get('/validar/:codigo', verifyAccessToken, cuponController.validar);
router.get('/activos', cuponController.obtenerActivos);

// Gestión (Admin y Gerente de Ventas)
router.get('/', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'GERENTE']), cuponController.obtenerTodos);
router.post('/', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'GERENTE']), cuponController.crear);
router.patch('/:id', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'GERENTE']), cuponController.actualizar);
router.delete('/:id', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'GERENTE']), cuponController.eliminar);

export default router;
