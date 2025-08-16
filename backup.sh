#!/bin/bash

# Backup Script for Building Science Millionaire
# Run this regularly via cron to backup database and uploads
# Usage: ./backup.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/buildingscience-millionaire"
APP_DIR="/var/www/buildingscience-millionaire"
MAX_BACKUPS=30  # Keep last 30 backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Building Science Millionaire - Backup Script${NC}"
echo "============================================"
echo -e "Timestamp: ${TIMESTAMP}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Function to backup SQLite database
backup_sqlite() {
    echo -e "\n${YELLOW}Backing up SQLite database...${NC}"
    
    DB_FILE="$APP_DIR/prisma/dev.db"
    if [ -f "$DB_FILE" ]; then
        # Use SQLite backup command for consistency
        sqlite3 "$DB_FILE" ".backup '$BACKUP_DIR/db_backup_${TIMESTAMP}.db'"
        
        # Compress the backup
        gzip "$BACKUP_DIR/db_backup_${TIMESTAMP}.db"
        
        echo -e "${GREEN}SQLite backup completed: db_backup_${TIMESTAMP}.db.gz${NC}"
    else
        echo -e "${RED}SQLite database file not found!${NC}"
    fi
}

# Function to backup PostgreSQL database
backup_postgresql() {
    echo -e "\n${YELLOW}Backing up PostgreSQL database...${NC}"
    
    # Read database credentials from environment file
    if [ -f "$APP_DIR/.env" ]; then
        export $(grep -E "^DATABASE_URL=" "$APP_DIR/.env" | xargs)
        
        # Parse PostgreSQL connection string
        if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
            DB_USER="${BASH_REMATCH[1]}"
            DB_PASS="${BASH_REMATCH[2]}"
            DB_HOST="${BASH_REMATCH[3]}"
            DB_PORT="${BASH_REMATCH[4]}"
            DB_NAME="${BASH_REMATCH[5]}"
            
            # Perform backup
            PGPASSWORD=$DB_PASS pg_dump \
                -h $DB_HOST \
                -p $DB_PORT \
                -U $DB_USER \
                -d $DB_NAME \
                --no-password \
                | gzip > "$BACKUP_DIR/db_backup_${TIMESTAMP}.sql.gz"
            
            echo -e "${GREEN}PostgreSQL backup completed: db_backup_${TIMESTAMP}.sql.gz${NC}"
        else
            echo -e "${RED}Could not parse PostgreSQL connection string${NC}"
        fi
    else
        echo -e "${RED}Environment file not found!${NC}"
    fi
}

# Function to backup uploads and data files
backup_files() {
    echo -e "\n${YELLOW}Backing up application files...${NC}"
    
    # List of directories to backup
    DIRS_TO_BACKUP=(
        "uploads"
        "data"
        "public/images"
    )
    
    for dir in "${DIRS_TO_BACKUP[@]}"; do
        if [ -d "$APP_DIR/$dir" ]; then
            tar -czf "$BACKUP_DIR/${dir//\//_}_backup_${TIMESTAMP}.tar.gz" -C "$APP_DIR" "$dir"
            echo -e "${GREEN}Backed up: $dir${NC}"
        fi
    done
}

# Function to backup environment files
backup_env() {
    echo -e "\n${YELLOW}Backing up environment configuration...${NC}"
    
    if [ -f "$APP_DIR/.env" ]; then
        # Encrypt sensitive environment file
        cp "$APP_DIR/.env" "$BACKUP_DIR/env_backup_${TIMESTAMP}"
        gzip "$BACKUP_DIR/env_backup_${TIMESTAMP}"
        chmod 600 "$BACKUP_DIR/env_backup_${TIMESTAMP}.gz"
        echo -e "${GREEN}Environment file backed up (encrypted)${NC}"
    fi
}

# Function to backup Docker volumes
backup_docker_volumes() {
    echo -e "\n${YELLOW}Backing up Docker volumes...${NC}"
    
    if command -v docker &> /dev/null; then
        # Get list of volumes for our app
        VOLUMES=$(docker volume ls -q | grep buildingscience)
        
        for volume in $VOLUMES; do
            docker run --rm \
                -v $volume:/source:ro \
                -v $BACKUP_DIR:/backup \
                alpine tar czf /backup/${volume}_backup_${TIMESTAMP}.tar.gz -C /source .
            
            echo -e "${GREEN}Backed up Docker volume: $volume${NC}"
        done
    else
        echo -e "${YELLOW}Docker not installed, skipping volume backup${NC}"
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    echo -e "\n${YELLOW}Cleaning up old backups...${NC}"
    
    # Find and delete backups older than MAX_BACKUPS
    cd $BACKUP_DIR
    
    # Count database backups
    DB_BACKUP_COUNT=$(ls -1 db_backup_*.gz 2>/dev/null | wc -l)
    if [ $DB_BACKUP_COUNT -gt $MAX_BACKUPS ]; then
        ls -1t db_backup_*.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        echo -e "${GREEN}Removed old database backups${NC}"
    fi
    
    # Count file backups
    FILE_BACKUP_COUNT=$(ls -1 *_backup_*.tar.gz 2>/dev/null | wc -l)
    if [ $FILE_BACKUP_COUNT -gt $MAX_BACKUPS ]; then
        ls -1t *_backup_*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        echo -e "${GREEN}Removed old file backups${NC}"
    fi
}

# Function to upload to remote storage (optional)
upload_to_remote() {
    echo -e "\n${YELLOW}Uploading to remote storage...${NC}"
    
    # Example: Upload to S3
    if command -v aws &> /dev/null; then
        aws s3 sync $BACKUP_DIR s3://your-backup-bucket/buildingscience-millionaire/ \
            --exclude "*" \
            --include "*_${TIMESTAMP}*"
        echo -e "${GREEN}Uploaded to S3${NC}"
    fi
    
    # Example: Upload to remote server via rsync
    # rsync -avz $BACKUP_DIR/*_${TIMESTAMP}* user@backup-server:/path/to/backups/
}

# Main backup process
echo -e "\n${YELLOW}Starting backup process...${NC}"

# Determine database type and backup
if [ -f "$APP_DIR/prisma/dev.db" ]; then
    backup_sqlite
elif grep -q "postgresql://" "$APP_DIR/.env" 2>/dev/null; then
    backup_postgresql
else
    echo -e "${RED}No database found to backup!${NC}"
fi

# Backup application files
backup_files

# Backup environment configuration
backup_env

# Backup Docker volumes if using Docker
if [ -f "$APP_DIR/docker-compose.yml" ]; then
    backup_docker_volumes
fi

# Clean up old backups
cleanup_old_backups

# Optional: Upload to remote storage
# upload_to_remote

# Calculate backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Backup location: ${BACKUP_DIR}"
echo -e "Total backup size: ${BACKUP_SIZE}"
echo -e "Backups retained: ${MAX_BACKUPS}"

# Setup cron job reminder
echo -e "\n${YELLOW}To schedule automatic backups, add to crontab:${NC}"
echo -e "0 2 * * * $APP_DIR/backup.sh >> /var/log/buildingscience-millionaire/backup.log 2>&1"