import prisma from '../lib/prisma';
import { calcularImpuestos, generarCodigoOrden } from '../utils/ordenHelpers';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';
import { cuponService } from './cupon.service';
import { configService } from './config.service';

export const ordenService = {
  async crearOrdenAdmin(data: { email: string; nombre: string; items: any[]; metodoPago: string }) {
    const { email, nombre, items, metodoPago } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Buscar o crear usuario
      let user = await tx.user.findUnique({ where: { email } });
      
      if (!user) {
        const hashedPassword = await bcrypt.hash('Cliente123!', 10); // Password por defecto
        user = await tx.user.create({
          data: {
            email,
            nombre,
            password: hashedPassword,
            rol: 'CLIENTE'
          }
        });
      }

      // 2. Validar stock e items
      let total = 0;
      const itemsOrden: any[] = [];

      for (const item of items) {
        const producto = await tx.product.findUnique({ where: { id: item.productId } });
        if (!producto) throw new AppError(`Producto ${item.productId} no encontrado`, 404);
        if (producto.stock < item.cantidad) {
          throw new AppError(`Stock insuficiente para ${producto.nombre}`, 400);
        }

        // Descontar stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.cantidad } }
        });

        total += producto.precio * item.cantidad;
        itemsOrden.push({
          productId: item.productId,
          cantidad: item.cantidad,
          precio: producto.precio
        });
      }

      // 3. Crear orden
      return await tx.order.create({
        data: {
          userId: user.id,
          total,
          estado: 'PAGADO', // Las órdenes creadas por admin suelen estar pagadas o procesadas
          items: { createMany: { data: itemsOrden } }
        },
        include: { 
          items: { include: { product: true } },
          user: true
        }
      });
    });
  },

  async crearOrden(userId: string, cartId: string, metodoPago: string, itemsManuales?: any[], couponCode?: string, direccion?: string, ciudad?: string) {
    let targetCartId = cartId;
    let itemsParaOrden: any[] = [];

    if (cartId === 'current-cart') {
      let cart = await prisma.cart.findUnique({
        where: { userId: userId }
      });
      
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: userId }
        });
      }
      targetCartId = cart.id;

      // Si vienen items del frontend, sincronizamos el carrito primero
      if (itemsManuales && itemsManuales.length > 0) {
        // Limpiar items anteriores del carrito en DB para este usuario
        await prisma.cartItem.deleteMany({ where: { cartId: targetCartId } });
        
        // Insertar los nuevos items
        for (const item of itemsManuales) {
          // Validar que el producto exista antes de agregarlo al carrito
          const productExists = await prisma.product.findUnique({ where: { id: item.id } });
          if (productExists) {
            await prisma.cartItem.create({
              data: {
                cartId: targetCartId,
                productId: item.id,
                cantidad: item.cantidad
              }
            });
          }
        }
      }
    }

    // Obtener items del carrito final
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: targetCartId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      throw new AppError('El carrito está vacío', 400);
    }

    return await prisma.$transaction(async (tx) => {
      let total = 0;
      const itemsOrden: any[] = [];

      for (const item of cartItems) {
        if (item.product.stock < item.cantidad) {
          throw new AppError(`Stock insuficiente para ${item.product.nombre}`, 400);
        }

        await tx.product.update({ 
          where: { id: item.productId },
          data: { stock: { decrement: item.cantidad } }
        });

        total += Number(item.product.precio) * item.cantidad;
        itemsOrden.push({
          productId: item.productId,
          cantidad: item.cantidad,
          precio: item.product.precio
        });
      }

      // Validar cupón
      let descuento = 0;
      let couponId: string | undefined = undefined;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { codigo: couponCode } });
        if (coupon && coupon.activo && (coupon.usoMaximo === null || coupon.usosActuales < coupon.usoMaximo)) {
          if (coupon.tipo === 'PORCENTAJE') {
            descuento = total * (coupon.descuento / 100);
          } else {
            descuento = Math.min(total, coupon.descuento);
          }
          couponId = coupon.id;
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usosActuales: { increment: 1 } }
          });
        }
      }

      const orden = await tx.order.create({
        data: {
          userId,
          total: total - descuento,
          descuento,
          couponId,
          metodoPago,
          direccion,
          ciudad,
          estado: 'PAGADO', // Por defecto para este flujo
          items: { createMany: { data: itemsOrden } }
        },
        include: { items: { include: { product: true } } }
      });

      // Limpiar carrito
      await tx.cartItem.deleteMany({ where: { cartId: targetCartId } });

      return orden;
    });
  },

  async cambiarEstado(ordenId: string, nuevoEstado: string) {
    return await prisma.order.update({
      where: { id: ordenId },
      data: { estado: nuevoEstado },
    });
  },

  async obtenerTodas() {
    return await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nombre: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async obtenerPorUsuario(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async obtenerPorId(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nombre: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });
  },

  async procesarDevolucion(ordenId: string, motivo: string) {
    const orden = await this.obtenerPorId(ordenId);
    if (!orden) throw new AppError('Orden no encontrada', 404);
    if (orden.estado === 'DEVUELTO') throw new AppError('La orden ya ha sido devuelta', 400);

    return await prisma.$transaction(async (tx) => {
      // Devolver stock
      for (const item of orden.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.cantidad } },
        });
      }

      // Actualizar estado de la orden
      return await tx.order.update({
        where: { id: ordenId },
        data: { estado: 'DEVUELTO' },
        include: { items: true }
      });
    });
  },

  async cancelarOrden(ordenId: string, userId: string) {
    const orden = await this.obtenerPorId(ordenId);
    if (!orden) throw new AppError('Orden no encontrada', 404);
    if (orden.userId !== userId) throw new AppError('No tiene permisos para cancelar esta orden', 403);
    if (orden.estado !== 'PENDIENTE') throw new AppError('Solo se pueden cancelar órdenes pendientes', 400);

    const tiempoCancelacion = await configService.obtenerTiempoCancelacion();
    const diferenciaMinutos = (new Date().getTime() - new Date(orden.createdAt).getTime()) / (1000 * 60);

    if (diferenciaMinutos > tiempoCancelacion) {
      throw new AppError(`El tiempo límite para cancelar la orden (${tiempoCancelacion} min) ha expirado`, 400);
    }

    return await prisma.$transaction(async (tx) => {
      // Devolver stock
      for (const item of orden.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.cantidad } },
        });
      }

      // Si usó cupón, devolver el uso
      if (orden.couponId) {
        await tx.coupon.update({
          where: { id: orden.couponId },
          data: { usosActuales: { decrement: 1 } }
        });
      }

      return await tx.order.update({
        where: { id: ordenId },
        data: { estado: 'CANCELADO' }
      });
    });
  }
};
