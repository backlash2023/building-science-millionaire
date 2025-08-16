# Building Science Millionaire - Deployment Guide

## Overview
This guide covers deploying the Building Science Millionaire application to a Linux server using either Docker or traditional Node.js/PM2 deployment.

## Prerequisites
- Linux server (Ubuntu 20.04+ or similar)
- Domain name (optional but recommended)
- SSH access to the server
- At least 2GB RAM and 20GB storage

## Quick Start

### 1. Prepare Your Local Environment
```bash
# Copy and configure production environment
cp .env.production.example .env.production
# Edit .env.production with your values

# Build the application
npm run build

# Make deployment scripts executable
chmod +x deploy.sh setup-server.sh backup.sh
```

### 2. Setup Your Server
```bash
# Copy setup script to server
scp setup-server.sh user@your-server:/tmp/

# SSH into server and run setup
ssh user@your-server
sudo /tmp/setup-server.sh
```

### 3. Deploy Application

#### Option A: Docker Deployment (Recommended)
```bash
# Deploy using Docker
./deploy.sh docker
```

#### Option B: Traditional PM2 Deployment
```bash
# Deploy using PM2
./deploy.sh traditional
```

## Deployment Methods

### Docker Deployment
**Pros:**
- Consistent environment across development and production
- Easy to scale and update
- Includes all dependencies
- Better isolation

**Files Used:**
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Multi-container orchestration
- `.dockerignore` - Files to exclude from container

**Commands:**
```bash
# Start application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Rebuild after changes
docker-compose build --no-cache
docker-compose up -d
```

### Traditional PM2 Deployment
**Pros:**
- Lower resource usage
- Direct access to Node.js process
- Simpler for small deployments

**Files Used:**
- `ecosystem.config.js` - PM2 configuration
- `nginx.conf` - Reverse proxy configuration

**Commands:**
```bash
# Start application
pm2 start ecosystem.config.js --env production

# View logs
pm2 logs buildingscience-millionaire

# Restart application
pm2 restart buildingscience-millionaire

# Stop application
pm2 stop buildingscience-millionaire
```

## Configuration Files

### Environment Variables (`.env.production`)
Critical settings that must be configured:
- `DATABASE_URL` - Database connection string
- `OPENAI_API_KEY` - OpenAI API key for TTS
- `NEXT_PUBLIC_APP_URL` - Your domain URL
- `NEXTAUTH_SECRET` - Random 32-character string

### Database Options

#### SQLite (Simple)
```env
DATABASE_URL="file:./data/prod.db"
```
- Easy to setup
- Good for small deployments
- Regular backups recommended

#### PostgreSQL (Scalable)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
```
- Better performance
- Handles concurrent users better
- More complex setup

### SSL/HTTPS Setup
```bash
# Install certificate (after DNS is configured)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Server Management

### Monitoring
```bash
# Check application status
pm2 status
# or
docker-compose ps

# View real-time logs
pm2 logs --lines 100
# or
docker-compose logs -f --tail=100

# System resources
htop

# Nginx access logs
tail -f /var/log/nginx/access.log
```

### Backups
```bash
# Manual backup
./backup.sh

# Schedule automatic backups (add to crontab)
crontab -e
# Add: 0 2 * * * /var/www/buildingscience-millionaire/backup.sh
```

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
npm run build
./deploy.sh [docker|traditional]
```

## Troubleshooting

### Application Won't Start
1. Check logs: `pm2 logs` or `docker-compose logs`
2. Verify environment variables: `cat .env`
3. Check port availability: `sudo lsof -i :3000`
4. Verify database connection: `npx prisma db push`

### Database Issues
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Run migrations
npx prisma migrate deploy

# Import questions
npx tsx scripts/import-all-questions.ts
```

### High Memory Usage
```bash
# Restart application
pm2 restart buildingscience-millionaire
# or
docker-compose restart

# Check memory usage
free -h
pm2 monit
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates
```

## Security Checklist
- [ ] Change default database passwords
- [ ] Configure firewall (ufw)
- [ ] Setup fail2ban
- [ ] Enable SSL/HTTPS
- [ ] Secure environment variables (proper permissions)
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Setup monitoring and alerts
- [ ] Configure backup strategy
- [ ] Limit SSH access (key-only authentication)
- [ ] Review Nginx security headers

## Performance Optimization

### Next.js Optimizations
- Standalone output mode enabled
- Image optimization configured
- Static files cached
- API routes optimized

### Database Optimizations
```bash
# For PostgreSQL
psql -U postgres -d buildingscience_millionaire
VACUUM ANALYZE;
REINDEX DATABASE buildingscience_millionaire;
```

### Nginx Caching
- Static assets cached for 1 year
- API responses cached for 60 seconds (configurable)

## Scaling Considerations

### Horizontal Scaling (Multiple Servers)
1. Use PostgreSQL instead of SQLite
2. Configure load balancer (nginx upstream)
3. Share sessions (Redis)
4. Centralized logging

### Vertical Scaling (Bigger Server)
1. Increase PM2 instances: `pm2 scale buildingscience-millionaire 4`
2. Tune Node.js memory: `--max-old-space-size=4096`
3. Optimize database queries

## Support

### Logs Location
- Application: `/var/log/buildingscience-millionaire/`
- Nginx: `/var/log/nginx/`
- PM2: `~/.pm2/logs/`
- Docker: `docker-compose logs`

### Common Commands Reference
```bash
# Check Node.js version
node -v

# Check PM2 status
pm2 status

# Check Docker status
docker ps

# Check disk space
df -h

# Check memory
free -h

# Check listening ports
sudo netstat -tlnp

# Test application
curl http://localhost:3000

# Check database
npx prisma studio
```

## Contact
For issues or questions, create an issue in the repository or contact the development team.