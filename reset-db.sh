#!/bin/bash

echo "🗄️ Resetting database migration..."

# Connect to MySQL and reset migration state
mysql -h 72.60.194.28 -u Bahari -p"dWs%3X>MD^(WHv]0<0.5B\`t256@\"mg" webbaharihook << 'EOF'
-- Delete failed migration record
DELETE FROM _prisma_migrations WHERE migration_name = '20250101000000_add_multiple_destination_urls';

-- Show current migrations
SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations;
EOF

echo "✅ Database migration reset!"
echo "Now you can run: docker-compose up -d"