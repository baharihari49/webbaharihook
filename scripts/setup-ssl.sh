#!/bin/bash

echo "🔐 Setting up SSL certificates for local production..."

# Create certs directory if it doesn't exist
mkdir -p certs

# Check if certificates already exist
if [ -f "certs/localhost-key.pem" ] && [ -f "certs/localhost.pem" ]; then
    echo "✅ SSL certificates already exist"
    exit 0
fi

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "⚠️  mkcert not found. Installing mkcert..."
    
    # Install mkcert based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y libnss3-tools
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        elif command -v yum &> /dev/null; then
            sudo yum install -y nss-tools
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        else
            echo "❌ Unsupported Linux distribution. Please install mkcert manually."
            echo "Visit: https://github.com/FiloSottile/mkcert"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install mkcert
        else
            echo "❌ Homebrew not found. Please install mkcert manually."
            echo "Visit: https://github.com/FiloSottile/mkcert"
            exit 1
        fi
    else
        echo "❌ Unsupported operating system. Please install mkcert manually."
        echo "Visit: https://github.com/FiloSottile/mkcert"
        exit 1
    fi
fi

echo "🔧 Installing local CA..."
mkcert -install

echo "📜 Generating certificates..."
cd certs
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 172.28.1.12 127.0.0.1 ::1
cd ..

if [ -f "certs/localhost-key.pem" ] && [ -f "certs/localhost.pem" ]; then
    echo "✅ SSL certificates generated successfully!"
    echo "📁 Certificates saved in certs/ directory"
else
    echo "❌ Failed to generate SSL certificates"
    exit 1
fi