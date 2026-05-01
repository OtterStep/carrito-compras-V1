#!/bin/sh

echo "Esperando a que la base de datos esté lista..."
# Una forma simple de esperar a que el puerto de la DB esté abierto
until nc -z db 5432; do
  echo "Base de datos no disponible - esperando..."
  sleep 2
done

echo "Base de datos conectada. Sincronizando esquema..."
npx prisma db push --accept-data-loss

echo "Ejecutando semillas (seeds)..."
npx prisma db seed

echo "Iniciando la aplicación..."
npm start
