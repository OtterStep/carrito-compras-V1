import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', (req, res) => res.json({ success: true }));
router.post('/refresh', (req, res) => res.status(501).json({ message: 'No implementado' }));

export default router;
