# Guía de Despliegue - Carrito de Compras

Esta guía detalla los pasos para desplegar el proyecto utilizando **Neon** (Base de Datos), **Render** (Backend) y **Vercel** (Frontend).

## 1. Base de Datos (Neon)

1. Regístrate en [Neon.tech](https://neon.tech/).
2. Crea un nuevo proyecto llamado `carrito-compras`.
3. En el Dashboard de Neon, copia la **Connection String** (asegúrate de que sea la versión `Pooled Connection` para mejor rendimiento).
4. La URL se verá algo así: `postgresql://neondb_owner:password@ep-host-name.region.aws.neon.tech/neondb?sslmode=require`.

## 2. Backend (Render)

1. Regístrate en [Render.com](https://render.com/).
2. Crea un nuevo **Web Service**.
3. Conecta tu repositorio de GitHub.
4. Configura los siguientes parámetros:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
5. Agrega las variables de entorno (**Environment Variables**):
   - `DATABASE_URL`: (La URL que copiaste de Neon)
   - `JWT_SECRET`: (Una cadena larga y segura, ej: `tu_secreto_super_seguro_123`)
   - `PORT`: `4000`
   - `NODE_ENV`: `production`

## 3. Frontend (Vercel)

1. Regístrate en [Vercel.com](https://vercel.com/).
2. Haz clic en **Add New** -> **Project**.
3. Importa tu repositorio de GitHub.
4. Configura los siguientes parámetros:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Agrega la variable de entorno:

| Variable | Valor | Descripción |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://[TU_APP].onrender.com/api` | **CRÍTICO**: Debe incluir `https://` y terminar en `/api`. |

## Notas Importantes

### Sincronización de Base de Datos
Para crear las tablas en Neon por primera vez, puedes ejecutar localmente (apuntando a la URL de Neon en tu `.env` local):
```bash
cd backend
npx prisma db push
npx prisma db seed
```

### CORS
El backend ya está configurado para aceptar peticiones de cualquier origen (`origin: '*'`). Para mayor seguridad en producción, puedes cambiarlo en `backend/src/app.ts` por la URL de tu frontend en Vercel.

### SPA Routing
Se ha incluido un archivo `frontend/vercel.json` para manejar correctamente las rutas de React (Single Page Application) en Vercel.
