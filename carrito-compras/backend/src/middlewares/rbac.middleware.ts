import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log('RBAC Error: No hay usuario en la petición');
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    
    const userRole = (req.user.rol || '').toUpperCase();
    const roles = allowedRoles.map(r => r.toUpperCase());

    console.log(`--- Verificando Rol ---`);
    console.log(`Usuario: ${req.user.email}, Rol en Token: "${userRole}"`);
    console.log(`Roles requeridos: ${roles.join(', ')}`);

    if (!userRole || !roles.includes(userRole)) {
      console.log('RBAC Error: Permisos insuficientes para el rol:', userRole);
      return res.status(403).json({ 
        success: false, 
        message: 'Permisos insuficientes. Se requiere uno de los siguientes roles: ' + allowedRoles.join(', ') 
      });
    }
    
    console.log('RBAC: Acceso concedido');
    next();
  };
};
