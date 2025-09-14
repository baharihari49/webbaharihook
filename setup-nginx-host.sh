#!/bin/bash

echo "🔄 Setting up Nginx on host..."

# Stop Docker nginx and certbot
echo "Stopping Docker nginx and certbot..."
docker-compose down nginx certbot 2>/dev/null || true

# Install nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Copy nginx config
echo "Setting up Nginx configuration..."
sudo cp nginx-host.conf /etc/nginx/sites-available/webbaharihook
sudo ln -sf /etc/nginx/sites-available/webbaharihook /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Start only the application container (without nginx)
echo "Starting application container..."
docker-compose up -d webbaharihook

echo "✅ Nginx host setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure domain points to this server"
echo "2. Run: sudo certbot --nginx -d webbaharihook2.baharihari.com"
echo "3. Access: https://webbaharihook2.baharihari.com"