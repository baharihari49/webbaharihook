#!/bin/bash

# Initialize Let's Encrypt SSL certificates with Docker

DOMAIN="webbaharihook2.baharihari.com"
EMAIL="admin@baharihari.com" # Replace with your email
STAGING=0 # Set to 1 for testing with staging server

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Initializing Let's Encrypt SSL for $DOMAIN${NC}"

# Check if domain is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Using default domain: $DOMAIN${NC}"
else
    DOMAIN=$1
    echo -e "${GREEN}Using domain: $DOMAIN${NC}"
fi

# Check if email is provided
if [ -z "$2" ]; then
    echo -e "${YELLOW}Using default email: $EMAIL${NC}"
else
    EMAIL=$2
    echo -e "${GREEN}Using email: $EMAIL${NC}"
fi

# Create required directories
echo "Creating directories..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www
mkdir -p ./nginx/logs

# Download recommended TLS parameters
echo "Downloading recommended TLS parameters..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > ./certbot/conf/options-ssl-nginx.conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ./certbot/conf/ssl-dhparams.pem

# Create temporary self-signed certificate for initial nginx startup
echo "Creating temporary self-signed certificate..."
mkdir -p ./certbot/conf/live/$DOMAIN
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    --entrypoint openssl \
    certbot/certbot \
    req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj "/CN=$DOMAIN"

# Update nginx config with correct domain
echo "Updating nginx configuration..."
sed -i "s/webbaharihook2.baharihari.com/$DOMAIN/g" ./nginx/nginx-ssl.conf

# Start nginx with temporary certificate
echo "Starting nginx with temporary certificate..."
docker-compose -f docker-compose.ssl.yml up -d nginx

# Delete temporary certificate
echo "Removing temporary certificate..."
docker-compose -f docker-compose.ssl.yml run --rm --entrypoint "\
    rm -rf /etc/letsencrypt/live/$DOMAIN && \
    rm -rf /etc/letsencrypt/archive/$DOMAIN && \
    rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

# Request Let's Encrypt certificate
echo -e "${GREEN}Requesting Let's Encrypt certificate...${NC}"

# Set staging flag if needed
STAGING_FLAG=""
if [ $STAGING -eq 1 ]; then
    STAGING_FLAG="--staging"
    echo -e "${YELLOW}Using Let's Encrypt staging server (for testing)${NC}"
fi

docker-compose -f docker-compose.ssl.yml run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
    $STAGING_FLAG \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN" certbot

# Check if certificate was obtained successfully
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate obtained successfully!${NC}"

    # Reload nginx with new certificate
    echo "Reloading nginx with new certificate..."
    docker-compose -f docker-compose.ssl.yml exec nginx nginx -s reload

    # Start all services
    echo "Starting all services..."
    docker-compose -f docker-compose.ssl.yml up -d

    echo -e "${GREEN}🎉 Setup complete!${NC}"
    echo -e "${GREEN}Your site is now available at: https://$DOMAIN${NC}"
    echo ""
    echo "To renew certificates automatically, the certbot container will check every 12 hours."
    echo "You can manually renew by running:"
    echo "  docker-compose -f docker-compose.ssl.yml run --rm certbot renew"
else
    echo -e "${RED}❌ Failed to obtain certificate${NC}"
    echo "Please check your domain DNS settings and try again."
    echo "Make sure $DOMAIN points to this server's IP address."
    exit 1
fi