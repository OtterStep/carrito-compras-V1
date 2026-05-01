import { Router } from 'express';
import { configController } from '../controllers/config.controller';
import { verifyAccessToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Solo Admin puede gestionar configuración
router.get('/', verifyAccessToken, requireRole(['ADMIN']), configController.obtenerTodas);
router.post('/', verifyAccessToken, requireRole(['ADMIN']), configController.actualizar);

export default router;
