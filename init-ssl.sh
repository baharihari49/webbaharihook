#!/bin/bash

# Simple SSL setup script for Webbaharihook

DOMAIN=${1:-webbaharihook2.baharihari.com}
EMAIL=${2:-admin@example.com}

echo "🔐 Setting up SSL for $DOMAIN"

# Create directories
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Download SSL configurations
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > ./certbot/conf/options-ssl-nginx.conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ./certbot/conf/ssl-dhparams.pem

# Create temporary certificate
echo "Creating temporary certificate..."
mkdir -p ./certbot/conf/live/$DOMAIN
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout ./certbot/conf/live/$DOMAIN/privkey.pem \
    -out ./certbot/conf/live/$DOMAIN/fullchain.pem \
    -subj "/CN=$DOMAIN" 2>/dev/null

# Start nginx
echo "Starting services..."
docker-compose up -d nginx

# Wait for nginx to start
sleep 5

# Get real certificate
echo "Getting Let's Encrypt certificate..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN

# Reload nginx
docker-compose exec nginx nginx -s reload

# Start all services
docker-compose up -d

echo "✅ SSL setup complete!"
echo "Access your site at: https://$DOMAIN"