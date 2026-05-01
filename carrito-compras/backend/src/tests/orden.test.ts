import { ordenService } from '../services/orden.service';
import prisma from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    cart: {
      findUnique: jest.fn(),
    },
    cartItem: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(prisma)),
  },
}));

describe('ordenService', () => {
  it('debe lanzar error si el carrito está vacío', async () => {
    (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([]);
    
    await expect(ordenService.crearOrden('user-1', 'cart-1', 'TARJETA'))
      .rejects.toThrow('Carrito vacío');
  });

  it('debe crear una orden exitosamente', async () => {
    const mockItems = [
      { productId: 'p1', cantidad: 2, product: { precio: 10, stock: 10 } }
    ];
    (prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockItems);
    (prisma.order.create as jest.Mock).mockResolvedValue({ id: 'order-1', total: 20 });

    const result = await ordenService.crearOrden('user-1', 'cart-1', 'TARJETA');

    expect(result.id).toBe('order-1');
    expect(prisma.product.update).toHaveBeenCalled();
    expect(prisma.cartItem.deleteMany).toHaveBeenCalled();
  });
});
