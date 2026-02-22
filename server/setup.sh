#!/bin/bash

echo "=========================================="
echo "  CLASSIFIED ADS - BACKEND SETUP"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Install it with: sudo apt install nodejs npm"
    exit 1
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo ""

# Create uploads directory
mkdir -p uploads
mkdir -p data

echo "Setup complete!"
echo ""
echo "=========================================="
echo "  HOW TO RUN"
echo "=========================================="
echo ""
echo "1. Start the server:"
echo "   node index.js"
echo ""
echo "2. Install ngrok (to expose to internet):"
echo "   curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok-v3-stable-linux-amd64.tgz | sudo tar xvz -C /usr/local/bin"
echo ""
echo "3. Run ngrok in another terminal:"
echo "   ngrok http 5000"
echo ""
echo "4. Copy the ngrok HTTPS URL and set it in Vercel:"
echo "   VITE_API_URL=https://xxxx-xx-xx.ngrok-free.app/api"
echo ""
echo "=========================================="
