#!/bin/sh

# Extraer el host de la URL de la base de datos para decidir si esperar
DB_HOST=$(echo $DATABASE_URL | sed -e 's|.*@||' -e 's|/.*||' -e 's|:.*||')

if [ "$DB_HOST" = "db" ]; then
  echo "Entorno local (Docker) detectado. Esperando a contenedor 'db'..."
  until nc -z db 5432; do
    echo "Base de datos no disponible - esperando..."
    sleep 2
  done
  echo "Base de datos conectada."
else
  echo "Entorno cloud detectado (Host: $DB_HOST). Saltando chequeo de 'nc'..."
fi

echo "Sincronizando esquema con Prisma..."
npx prisma generate
npx prisma db push --accept-data-loss

echo "Ejecutando semillas (seeds)..."
npx prisma db seed

echo "Iniciando la aplicación..."
npm start
