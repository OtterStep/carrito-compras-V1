import { Router } from 'express';
import prisma from '../lib/prisma';
import { verifyAccessToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(verifyAccessToken, requireRole(['ADMIN', 'GERENTE_INVENTARIO', 'GERENTE']));

// Obtener productos con bajo stock
router.get('/bajo-stock', async (req, res) => {
  try {
    const productos = await prisma.product.findMany({
      where: {
        stock: { lte: 10 } // Umbral de bajo stock
      },
      orderBy: { stock: 'asc' }
    });
    res.json({ success: true, data: productos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Actualizar stock masivo o ajuste
router.patch('/ajuste/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, motivo } = req.body; // motivo para auditoría futura
    
    const producto = await prisma.product.update({
      where: { id },
      data: { stock: cantidad }
    });
    
    res.json({ success: true, data: producto });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
