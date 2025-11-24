#!/bin/bash

################################################################################
# Backup Script for Restaurant Management System
# 
# This script creates PostgreSQL database backups
# 
# Usage: ./backup.sh
################################################################################

set -e  # Exit on any error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APP_DIR="/opt/restaurant-management"
BACKUP_DIR="$APP_DIR/backups"
LOG_FILE="$APP_DIR/logs/backup.log"
BACKUP_RETENTION_DAYS=7

# Database configuration (from .env)
ENV_FILE="$APP_DIR/deploy/.env"

# Load database credentials from .env
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | grep 'POSTGRES_USER\|POSTGRES_PASSWORD\|POSTGRES_DB' | xargs)
else
    echo -e "${RED}[ERROR]${NC} .env file not found: $ENV_FILE"
    exit 1
fi

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"
mkdir -p "$APP_DIR/logs"

log "=== Database Backup Started ==="

# Generate backup filename
BACKUP_FILE="db_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Check if PostgreSQL container is running
if ! docker ps | grep -q "restaurant_postgres_prod"; then
    log_error "PostgreSQL container is not running"
    exit 1
fi

log "Creating backup: $BACKUP_FILE"

# Create backup
if docker exec restaurant_postgres_prod pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_PATH"; then
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    log "✓ Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
    log_error "Backup creation failed"
    exit 1
fi

# Verify backup file
if [ ! -f "$BACKUP_PATH" ] || [ ! -s "$BACKUP_PATH" ]; then
    log_error "Backup file is empty or does not exist"
    exit 1
fi

# Calculate checksum
CHECKSUM=$(sha256sum "$BACKUP_PATH" | awk '{print $1}')
log "Backup checksum (SHA256): $CHECKSUM"

# Clean old backups
log "Cleaning backups older than $BACKUP_RETENTION_DAYS days..."

DELETED_COUNT=0
while IFS= read -r old_backup; do
    rm -f "$old_backup"
    DELETED_COUNT=$((DELETED_COUNT + 1))
    log "Deleted old backup: $(basename "$old_backup")"
done < <(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS)

if [ $DELETED_COUNT -eq 0 ]; then
    log "No old backups to delete"
else
    log "Deleted $DELETED_COUNT old backup(s)"
fi

# List current backups
log "Current backups in $BACKUP_DIR:"
ls -lh "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | awk '{print $9, $5}' | tee -a "$LOG_FILE" || log "No backups found"

# Show backup directory size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Total backup directory size: $TOTAL_SIZE"

log "=== Backup Completed Successfully ==="

# Optional: Upload to DigitalOcean Spaces (if configured)
# Uncomment and configure if needed:
#
# if [ -n "$SPACES_KEY" ] && [ -n "$SPACES_SECRET" ]; then
#     log "Uploading to DigitalOcean Spaces..."
#     s3cmd put "$BACKUP_PATH" s3://your-bucket/backups/
#     log "✓ Uploaded to Spaces"
# fi

exit 0
