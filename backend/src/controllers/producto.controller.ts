import { Request, Response, NextFunction } from 'express';
import { ProductoService } from '../services/producto.service';

export class ProductoController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoria, buscar, minPrecio, maxPrecio } = req.query;
      const productos = await ProductoService.getAll({ categoria, buscar, minPrecio, maxPrecio });
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const producto = await ProductoService.getById(req.params.id);
      if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
      res.json(producto);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const producto = await ProductoService.create(req.body);
      res.status(201).json(producto);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const producto = await ProductoService.update(req.params.id, req.body);
      res.json(producto);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductoService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
