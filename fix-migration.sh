#!/bin/bash

echo "🔧 Fixing Prisma migration issue..."

# Stop containers
docker-compose down

# Connect to database and fix migration
echo "Resetting failed migration..."
docker run --rm --env-file .env \
  -v $(pwd)/prisma:/app/prisma \
  node:20-alpine sh -c '
    npm install -g prisma@6.14.0
    cd /app

    # Mark migration as rolled back
    prisma migrate resolve --rolled-back 20250101000000_add_multiple_destination_urls

    echo "Migration reset complete!"
  '

echo "✅ Migration issue fixed!"
echo "Now run: docker-compose up -d"