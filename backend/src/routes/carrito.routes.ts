import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => res.json({ message: 'Carrito API' }));
export default router;
