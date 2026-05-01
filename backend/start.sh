#!/bin/sh

# Si DATABASE_URL está vacía, no podemos continuar
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL no está definida."
  exit 1
fi

# Intentar extraer el host de forma más robusta
# Formato esperado: postgresql://user:pass@host:port/db
DB_HOST=$(echo $DATABASE_URL | awk -F'@' '{print $2}' | awk -F'/' '{print $1}' | awk -F':' '{print $1}')

echo "Detectando host de base de datos: $DB_HOST"

if [ "$DB_HOST" = "db" ] || [ -z "$DB_HOST" ]; then
  echo "Entorno local o host no detectado. Esperando a 'db:5432'..."
  # Solo intentamos nc si estamos en local
  MAX_RETRIES=30
  COUNT=0
  until nc -z db 5432 || [ $COUNT -eq $MAX_RETRIES ]; do
    echo "Esperando a base de datos local ($COUNT/$MAX_RETRIES)..."
    sleep 2
    COUNT=$((COUNT + 1))
  done
else
  echo "Entorno cloud detectado (Neon/Render). Saltando espera de red local."
fi

echo "Sincronizando esquema con Prisma..."
npx prisma generate
npx prisma db push --accept-data-loss

echo "Ejecutando semillas (seeds)..."
npx prisma db seed

echo "Iniciando la aplicación..."
npm start
