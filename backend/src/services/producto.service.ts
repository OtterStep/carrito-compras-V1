import prisma from '../lib/prisma';

export class ProductoService {
  static async getAll(filters: any = {}) {
    const { categoria, buscar, minPrecio, maxPrecio } = filters;
    
    const where: any = {};
    
    if (categoria && categoria !== '') {
      where.categoria = categoria;
    }
    
    if (buscar && buscar !== '') {
      where.OR = [
        { nombre: { contains: buscar, mode: 'insensitive' } },
        { descripcion: { contains: buscar, mode: 'insensitive' } }
      ];
    }
    
    if (minPrecio || maxPrecio) {
      where.precio = {};
      if (minPrecio) {
        const min = parseFloat(minPrecio);
        if (!isNaN(min)) where.precio.gte = min;
      }
      if (maxPrecio) {
        const max = parseFloat(maxPrecio);
        if (!isNaN(max)) where.precio.lte = max;
      }
      
      // Si el objeto precio quedó vacío, lo eliminamos
      if (Object.keys(where.precio).length === 0) {
        delete where.precio;
      }
    }

    return prisma.product.findMany({
      where,
      include: {
        reviews: {
          include: {
            user: {
              select: { nombre: true }
            }
          }
        }
      }
    });
  }

  static async getById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  static async create(data: any) {
    return prisma.product.create({ data });
  }

  static async update(id: string, data: any) {
    return prisma.product.update({ where: { id }, data });
  }

  static async delete(id: string) {
    // Verificar si el producto tiene órdenes asociadas
    const hasOrders = await prisma.orderItem.findFirst({
      where: { productId: id }
    });

    if (hasOrders) {
      throw new Error('No se puede eliminar un producto que ya tiene órdenes asociadas. Considere actualizar su stock a 0.');
    }

    // Eliminar de carritos antes de eliminar el producto
    await prisma.cartItem.deleteMany({
      where: { productId: id }
    });

    return prisma.product.delete({ where: { id } });
  }
}
