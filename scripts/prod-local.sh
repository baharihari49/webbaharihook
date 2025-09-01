#!/bin/bash

echo "🚀 Starting Production Mode Locally with Ngrok Tunnel"
echo "=================================================="

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "node server" || true
pkill -f "ngrok" || true

# Setup SSL certificates if needed
echo "🔐 Checking SSL certificates..."
bash scripts/setup-ssl.sh

# Build for production
echo "📦 Building for production..."
NODE_ENV=production pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Exiting..."
    exit 1
fi

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
bash scripts/start-tunnel.sh

if [ $? -ne 0 ]; then
    echo "❌ Ngrok tunnel failed! Exiting..."
    exit 1
fi

# Wait a bit more for ngrok to fully initialize
sleep 3

# Get ngrok URL for display
NGROK_URL=$(grep "NGROK_URL=" .env | cut -d'=' -f2)

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo "🌍 Public URL: $NGROK_URL"
echo "🔒 HTTPS Local: https://172.28.1.12:3001"  
echo "📡 HTTP Local: http://172.28.1.12:3002"
echo ""

# Start production servers
echo "🚀 Starting production servers..."
echo "Press Ctrl+C to stop all services"
echo ""

# Start both servers in production mode
NODE_ENV=production node server-production.js &
HTTPS_PID=$!

NODE_ENV=production node server-http.js &
HTTP_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $HTTPS_PID 2>/dev/null || true
    kill $HTTP_PID 2>/dev/null || true
    pkill -f ngrok || true
    echo "✅ All services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for processes
wait $HTTPS_PID $HTTP_PID