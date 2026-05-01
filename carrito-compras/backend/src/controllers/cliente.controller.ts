import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const clienteController = {
  // --- Perfil y Direcciones ---
  async obtenerPerfil(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          addresses: true,
        },
      });
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      
      const { password, ...userData } = user;
      res.json({ success: true, data: userData });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async actualizarPerfil(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { nombre, email } = req.body;
      const user = await prisma.user.update({
        where: { id: userId },
        data: { nombre, email },
      });
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async agregarDireccion(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { direccion, ciudad, estado, codigoPostal, pais, esPrincipal } = req.body;
      
      if (esPrincipal) {
        await prisma.address.updateMany({
          where: { userId },
          data: { esPrincipal: false },
        });
      }

      const address = await prisma.address.create({
        data: { userId, direccion, ciudad, estado, codigoPostal, pais, esPrincipal },
      });
      res.status(201).json({ success: true, data: address });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async eliminarDireccion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.address.delete({ where: { id } });
      res.json({ success: true, message: 'Dirección eliminada' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- Wishlist ---
  async obtenerWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      let wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!wishlist) {
        wishlist = await prisma.wishlist.create({
          data: { userId },
          include: { items: { include: { product: true } } },
        });
      }

      res.json({ success: true, data: wishlist });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async agregarAWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { productId } = req.body;

      let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
      if (!wishlist) {
        wishlist = await prisma.wishlist.create({ data: { userId } });
      }

      const existingItem = await prisma.wishlistItem.findFirst({
        where: { wishlistId: wishlist.id, productId },
      });

      if (existingItem) {
        return res.status(400).json({ success: false, message: 'El producto ya está en la lista de deseos' });
      }

      const item = await prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId },
      });

      res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async eliminarDeWishlist(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.wishlistItem.delete({ where: { id } });
      res.json({ success: true, message: 'Producto eliminado de la lista de deseos' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- Reseñas ---
  async agregarReseña(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { productId, calificacion, comentario } = req.body;

      // Verificar si el usuario compró el producto
      const compro = await prisma.order.findFirst({
        where: {
          userId,
          estado: 'PAGADO',
          items: {
            some: { productId },
          },
        },
      });

      if (!compro) {
        return res.status(403).json({ success: false, message: 'Solo puedes dejar reseñas de productos que hayas comprado' });
      }

      const review = await prisma.review.create({
        data: { userId, productId, calificacion, comentario },
      });

      res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async obtenerReseñasProducto(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const reviews = await prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { nombre: true } },
        },
      });
      res.json({ success: true, data: reviews });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
