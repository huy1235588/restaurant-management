#!/bin/bash
# Backup PostgreSQL Database
# Restaurant Management System

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}====================================${NC}"
echo -e "${CYAN} Database Backup${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""

# Configuration
CONTAINER_NAME="restaurant_postgres_dev"
DB_USER="${POSTGRES_USER:-restaurant_admin}"
DB_NAME="${POSTGRES_DB:-restaurant_db}"
BACKUP_DIR="$(dirname "$0")/../../backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if container is running
echo -e "${YELLOW}Checking PostgreSQL container...${NC}"
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}✗ PostgreSQL container is not running${NC}"
    echo -e "${YELLOW}  Start it with: docker-compose -f deploy/docker-compose.yml up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL container is running${NC}"

# Create backup
echo ""
echo -e "${YELLOW}Creating backup...${NC}"
echo -e "  Database: ${CYAN}$DB_NAME${NC}"
echo -e "  User:     ${CYAN}$DB_USER${NC}"
echo -e "  File:     ${CYAN}$BACKUP_FILE${NC}"
echo ""

docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Compress backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo -e "${GREEN}✓ Backup created successfully${NC}"
    echo -e "  File: ${CYAN}$BACKUP_FILE${NC}"
    echo -e "  Size: ${CYAN}$FILE_SIZE${NC}"
    echo ""
    
    # List recent backups
    echo -e "${YELLOW}Recent backups:${NC}"
    ls -lht "$BACKUP_DIR" | head -n 6
    
else
    echo -e "${RED}✗ Backup failed${NC}"
    rm -f "$BACKUP_FILE"
    exit 1
fi

echo ""
echo -e "${CYAN}====================================${NC}"
echo -e "${GREEN} Backup Complete!${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""
