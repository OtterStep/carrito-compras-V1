markdown
# E-Commerce Platform

## Requisitos
- Node.js 20+
- PostgreSQL 16+
- pnpm o npm

## Instalación
1. Clonar repositorio
2. Crear base de datos y ejecutar `sql/create_database.sql`
3. Copiar `.env.example` a `.env` en backend y configurar
4. Instalar dependencias: `npm install` en raíz, backend y frontend
5. Ejecutar migraciones Prisma: `cd backend && npx prisma migrate dev`
6. Iniciar en desarrollo: `npm run dev`

## Producción
- Construir: `npm run build`
- Iniciar: `npm start` (servirá backend en puerto 4000 y frontend como SPA estático con Nginx o similar)
