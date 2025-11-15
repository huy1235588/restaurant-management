#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Restaurant Management - Database Backup${NC}"
echo -e "${GREEN}=================================================${NC}"

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/mnt/volume/backups/postgres"
POSTGRES_CONTAINER="restaurant_postgres"
POSTGRES_USER="${POSTGRES_USER:-restaurant_admin}"
POSTGRES_DB="${POSTGRES_DB:-restaurant_db}"
RETENTION_DAYS=14

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting database backup...${NC}"
echo "Date: $(date)"
echo "Container: $POSTGRES_CONTAINER"
echo "Database: $POSTGRES_DB"
echo "Backup directory: $BACKUP_DIR"

# Create backup
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"
if docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_FILE"; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup created successfully: backup_$DATE.sql.gz (${BACKUP_SIZE})${NC}"
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi

# Verify backup file exists and is not empty
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    echo -e "${GREEN}✓ Backup file verified${NC}"
else
    echo -e "${RED}✗ Backup file is missing or empty!${NC}"
    exit 1
fi

# Delete backups older than retention period
echo -e "${YELLOW}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Deleted ${DELETED_COUNT} old backup(s)${NC}"
else
    echo "No old backups to delete"
fi

# List current backups
echo -e "${YELLOW}Current backups:${NC}"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz | tail -n 5

# Summary
TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}✓ Backup completed successfully${NC}"
echo "Total backups: $TOTAL_BACKUPS"
echo "Total size: $TOTAL_SIZE"
echo -e "${GREEN}=================================================${NC}"
