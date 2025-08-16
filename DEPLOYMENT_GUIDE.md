# Building Science Millionaire - Ubuntu Server Deployment Guide

Deploy your Building Science Millionaire game to an Ubuntu server at **13.91.60.221:5050**.

## Prerequisites

- Ubuntu 20.04+ server
- Root or sudo access
- Server IP: **13.91.60.221**
- Target port: **5050**

## Quick Deployment

### 1. Server Setup (One-time)

SSH into your server and run the setup script:

```bash
# SSH into your server
ssh root@13.91.60.221

# Download and run server setup
curl -o setup-server.sh https://raw.githubusercontent.com/yourusername/buildingscience-millionaire/main/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

### 2. Deploy Application

Upload your code and start the application:

```bash
# Option A: Git Clone (if repository is public)
cd /var/www
git clone https://github.com/yourusername/buildingscience-millionaire.git
cd buildingscience-millionaire

# Option B: Upload files via SCP
# From your local machine:
scp -r ./buildingscience-millionaire root@13.91.60.221:/var/www/

# Install dependencies
npm install

# Set up database
npx prisma migrate deploy

# Build application
NODE_ENV=production npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration for auto-restart
pm2 save
pm2 startup
```

### 3. Configure Firewall

```bash
# Allow port 5050
sudo ufw allow 5050/tcp
sudo ufw reload
```

## Access Your Application

🎮 **Game URL:** http://13.91.60.221:5050

## Management Commands

### Application Control
```bash
# Check status
pm2 status

# View logs
pm2 logs buildingscience-millionaire

# Restart application
pm2 restart buildingscience-millionaire

# Stop application
pm2 stop buildingscience-millionaire

# Monitor resources
pm2 monit
```

### Database Management
```bash
# View database
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Import questions
npx tsx scripts/import-all-questions.ts
```

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
npm run build
pm2 restart buildingscience-millionaire
```

## Manual Deployment Steps

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install other tools
sudo apt install -y git nginx sqlite3
```

### 2. Prepare Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/buildingscience-millionaire
sudo chown $USER:$USER /var/www/buildingscience-millionaire
cd /var/www/buildingscience-millionaire
```

### 3. Upload and Configure Files

```bash
# Copy your built application files here
# Ensure .env.production is properly configured

# Install dependencies
npm install --production

# Set up database
npx prisma migrate deploy
```

### 4. Configure PM2

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Configure auto-start on boot
pm2 startup
pm2 save
```

### 5. Optional: Configure Nginx (Reverse Proxy)

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/buildingscience-millionaire
sudo ln -s /etc/nginx/sites-available/buildingscience-millionaire /etc/nginx/sites-enabled/

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

## Environment Configuration

The application is pre-configured for:
- **Server IP:** 13.91.60.221
- **Port:** 5050
- **Database:** SQLite (./data/prod.db)
- **OpenAI API:** Configured for TTS functionality

## File Structure

```
/var/www/buildingscience-millionaire/
├── .env.production          # Production environment variables
├── ecosystem.config.js      # PM2 configuration
├── nginx.conf              # Nginx reverse proxy config
├── data/                   # SQLite database directory
├── logs/                   # Application logs
├── .next/                  # Built Next.js application
└── node_modules/           # Dependencies
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs buildingscience-millionaire

# Check port availability
sudo lsof -i :5050

# Restart application
pm2 restart buildingscience-millionaire
```

### Database Issues
```bash
# Check database permissions
ls -la data/

# Reset database
npx prisma migrate reset
npx prisma migrate deploy
```

### Network Issues
```bash
# Check firewall
sudo ufw status

# Check if port is listening
sudo netstat -tlnp | grep 5050

# Test local connection
curl http://localhost:5050
```

### Performance Issues
```bash
# Check system resources
htop
df -h
free -h

# Check PM2 status
pm2 monit
```

## Security Considerations

1. **Firewall:** Only allow necessary ports (22, 5050)
2. **Updates:** Keep system and dependencies updated
3. **Backups:** Regular database backups
4. **Monitoring:** Set up log monitoring and alerts

## Backup Script

Create automated backups:

```bash
# Create backup script
cat > /usr/local/bin/backup-buildingscience.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/buildingscience"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp /var/www/buildingscience-millionaire/data/prod.db "$BACKUP_DIR/prod_$DATE.db"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "prod_*.db" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-buildingscience.sh

# Add to crontab for daily backups
echo "0 2 * * * /usr/local/bin/backup-buildingscience.sh" | sudo crontab -
```

## Support

- **Application URL:** http://13.91.60.221:5050
- **Admin Dashboard:** http://13.91.60.221:5050/admin
- **Leaderboard:** http://13.91.60.221:5050/leaderboard

For issues, check the logs and restart the application. The game is fully configured and ready for production use!