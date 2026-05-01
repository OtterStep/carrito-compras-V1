import { Router } from 'express';
import { clienteController } from '../controllers/cliente.controller';
import { verifyAccessToken } from '../middlewares/auth.middleware';

const router = Router();

// Perfil
router.get('/perfil', verifyAccessToken, clienteController.obtenerPerfil);
router.put('/perfil', verifyAccessToken, clienteController.actualizarPerfil);

// Direcciones
router.post('/direcciones', verifyAccessToken, clienteController.agregarDireccion);
router.delete('/direcciones/:id', verifyAccessToken, clienteController.eliminarDireccion);

// Tarjetas
router.get('/tarjetas', verifyAccessToken, clienteController.obtenerTarjetas);
router.post('/tarjetas', verifyAccessToken, clienteController.agregarTarjeta);
router.delete('/tarjetas/:id', verifyAccessToken, clienteController.eliminarTarjeta);

// Wishlist
router.get('/wishlist', verifyAccessToken, clienteController.obtenerWishlist);
router.post('/wishlist', verifyAccessToken, clienteController.agregarAWishlist);
router.delete('/wishlist/:id', verifyAccessToken, clienteController.eliminarDeWishlist);

// Reseñas
router.post('/resenas', verifyAccessToken, clienteController.agregarReseña);
router.get('/productos/:productId/resenas', clienteController.obtenerReseñasProducto);

export default router;
