import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

export const usuarioController = {
  async obtenerTodos(req: Request, res: Response) {
    try {
      const usuarios = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: usuarios });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async crear(req: Request, res: Response) {
    try {
      const { email, password, nombre, rol } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const usuario = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          nombre,
          rol
        }
      });
      
      res.status(201).json({ success: true, data: usuario });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, nombre, rol, password } = req.body;
      
      const data: any = { email, nombre, rol };
      if (password) {
        data.password = await bcrypt.hash(password, 10);
      }

      const usuario = await prisma.user.update({
        where: { id },
        data
      });
      
      res.json({ success: true, data: usuario });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // No permitir auto-eliminación por seguridad si quisiéramos
      await prisma.user.delete({ where: { id } });
      res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
