#!/bin/bash

# Building Science Millionaire - Dev Server Startup Script
# Usage: ./start-dev.sh [your-server-ip]

SERVER_IP=${1:-"localhost"}

echo "🎮 Starting Building Science Millionaire on port 5050..."
echo "🌐 Server IP: $SERVER_IP"

# Update environment with actual IP
sed -i.bak "s/your-server-ip/$SERVER_IP/g" .env.production
sed -i.bak "s/your-server-ip/$SERVER_IP/g" nginx.conf

# Ensure data directory exists
mkdir -p data
mkdir -p logs

# Initialize database if needed
echo "📊 Setting up database..."
npx prisma migrate deploy

# Build the application
echo "🔧 Building application..."
NODE_ENV=production npm run build

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

echo ""
echo "✅ Application started successfully!"
echo "🌐 Access your app at: http://$SERVER_IP:5050"
echo ""
echo "📋 Management commands:"
echo "  pm2 status                    - Check status"
echo "  pm2 logs buildingscience-millionaire  - View logs"
echo "  pm2 restart buildingscience-millionaire  - Restart app"
echo "  pm2 stop buildingscience-millionaire     - Stop app"
echo ""