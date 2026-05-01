import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; rol: string };
}

export const verifyAccessToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log(`--- Verificando Token para ${req.method} ${req.url} ---`);
  console.log('Auth Header:', authHeader ? 'Presente' : 'Ausente');

  // Si es una petición OPTIONS, omitir verificación (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Error: Bearer token no encontrado');
    res.setHeader('WWW-Authenticate', 'Bearer realm="api"');
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    console.log('Token decodificado correctamente para:', decoded.email, 'Rol:', decoded.rol);
    req.user = { id: decoded.id, email: decoded.email, rol: decoded.rol };
    next();
  } catch (error: any) {
    console.log('Error al verificar token:', error.message);
    return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};
