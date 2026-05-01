import { Router } from 'express';
import { reporteController } from '../controllers/reporte.controller';
import { verifyAccessToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Reportes operacionales
router.get('/operacional', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO', 'VENDEDOR', 'GERENTE']), reporteController.reporteOperacional);

// Reportes de gestión (más sensibles)
router.get('/gestion', verifyAccessToken, requireRole(['ADMIN', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO', 'GERENTE']), reporteController.reporteGestion);

export default router;
