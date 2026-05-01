import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { config } from '../config';
import { AppError } from '../utils/AppError';

export class AuthService {
  static async register(data: any) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new AppError('Ya existe una cuenta con este correo electrónico', 400);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  static async login(email: string, pass: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) throw new AppError('Contraseña incorrecta', 401);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    return { user, accessToken };
  }
}
