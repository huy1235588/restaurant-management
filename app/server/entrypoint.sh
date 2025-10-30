#!/bin/sh
set -e

# Wait for database with timeout
echo "Waiting for database..."
TIMEOUT=60
ELAPSED=0
while ! nc -z postgres 5432; do
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "❌ Database connection timeout after ${TIMEOUT}s"
    exit 1
  fi
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done
echo "✅ Database is ready!"

# Run Prisma migrations with error handling
echo "Running Prisma migrations..."
if [ "$NODE_ENV" = "development" ]; then
    if ! pnpm prisma:migrate; then
        echo "⚠️ Migration failed in development mode, continuing..."
    fi
else
    if ! pnpm prisma:migrate:deploy; then
        echo "❌ Migration failed in production mode"
        exit 1
    fi
fi
echo "✅ Migrations completed"

# Seed the database (optional, skip if fails)
echo "Seeding database..."
if ! pnpm prisma:seed; then
    echo "⚠️ Database seeding failed or skipped"
fi

# Start the application
echo "🚀 Starting application..."
if [ "$NODE_ENV" = "development" ]; then
    exec pnpm dev
else
    exec pnpm start
fi