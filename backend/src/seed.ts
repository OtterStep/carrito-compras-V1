import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  // Crear Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      nombre: 'Administrador',
      password: hashedPassword,
      rol: 'ADMIN',
    },
  });

  // Crear Productos
  const products = [
    {
      nombre: 'Smartphone X1',
      descripcion: 'El último grito en tecnología móvil.',
      precio: 999.99,
      stock: 50,
      categoria: 'Electrónica',
    },
    {
      nombre: 'Laptop Pro 16',
      descripcion: 'Potencia pura para profesionales.',
      precio: 1999.99,
      stock: 20,
      categoria: 'Computación',
    },
    {
      nombre: 'Audífonos Noise Cancel',
      descripcion: 'Sumérgete en tu música sin distracciones.',
      precio: 299.99,
      stock: 100,
      categoria: 'Audio',
    },
  ];

  for (const product of products) {
    const exists = await prisma.product.findFirst({
      where: { nombre: product.nombre }
    });
    
    if (!exists) {
      await prisma.product.create({
        data: product,
      });
    }
  }

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
