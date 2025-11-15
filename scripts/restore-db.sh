#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Restaurant Management - Database Restore${NC}"
echo -e "${GREEN}=================================================${NC}"

# Configuration
BACKUP_DIR="/mnt/volume/backups/postgres"
POSTGRES_CONTAINER="restaurant_postgres"
POSTGRES_USER="${POSTGRES_USER:-restaurant_admin}"
POSTGRES_DB="${POSTGRES_DB:-restaurant_db}"
COMPOSE_FILE="/opt/restaurant/docker-compose.prod.yml"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo ""
    echo "Usage: $0 <backup-file>"
    echo ""
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Backup file: $BACKUP_FILE${NC}"
echo -e "${YELLOW}Size: $(du -h "$BACKUP_FILE" | cut -f1)${NC}"
echo ""

# Confirm restore
read -p "Are you sure you want to restore this backup? This will overwrite the current database. (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

echo -e "${YELLOW}Creating safety backup of current database...${NC}"
SAFETY_BACKUP="$BACKUP_DIR/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
if docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$SAFETY_BACKUP"; then
    echo -e "${GREEN}✓ Safety backup created: $(basename "$SAFETY_BACKUP")${NC}"
else
    echo -e "${RED}✗ Failed to create safety backup${NC}"
    exit 1
fi

echo -e "${YELLOW}Stopping application containers...${NC}"
cd /opt/restaurant
if docker compose -f "$COMPOSE_FILE" stop server client; then
    echo -e "${GREEN}✓ Application containers stopped${NC}"
else
    echo -e "${RED}✗ Failed to stop containers${NC}"
    exit 1
fi

echo -e "${YELLOW}Restoring database...${NC}"
if gunzip -c "$BACKUP_FILE" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
else
    echo -e "${RED}✗ Database restore failed${NC}"
    echo -e "${YELLOW}Attempting to restore safety backup...${NC}"
    gunzip -c "$SAFETY_BACKUP" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
    exit 1
fi

echo -e "${YELLOW}Restarting application containers...${NC}"
if docker compose -f "$COMPOSE_FILE" start server client; then
    echo -e "${GREEN}✓ Application containers restarted${NC}"
else
    echo -e "${RED}✗ Failed to restart containers${NC}"
    exit 1
fi

echo -e "${YELLOW}Waiting for application to be healthy...${NC}"
sleep 10

# Check health
if curl -f http://localhost:3000/health > /dev/null 2>&1 && curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Application is healthy${NC}"
else
    echo -e "${RED}✗ Warning: Application health check failed${NC}"
    echo "Please check logs: docker compose logs"
fi

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}✓ Database restore completed${NC}"
echo "Restored from: $(basename "$BACKUP_FILE")"
echo "Safety backup: $(basename "$SAFETY_BACKUP")"
echo -e "${GREEN}=================================================${NC}"
