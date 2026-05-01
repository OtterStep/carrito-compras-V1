import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Aquí podrías ejecutar migraciones o limpiar la base de datos de prueba
  // execSync('npx prisma migrate reset --force');
});

afterAll(async () => {
  await prisma.$disconnect();
});
