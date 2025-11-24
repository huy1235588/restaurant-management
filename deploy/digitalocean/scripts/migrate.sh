#!/bin/bash

################################################################################
# Safe Database Migration Script
# 
# Run Prisma migrations safely before application startup
# Usage: ./migrate.sh
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}===${NC} $1 ${BLUE}===${NC}\n"
}

# Configuration
APP_DIR="${APP_DIR:-/opt/restaurant-management}"
DEPLOY_DIR="$APP_DIR/deploy"
LOG_FILE="${LOG_FILE:-$APP_DIR/logs/migrate_$(date +%Y%m%d_%H%M%S).log}"

# Create logs directory
mkdir -p "$(dirname "$LOG_FILE")"

log_step "Database Migration - Restaurant Management System"
log_info "Timestamp: $(date)"
log_info "Log file: $LOG_FILE"

################################################################################
# Load Environment
################################################################################

log_step "Loading environment configuration"

if [ ! -f "$DEPLOY_DIR/.env" ]; then
    log_error ".env file not found at $DEPLOY_DIR/.env"
    exit 1
fi

# Export environment variables (filter out comments and empty lines)
export $(cat "$DEPLOY_DIR/.env" | grep -v '^#' | grep -v '^$' | xargs)

log_info "✓ Environment loaded"
log_info "Database: ${POSTGRES_DB}"
log_info "Database User: ${POSTGRES_USER}"

################################################################################
# Validate Database Connection
################################################################################

log_step "Validating database connection"

# Build DATABASE_URL
DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"

# Check if server container exists and is running
if ! docker ps | grep -q "restaurant_server_prod"; then
    log_error "Server container 'restaurant_server_prod' is not running"
    log_error "Start containers first: docker compose -f docker-compose.prod.yml up -d"
    exit 1
fi

log_info "✓ Server container is running"

# Check if database is healthy
log_info "Checking database connectivity..."
if docker exec restaurant_postgres_prod \
    psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 1;" &> /dev/null; then
    log_info "✓ Database is accessible"
else
    log_warn "Database may not be ready yet, waiting..."
    sleep 5
fi

################################################################################
# Run Migrations
################################################################################

log_step "Running Prisma migrations"

log_info "Executing: prisma migrate deploy"
log_info "This will run all pending migrations..."

if docker exec \
    -e DATABASE_URL="$DB_URL" \
    restaurant_server_prod \
    npx prisma migrate deploy --schema prisma/schema.prisma 2>&1 | tee -a "$LOG_FILE"; then
    log_info "✓ Database migrations completed successfully"
    exit 0
else
    log_error "✗ Database migrations failed"
    log_error "Checking server logs for details..."
    
    docker logs restaurant_server_prod | tail -30 | tee -a "$LOG_FILE"
    
    log_error ""
    log_error "Migration failed. Possible causes:"
    log_error "  - Database connection string is incorrect"
    log_error "  - Database is not accessible from container"
    log_error "  - Schema migration has syntax errors"
    log_error ""
    log_error "Check logs above and retry after fixing issues"
    
    exit 1
fi
