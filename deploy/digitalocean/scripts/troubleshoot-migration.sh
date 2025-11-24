#!/bin/bash

################################################################################
# Troubleshooting Guide - Database Migrations
# 
# This script helps diagnose and fix common migration issues
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
step() { echo -e "\n${BLUE}===${NC} $1 ${BLUE}===${NC}\n"; }

# Configuration
APP_DIR="${APP_DIR:-/opt/restaurant-management}"
DEPLOY_DIR="$APP_DIR/deploy"

step "Database Migration Troubleshooter"

################################################################################
# Check 1: Environment File
################################################################################

step "Check 1: Environment Configuration"

if [ ! -f "$DEPLOY_DIR/.env" ]; then
    error ".env file not found at $DEPLOY_DIR/.env"
    exit 1
fi

info "✓ .env file found"

# Verify required variables
for var in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB POSTGRES_PORT; do
    if grep -q "^$var=" "$DEPLOY_DIR/.env"; then
        VALUE=$(grep "^$var=" "$DEPLOY_DIR/.env" | cut -d'=' -f2-)
        info "✓ $var is set"
    else
        error "$var is not set in .env"
        exit 1
    fi
done

################################################################################
# Check 2: Docker Containers
################################################################################

step "Check 2: Docker Containers Status"

# Check postgres container
if docker ps | grep -q "restaurant_postgres_prod"; then
    info "✓ PostgreSQL container is running"
else
    error "✗ PostgreSQL container is not running"
    warn "Start containers: docker compose -f docker-compose.prod.yml up -d"
    exit 1
fi

# Check server container
if docker ps | grep -q "restaurant_server_prod"; then
    info "✓ Server container is running"
else
    error "✗ Server container is not running"
    warn "Start containers: docker compose -f docker-compose.prod.yml up -d"
    exit 1
fi

################################################################################
# Check 3: Database Connectivity
################################################################################

step "Check 3: Database Connectivity"

# Load environment
export $(cat "$DEPLOY_DIR/.env" | grep -v '^#' | grep -v '^$' | xargs)

# Test database connection
if docker exec restaurant_postgres_prod \
    psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 1;" &> /dev/null; then
    info "✓ Database is accessible"
else
    error "✗ Cannot connect to database"
    warn "Waiting for database to be ready..."
    sleep 10
    
    if docker exec restaurant_postgres_prod \
        psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 1;" &> /dev/null; then
        info "✓ Database is now accessible"
    else
        error "Database still not accessible after waiting"
        error "Check PostgreSQL logs:"
        docker logs restaurant_postgres_prod | tail -20
        exit 1
    fi
fi

################################################################################
# Check 4: Prisma Configuration
################################################################################

step "Check 4: Prisma Configuration"

# Check if prisma schema exists in server container
if docker exec restaurant_server_prod test -f prisma/schema.prisma; then
    info "✓ Prisma schema found in container"
else
    error "✗ Prisma schema not found in container"
    exit 1
fi

# Check if node_modules/prisma exists
if docker exec restaurant_server_prod test -d node_modules/.pnpm/prisma*; then
    info "✓ Prisma CLI available in container"
else
    warn "Prisma CLI might not be installed, will attempt reinstall..."
fi

################################################################################
# Check 5: Run Test Migration
################################################################################

step "Check 5: Test Migration"

DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"

info "Running test migration status check..."
info "Database URL: postgresql://${POSTGRES_USER}:***@postgres:5432/${POSTGRES_DB}"

if docker exec \
    -e DATABASE_URL="$DB_URL" \
    restaurant_server_prod \
    npx prisma migrate status --schema prisma/schema.prisma 2>&1; then
    info "✓ Prisma can access the schema"
else
    error "✗ Prisma encountered an issue"
    warn "This might be due to:"
    warn "  - Incorrect DATABASE_URL format"
    warn "  - Network connectivity issues"
    warn "  - Prisma client not generated"
fi

################################################################################
# Summary & Recommendations
################################################################################

step "Troubleshooting Summary"

info "All basic checks completed."
info ""
info "To fix migration issues:"
info ""
info "1. If database not accessible:"
info "   docker compose -f docker-compose.prod.yml logs postgres"
info ""
info "2. If prisma issue:"
info "   docker exec restaurant_server_prod npm install"
info "   docker exec -e DATABASE_URL='$DB_URL' restaurant_server_prod npx prisma generate"
info ""
info "3. Run migrations:"
info "   bash deploy/digitalocean/scripts/migrate.sh"
info ""
info "4. Check container logs:"
info "   docker logs -f restaurant_server_prod"
info ""

step "Done!"
info "For more help, check: deploy/digitalocean/DEPLOYMENT_GUIDE_VI.md"
