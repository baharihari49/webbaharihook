#!/bin/bash

echo "🔄 Restarting development servers..."

# Kill existing processes
echo "🛑 Stopping existing servers..."
pkill -f "node server.js" || true
pkill -f "node server-http.js" || true

# Wait a moment
sleep 2

# Start development servers
echo "🚀 Starting development servers..."
echo "Press Ctrl+C to stop all services"
echo ""

# Start both servers in development mode
node server.js &
HTTPS_PID=$!

node server-http.js &
HTTP_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $HTTPS_PID 2>/dev/null || true
    kill $HTTP_PID 2>/dev/null || true
    echo "✅ Development servers stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

echo "✅ Development servers started:"
echo "🔒 HTTPS: https://172.28.1.12:3001"
echo "📡 HTTP: http://172.28.1.12:3002"
echo ""

# Wait for processes
wait $HTTPS_PID $HTTP_PID