import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { verifyAccessToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Todos los endpoints de usuarios requieren autenticación
router.use(verifyAccessToken);

// Solo ADMIN, GERENTE_VENTAS, VENDEDOR y GERENTE (por compatibilidad) pueden ver la lista de usuarios (clientes)
router.get('/', requireRole(['ADMIN', 'GERENTE_VENTAS', 'VENDEDOR', 'GERENTE']), usuarioController.obtenerTodos);

// Solo ADMIN puede crear, actualizar o eliminar usuarios
router.post('/', requireRole(['ADMIN']), usuarioController.crear);
router.put('/:id', requireRole(['ADMIN']), usuarioController.actualizar);
router.delete('/:id', requireRole(['ADMIN']), usuarioController.eliminar);

export default router;
