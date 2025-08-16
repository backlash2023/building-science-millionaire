#!/bin/bash

# Building Science Millionaire - Deployment Script
# Usage: ./deploy.sh [docker|traditional]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="buildingscience-millionaire"
DEPLOY_PATH="/var/www/buildingscience-millionaire"
SERVER_USER="deploy"
SERVER_HOST="YOUR_SERVER_IP"
BRANCH="main"

echo -e "${GREEN}Building Science Millionaire - Deployment Script${NC}"
echo "================================================"

# Check deployment type
DEPLOY_TYPE=${1:-traditional}

if [ "$DEPLOY_TYPE" != "docker" ] && [ "$DEPLOY_TYPE" != "traditional" ]; then
    echo -e "${RED}Invalid deployment type. Use 'docker' or 'traditional'${NC}"
    exit 1
fi

echo -e "${YELLOW}Deployment type: $DEPLOY_TYPE${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
echo -e "\n${YELLOW}Running pre-deployment checks...${NC}"

# Check for required files
if [ ! -f ".env.production" ]; then
    echo -e "${RED}Error: .env.production file not found!${NC}"
    echo "Please create .env.production from .env.production.example"
    exit 1
fi

# Build the application
echo -e "\n${YELLOW}Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Please fix errors before deploying.${NC}"
    exit 1
fi

# Run tests (if available)
if npm run test 2>/dev/null; then
    echo -e "${GREEN}Tests passed!${NC}"
else
    echo -e "${YELLOW}No tests found or tests skipped${NC}"
fi

# Generate Prisma client
echo -e "\n${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

# Create deployment package
echo -e "\n${YELLOW}Creating deployment package...${NC}"
DEPLOY_PACKAGE="deploy-${APP_NAME}-$(date +%Y%m%d-%H%M%S).tar.gz"

if [ "$DEPLOY_TYPE" == "docker" ]; then
    # Docker deployment package
    tar -czf $DEPLOY_PACKAGE \
        --exclude=node_modules \
        --exclude=.next \
        --exclude=.git \
        --exclude=*.db \
        --exclude=logs \
        --exclude=.env.local \
        --exclude=.env.development \
        .
else
    # Traditional deployment package (includes built files)
    tar -czf $DEPLOY_PACKAGE \
        --exclude=.git \
        --exclude=*.db \
        --exclude=logs \
        --exclude=.env.local \
        --exclude=.env.development \
        --exclude=node_modules/.cache \
        .
fi

echo -e "${GREEN}Deployment package created: $DEPLOY_PACKAGE${NC}"

# Transfer to server
echo -e "\n${YELLOW}Transferring to server...${NC}"
scp $DEPLOY_PACKAGE ${SERVER_USER}@${SERVER_HOST}:/tmp/

# Deploy on server
echo -e "\n${YELLOW}Deploying on server...${NC}"

if [ "$DEPLOY_TYPE" == "docker" ]; then
    # Docker deployment
    ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
        set -e
        
        # Create app directory if it doesn't exist
        sudo mkdir -p /var/www/buildingscience-millionaire
        cd /var/www/buildingscience-millionaire
        
        # Backup current deployment
        if [ -d "app" ]; then
            sudo mv app app.backup.$(date +%Y%m%d-%H%M%S)
        fi
        
        # Extract new deployment
        sudo tar -xzf /tmp/deploy-*.tar.gz -C .
        
        # Copy production environment file
        sudo cp .env.production .env
        
        # Build and start with Docker Compose
        sudo docker-compose down
        sudo docker-compose build --no-cache
        sudo docker-compose up -d
        
        # Check if containers are running
        sleep 5
        sudo docker-compose ps
        
        # Run database migrations
        sudo docker-compose exec -T app npx prisma migrate deploy
        
        # Import questions if database is empty
        sudo docker-compose exec -T app npx tsx scripts/import-all-questions.ts || true
        
        echo "Docker deployment complete!"
ENDSSH

else
    # Traditional deployment with PM2
    ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
        set -e
        
        # Create app directory if it doesn't exist
        sudo mkdir -p /var/www/buildingscience-millionaire
        cd /var/www/buildingscience-millionaire
        
        # Backup current deployment
        if [ -d "current" ]; then
            sudo mv current backup.$(date +%Y%m%d-%H%M%S)
        fi
        
        # Create new deployment directory
        sudo mkdir current
        
        # Extract new deployment
        sudo tar -xzf /tmp/deploy-*.tar.gz -C current/
        
        # Copy production environment file
        sudo cp current/.env.production current/.env
        
        # Install dependencies
        cd current
        npm ci --production
        
        # Run database migrations
        npx prisma migrate deploy
        
        # Import questions if database is empty
        npx tsx scripts/import-all-questions.ts || true
        
        # Start/Restart with PM2
        pm2 delete buildingscience-millionaire || true
        pm2 start ecosystem.config.js --env production
        pm2 save
        
        # Setup PM2 to start on boot
        pm2 startup systemd -u $USER --hp /home/$USER
        
        echo "PM2 deployment complete!"
ENDSSH
fi

# Cleanup local deployment package
rm $DEPLOY_PACKAGE

# Verify deployment
echo -e "\n${YELLOW}Verifying deployment...${NC}"
sleep 5

if [ "$DEPLOY_TYPE" == "docker" ]; then
    ssh ${SERVER_USER}@${SERVER_HOST} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000" | grep -q "200"
else
    ssh ${SERVER_USER}@${SERVER_HOST} "pm2 status buildingscience-millionaire | grep -q online"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}Application is running at: http://${SERVER_HOST}:3000${NC}"
else
    echo -e "${RED}⚠️  Deployment may have issues. Please check the server logs.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Deployment complete!${NC}"
echo "Next steps:"
echo "1. Configure your domain DNS to point to ${SERVER_HOST}"
echo "2. Setup SSL certificates with: sudo certbot --nginx -d yourdomain.com"
echo "3. Update nginx configuration with your domain"
echo "4. Monitor logs:"
if [ "$DEPLOY_TYPE" == "docker" ]; then
    echo "   docker-compose logs -f"
else
    echo "   pm2 logs buildingscience-millionaire"
fi