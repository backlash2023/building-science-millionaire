#!/bin/bash

# Server Setup Script for Building Science Millionaire
# Run this on your Linux server to prepare it for deployment
# Usage: sudo ./setup-server.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Building Science Millionaire - Server Setup${NC}"
echo "============================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Update system
echo -e "\n${YELLOW}Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install essential packages
echo -e "\n${YELLOW}Installing essential packages...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    unzip

# Install Node.js 20.x
echo -e "\n${YELLOW}Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node -v)
npm_version=$(npm -v)
echo -e "${GREEN}Node.js installed: $node_version${NC}"
echo -e "${GREEN}npm installed: $npm_version${NC}"

# Install PM2 globally
echo -e "\n${YELLOW}Installing PM2...${NC}"
npm install -g pm2

# Install PostgreSQL (optional - comment out if using SQLite)
echo -e "\n${YELLOW}Installing PostgreSQL...${NC}"
read -p "Do you want to install PostgreSQL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    apt-get install -y postgresql postgresql-contrib
    
    # Create database and user
    sudo -u postgres psql << EOF
CREATE USER buildingscience WITH PASSWORD 'change_this_password';
CREATE DATABASE buildingscience_millionaire OWNER buildingscience;
GRANT ALL PRIVILEGES ON DATABASE buildingscience_millionaire TO buildingscience;
EOF
    
    echo -e "${GREEN}PostgreSQL installed and configured${NC}"
    echo -e "${YELLOW}Remember to change the database password!${NC}"
fi

# Install Docker and Docker Compose (optional)
echo -e "\n${YELLOW}Installing Docker...${NC}"
read -p "Do you want to install Docker and Docker Compose? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Add current user to docker group
    usermod -aG docker $SUDO_USER
    
    echo -e "${GREEN}Docker and Docker Compose installed${NC}"
fi

# Create application directory
echo -e "\n${YELLOW}Creating application directory...${NC}"
mkdir -p /var/www/buildingscience-millionaire
chown -R $SUDO_USER:$SUDO_USER /var/www/buildingscience-millionaire

# Create log directory
mkdir -p /var/log/buildingscience-millionaire
chown -R $SUDO_USER:$SUDO_USER /var/log/buildingscience-millionaire

# Setup firewall
echo -e "\n${YELLOW}Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # For development/testing
echo "y" | ufw enable

# Configure Nginx
echo -e "\n${YELLOW}Configuring Nginx...${NC}"
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Create Nginx config for the app
cat > /etc/nginx/sites-available/buildingscience-millionaire << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/buildingscience-millionaire /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Configure fail2ban for security
echo -e "\n${YELLOW}Configuring fail2ban...${NC}"
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

systemctl restart fail2ban

# Create systemd service for PM2
echo -e "\n${YELLOW}Setting up PM2 as systemd service...${NC}"
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

# Create backup directory
echo -e "\n${YELLOW}Creating backup directory...${NC}"
mkdir -p /var/backups/buildingscience-millionaire
chown -R $SUDO_USER:$SUDO_USER /var/backups/buildingscience-millionaire

# Setup swap file (useful for low-memory servers)
echo -e "\n${YELLOW}Setting up swap file...${NC}"
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo -e "${GREEN}2GB swap file created${NC}"
fi

# Install monitoring tools
echo -e "\n${YELLOW}Installing monitoring tools...${NC}"
# Install netdata for system monitoring (optional)
read -p "Do you want to install Netdata for monitoring? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait
    echo -e "${GREEN}Netdata installed - access at http://your-server:19999${NC}"
fi

# Create deployment user
echo -e "\n${YELLOW}Creating deployment user...${NC}"
if ! id -u deploy > /dev/null 2>&1; then
    useradd -m -s /bin/bash deploy
    usermod -aG sudo deploy
    echo -e "${YELLOW}Please set password for deploy user:${NC}"
    passwd deploy
    
    # Setup SSH for deploy user
    mkdir -p /home/deploy/.ssh
    touch /home/deploy/.ssh/authorized_keys
    chown -R deploy:deploy /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    chmod 600 /home/deploy/.ssh/authorized_keys
    
    echo -e "${GREEN}Deploy user created${NC}"
    echo -e "${YELLOW}Add your SSH public key to /home/deploy/.ssh/authorized_keys${NC}"
fi

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Server setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nNext steps:"
echo -e "1. Add your SSH key to /home/deploy/.ssh/authorized_keys"
echo -e "2. Update your domain DNS to point to this server"
echo -e "3. Run: ${YELLOW}sudo certbot --nginx -d yourdomain.com${NC} to setup SSL"
echo -e "4. Copy .env.production to the server"
echo -e "5. Deploy your application using deploy.sh"
echo -e "\nServer information:"
echo -e "- Node.js: $node_version"
echo -e "- npm: $npm_version"
echo -e "- PM2: $(pm2 -v)"
echo -e "- Nginx: $(nginx -v 2>&1)"
echo -e "- Firewall: Enabled (ports 22, 80, 443, 3000 open)"
echo -e "- Fail2ban: Active"
echo -e "\nMonitoring:"
echo -e "- PM2: pm2 status"
echo -e "- Logs: /var/log/buildingscience-millionaire/"
echo -e "- Nginx: /var/log/nginx/"
if systemctl is-active --quiet netdata; then
    echo -e "- Netdata: http://$(hostname -I | awk '{print $1}'):19999"
fi