import { Router } from 'express';
import { ProductoController } from '../controllers/producto.controller';
import { verifyAccessToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/', ProductoController.getAll);
router.get('/:id', ProductoController.getById);

// Rutas protegidas para ADMIN, GERENTE_INVENTARIO y GERENTE
router.post('/', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_INVENTARIO', 'GERENTE']), ProductoController.create);
router.put('/:id', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_INVENTARIO', 'GERENTE']), ProductoController.update);
router.delete('/:id', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_INVENTARIO', 'GERENTE']), ProductoController.delete);

export default router;
