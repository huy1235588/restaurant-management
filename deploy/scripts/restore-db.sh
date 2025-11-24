#!/bin/bash
# Restore PostgreSQL Database
# Restaurant Management System

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}====================================${NC}"
echo -e "${CYAN} Database Restore${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""

# Configuration
CONTAINER_NAME="restaurant_postgres_dev"
DB_USER="${POSTGRES_USER:-restaurant_admin}"
DB_NAME="${POSTGRES_DB:-restaurant_db}"
BACKUP_DIR="$(dirname "$0")/../../backups"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lht "$BACKUP_DIR" 2>/dev/null || echo -e "${RED}  No backups found${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  $0 <backup-file>"
    echo -e "  Example: $0 backups/backup_restaurant_db_20231125_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}✗ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Backup file: ${CYAN}$BACKUP_FILE${NC}"
echo ""

# Check if container is running
echo -e "${YELLOW}Checking PostgreSQL container...${NC}"
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}✗ PostgreSQL container is not running${NC}"
    echo -e "${YELLOW}  Start it with: docker-compose -f deploy/docker-compose.yml up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL container is running${NC}"

# Confirmation prompt
echo ""
echo -e "${RED}⚠️  WARNING: This will replace all data in the database!${NC}"
echo -e "  Database: ${CYAN}$DB_NAME${NC}"
echo -e "  User:     ${CYAN}$DB_USER${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [ "$REPLY" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Decompress if needed
TEMP_FILE=""
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}Decompressing backup...${NC}"
    TEMP_FILE="/tmp/restore_${DB_NAME}_$$.sql"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Drop existing connections
echo -e "${YELLOW}Dropping existing connections...${NC}"
docker exec -t "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();" > /dev/null 2>&1 || true

# Restore database
echo -e "${YELLOW}Restoring database...${NC}"
cat "$RESTORE_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
    
    # Clean up temp file
    if [ -n "$TEMP_FILE" ]; then
        rm -f "$TEMP_FILE"
    fi
    
    echo ""
    echo -e "${YELLOW}Running migrations to ensure schema is up to date...${NC}"
    
    # Navigate to server directory
    SERVER_DIR="$(dirname "$(dirname "$BACKUP_DIR")")/app/server"
    if [ -d "$SERVER_DIR" ] && command -v pnpm &> /dev/null; then
        cd "$SERVER_DIR"
        pnpm prisma migrate deploy
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Migrations completed${NC}"
        else
            echo -e "${YELLOW}⚠ Migrations failed - you may need to run them manually${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Could not run migrations automatically${NC}"
        echo -e "${YELLOW}  Run manually: cd app/server && pnpm prisma migrate deploy${NC}"
    fi
    
else
    echo -e "${RED}✗ Restore failed${NC}"
    
    # Clean up temp file
    if [ -n "$TEMP_FILE" ]; then
        rm -f "$TEMP_FILE"
    fi
    
    exit 1
fi

echo ""
echo -e "${CYAN}====================================${NC}"
echo -e "${GREEN} Restore Complete!${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""
