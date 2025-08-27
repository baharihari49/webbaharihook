#!/bin/bash

echo "Stopping ngrok tunnel..."
pkill -f ngrok

echo "Cleaning up..."
rm -f ngrok.log

echo "Ngrok tunnel stopped!"