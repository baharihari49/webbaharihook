#!/bin/bash

# Kill existing ngrok processes
pkill -f ngrok || true

# Start ngrok tunnel for HTTP 172.28.1.12:3002 (for tunnel compatibility)  
echo "Starting ngrok tunnel for http://172.28.1.12:3002"
nohup ngrok http http://172.28.1.12:3002 --host-header=rewrite > ngrok.log 2>&1 &

# Wait for ngrok to start
sleep 5

# Get ngrok public URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok[^"]*')

if [ -z "$NGROK_URL" ]; then
    echo "Failed to get ngrok URL, checking log..."
    cat ngrok.log
    exit 1
fi

echo "Ngrok tunnel started!"
echo "Public URL: $NGROK_URL"
echo "HTTPS URL: https://172.28.1.12:3001" 
echo "HTTP URL: http://172.28.1.12:3002"

# Update .env file with ngrok URL if it doesn't exist
if ! grep -q "NGROK_URL" .env; then
    echo "" >> .env
    echo "# Ngrok public URL (auto-generated)" >> .env
    echo "NGROK_URL=$NGROK_URL" >> .env
else
    # Update existing NGROK_URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|NGROK_URL=.*|NGROK_URL=$NGROK_URL|" .env
    else
        sed -i "s|NGROK_URL=.*|NGROK_URL=$NGROK_URL|" .env
    fi
fi

echo "Environment updated with ngrok URL"