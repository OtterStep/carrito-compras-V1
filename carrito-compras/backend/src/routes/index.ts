import { Router } from 'express';
import authRoutes from './auth.routes';
import productoRoutes from './producto.routes';
import carritoRoutes from './carrito.routes';
import ordenRoutes from './orden.routes';
import inventarioRoutes from './inventario.routes';
import estadisticaRoutes from './estadistica.routes';
import reporteRoutes from './reporte.routes';
import usuarioRoutes from './usuario.routes';
import clienteRoutes from './cliente.routes';
import cuponRoutes from './cupon.routes';
import configRoutes from './config.routes';
import pagoRoutes from './pago.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/productos', productoRoutes);
router.use('/carrito', carritoRoutes);
router.use('/ordenes', ordenRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/estadisticas', estadisticaRoutes);
router.use('/reportes', reporteRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/cliente', clienteRoutes);
router.use('/cupones', cuponRoutes);
router.use('/config', configRoutes);
router.use('/pagos', pagoRoutes);

export default router;
