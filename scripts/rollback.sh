#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Restaurant Management - Rollback${NC}"
echo -e "${GREEN}=================================================${NC}"

# Configuration
APP_DIR="/opt/restaurant"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/mnt/volume/backups/postgres"

cd "$APP_DIR"

# Check if backup file is provided for database rollback
if [ -n "$1" ]; then
    echo -e "${YELLOW}Database rollback requested${NC}"
    echo "Backup file: $1"
    
    if [ -f "$1" ]; then
        echo -e "${YELLOW}Restoring database from backup...${NC}"
        ./scripts/restore-db.sh "$1"
    else
        echo -e "${RED}Error: Backup file not found: $1${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}Current deployment:${NC}"
docker compose -f "$COMPOSE_FILE" ps

echo -e "${YELLOW}Stopping current containers...${NC}"
docker compose -f "$COMPOSE_FILE" down

echo -e "${YELLOW}Checking out previous commit...${NC}"
CURRENT_COMMIT=$(git rev-parse HEAD)
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

echo "Current commit: $CURRENT_COMMIT"
echo "Rolling back to: $PREVIOUS_COMMIT"

read -p "Confirm rollback to previous commit? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

git checkout "$PREVIOUS_COMMIT"

echo -e "${YELLOW}Starting containers with previous version...${NC}"
docker compose -f "$COMPOSE_FILE" up -d

echo -e "${YELLOW}Waiting for containers to be healthy...${NC}"
sleep 30

if curl -f http://localhost:3000/health > /dev/null 2>&1 && \
   curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Rollback successful${NC}"
    echo -e "${GREEN}Application is running on previous version${NC}"
else
    echo -e "${RED}✗ Warning: Health check failed after rollback${NC}"
    echo "Please check logs: docker compose logs"
fi

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}✓ Rollback completed${NC}"
echo "Rolled back from: $(git rev-parse --short $CURRENT_COMMIT)"
echo "Now running: $(git rev-parse --short HEAD)"
echo -e "${GREEN}=================================================${NC}"

echo -e "${YELLOW}To return to latest version, run:${NC}"
echo "git checkout main && ./scripts/deploy.sh"
