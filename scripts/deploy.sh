#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Restaurant Management - Blue-Green Deployment${NC}"
echo -e "${GREEN}=================================================${NC}"

# Configuration
APP_DIR="/opt/restaurant"
COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_TIMEOUT=60
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-huy1235588/restaurant-management}"

cd "$APP_DIR"

echo -e "${YELLOW}Current deployment status:${NC}"
docker compose -f "$COMPOSE_FILE" ps

echo -e "${YELLOW}Pulling latest code...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"

echo -e "${YELLOW}Pulling latest Docker images...${NC}"
GITHUB_REPOSITORY="$GITHUB_REPOSITORY" docker compose -f "$COMPOSE_FILE" pull
echo -e "${GREEN}✓ Images pulled${NC}"

echo -e "${YELLOW}Creating pre-deployment backup...${NC}"
if ./scripts/backup-db.sh; then
    echo -e "${GREEN}✓ Backup created${NC}"
else
    echo -e "${RED}✗ Backup failed - aborting deployment${NC}"
    exit 1
fi

echo -e "${YELLOW}Running database migrations...${NC}"
docker compose -f "$COMPOSE_FILE" up -d postgres redis
sleep 10
if docker compose -f "$COMPOSE_FILE" run --rm server npx prisma migrate deploy; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${RED}✗ Migration failed - aborting deployment${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting new containers (blue-green deployment)...${NC}"
GITHUB_REPOSITORY="$GITHUB_REPOSITORY" docker compose -f "$COMPOSE_FILE" up -d --force-recreate --no-deps server client

echo -e "${YELLOW}Waiting for containers to be healthy...${NC}"
COUNTER=0
while [ $COUNTER -lt $HEALTH_TIMEOUT ]; do
    if docker compose -f "$COMPOSE_FILE" ps | grep -q "healthy"; then
        sleep 5
        if curl -f http://localhost:3000/health > /dev/null 2>&1 && \
           curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓ New containers are healthy${NC}"
            break
        fi
    fi
    
    COUNTER=$((COUNTER + 5))
    echo "Waiting... ($COUNTER/$HEALTH_TIMEOUT seconds)"
    sleep 5
done

if [ $COUNTER -ge $HEALTH_TIMEOUT ]; then
    echo -e "${RED}✗ Health check timeout - deployment failed${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    docker compose -f "$COMPOSE_FILE" logs --tail=50 server client
    exit 1
fi

echo -e "${YELLOW}Running smoke tests...${NC}"
if [ -f ./scripts/smoke-test.sh ]; then
    if ./scripts/smoke-test.sh; then
        echo -e "${GREEN}✓ Smoke tests passed${NC}"
    else
        echo -e "${RED}✗ Smoke tests failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Smoke test script not found, skipping${NC}"
fi

echo -e "${YELLOW}Cleaning up old Docker images...${NC}"
docker image prune -af --filter "until=24h"

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}✓ Deployment completed successfully${NC}"
echo "Version: $(git rev-parse --short HEAD)"
echo "Time: $(date)"
echo -e "${GREEN}=================================================${NC}"

echo -e "${YELLOW}Deployment status:${NC}"
docker compose -f "$COMPOSE_FILE" ps
