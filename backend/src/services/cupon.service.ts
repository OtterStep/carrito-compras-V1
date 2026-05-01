import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

export const cuponService = {
  async crear(data: { codigo: string; descuento: number; tipo: string; fechaExpiracion?: string; usoMaximo?: number }) {
    const existe = await prisma.coupon.findUnique({ where: { codigo: data.codigo } });
    if (existe) throw new AppError('El código del cupón ya existe', 400);

    return await prisma.coupon.create({
      data: {
        ...data,
        fechaExpiracion: data.fechaExpiracion ? new Date(data.fechaExpiracion) : null,
      }
    });
  },

  async obtenerTodos() {
    return await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },

  async obtenerActivos() {
    return await prisma.coupon.findMany({
      where: {
        activo: true,
        OR: [
          { fechaExpiracion: null },
          { fechaExpiracion: { gt: new Date() } }
        ]
      }
    });
  },

  async validar(codigo: string) {
    const cupon = await prisma.coupon.findUnique({ where: { codigo } });
    
    if (!cupon) throw new AppError('Cupón no encontrado', 404);
    if (!cupon.activo) throw new AppError('El cupón no está activo', 400);
    if (cupon.fechaExpiracion && new Date(cupon.fechaExpiracion) < new Date()) {
      throw new AppError('El cupón ha expirado', 400);
    }
    if (cupon.usoMaximo && cupon.usosActuales >= cupon.usoMaximo) {
      throw new AppError('El cupón ha alcanzado su límite de uso', 400);
    }

    return cupon;
  },

  async actualizar(id: string, data: any) {
    if (data.fechaExpiracion) data.fechaExpiracion = new Date(data.fechaExpiracion);
    return await prisma.coupon.update({
      where: { id },
      data
    });
  },

  async eliminar(id: string) {
    return await prisma.coupon.delete({ where: { id } });
  }
};
