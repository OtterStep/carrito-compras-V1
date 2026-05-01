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
      const itemsOrden = [];

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

  async crearOrden(userId: string, cartId: string, data: { metodoPago: string, direccion: string, ciudad: string, itemsManuales?: any[], couponCode?: string }) {
    const { metodoPago, direccion, ciudad, itemsManuales, couponCode } = data;
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

    const itemsCarrito = await prisma.cartItem.findMany({
      where: { cartId: targetCartId },
      include: { product: true },
    });
    if (!itemsCarrito.length) throw new AppError('Carrito vacío', 400);

    let subtotal = 0;
    const itemsOrden = itemsCarrito.map(item => {
      const precio = item.product.precio;
      subtotal += Number(precio) * item.cantidad;
      return {
        productId: item.productId,
        cantidad: item.cantidad,
        precio: precio,
      };
    });

    let descuento = 0;
    let couponId = null;

    if (couponCode) {
      const cupon = await cuponService.validar(couponCode);
      couponId = cupon.id;
      if (cupon.tipo === 'PORCENTAJE') {
        descuento = subtotal * (cupon.descuento / 100);
      } else {
        descuento = cupon.descuento;
      }
    }

    const total = Math.max(0, subtotal - descuento);

    return await prisma.$transaction(async (tx) => {
      // Validar stock antes de descontar
      for (const item of itemsCarrito) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });
        
        if (!product) {
          throw new AppError(`Producto ${item.productId} no encontrado`, 404);
        }

        if (product.stock < item.cantidad) {
          throw new AppError(`Stock insuficiente para el producto: ${product.nombre}. Disponible: ${product.stock}`, 400);
        }

        // Descontar stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      // Incrementar uso del cupón
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usosActuales: { increment: 1 } }
        });
      }

      const orden = await tx.order.create({
        data: {
          userId,
          total,
          descuento,
          couponId,
          estado: metodoPago === 'TARJETA' ? 'PENDIENTE' : 'PENDIENTE', // Por defecto pendiente hasta que se procese el pago
          metodoPago,
          direccion,
          ciudad,
          items: { createMany: { data: itemsOrden } },
        },
        include: { items: true },
      });

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
