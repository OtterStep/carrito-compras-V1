import { Router } from 'express';
import { pagoService } from '../services/pago.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/procesar', authMiddleware, async (req, res, next) => {
  try {
    const result = await pagoService.procesarPago(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
