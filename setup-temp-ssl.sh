#!/bin/bash

echo "🔐 Creating temporary SSL certificate..."

# Create directory
mkdir -p ./certbot/conf/live/webbaharihook2.baharihari.com

# Generate temporary certificate
openssl req -x509 -nodes -newkey rsa:2048 -days 30 \
    -keyout ./certbot/conf/live/webbaharihook2.baharihari.com/privkey.pem \
    -out ./certbot/conf/live/webbaharihook2.baharihari.com/fullchain.pem \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Webbaharihook/CN=webbaharihook2.baharihari.com" \
    2>/dev/null

# Set permissions
chmod 600 ./certbot/conf/live/webbaharihook2.baharihari.com/privkey.pem
chmod 644 ./certbot/conf/live/webbaharihook2.baharihari.com/fullchain.pem

echo "✅ Temporary SSL certificate created!"
echo "Now run: docker-compose up -d"