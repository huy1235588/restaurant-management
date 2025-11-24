#!/bin/bash

################################################################################
# Rebuild Docker Images - Fix Prisma Client Runtime Error
# 
# This script rebuilds the server image to fix:
# Error: Cannot find module '@prisma/client-runtime-utils'
#
# Usage: ./rebuild-images.sh
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}===${NC} $1 ${BLUE}===${NC}\n"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
APP_DIR="/opt/restaurant-management"
DEPLOY_DIR="$APP_DIR/deploy"

log_step "Rebuilding Docker Images - Fix Prisma Runtime Error"

################################################################################
# Pre-flight Checks
################################################################################

log_step "Pre-flight Checks"

if [ ! -d "$APP_DIR" ]; then
    log_error "Application directory not found: $APP_DIR"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker is not running"
    exit 1
fi

log_info "✓ All checks passed"

################################################################################
# Stop Current Containers
################################################################################

log_step "Stopping Current Containers"

cd "$DEPLOY_DIR"

log_info "Stopping containers gracefully..."
docker compose -f docker-compose.prod.yml stop || true

log_info "✓ Containers stopped"

################################################################################
# Rebuild Images
################################################################################

log_step "Rebuilding Docker Images"

log_info "This may take 5-10 minutes..."
log_info "Building: server, client, postgres, redis..."

if docker compose -f docker-compose.prod.yml build --no-cache --parallel; then
    log_info "✓ Docker images rebuilt successfully"
else
    log_error "Docker build failed"
    exit 1
fi

################################################################################
# Start Containers
################################################################################

log_step "Starting Containers"

log_info "Starting containers with new images..."
if docker compose -f docker-compose.prod.yml up -d; then
    log_info "✓ Containers started"
else
    log_error "Failed to start containers"
    exit 1
fi

################################################################################
# Health Checks
################################################################################

log_step "Waiting for Services to Be Healthy"

log_info "Waiting for database (30s timeout)..."
sleep 10

if docker exec restaurant_postgres_prod \
    psql -U restaurant_admin -d restaurant_db -c "SELECT 1;" &> /dev/null; then
    log_info "✓ Database is ready"
else
    log_warn "Database not ready yet, continuing anyway..."
fi

log_info "Waiting for server to start (60s timeout)..."
sleep 15

if docker ps | grep -q "restaurant_server_prod"; then
    log_info "✓ Server container is running"
    
    # Check if server is responding
    if curl -f http://localhost:5000/api/v1/health &> /dev/null; then
        log_info "✓ Server health check passed"
    else
        log_warn "Server not responding yet, may need more time to start"
    fi
else
    log_error "Server container is not running"
    log_error "Checking server logs:"
    docker logs restaurant_server_prod | tail -30
    exit 1
fi

################################################################################
# Final Status
################################################################################

log_step "Rebuild Complete!"

log_info "All containers rebuilt and running"
log_info ""
log_info "Next steps:"
log_info "1. Check server logs: docker logs -f restaurant_server_prod"
log_info "2. Run migrations: bash deploy/digitalocean/scripts/migrate.sh"
log_info "3. Verify deployment: bash deploy/digitalocean/scripts/health-check.sh"
log_info ""

log_step "Done!"
