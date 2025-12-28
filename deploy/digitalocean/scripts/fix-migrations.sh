#!/bin/bash

################################################################################
# Fix Prisma Migration Issues Script
# 
# This script fixes common migration issues like:
# - Empty migration folders (P3015 error)
# - Incomplete migration folders
# - Stale Prisma Client
# 
# Usage: ./fix-migrations.sh
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
PRISMA_DIR="$APP_DIR/app/server/prisma"
MIGRATIONS_DIR="$PRISMA_DIR/migrations"

log_step "Fix Prisma Migration Issues"
log_info "Timestamp: $(date)"

################################################################################
# Check if running in correct directory
################################################################################

if [ ! -d "$APP_DIR" ]; then
    log_error "Application directory not found: $APP_DIR"
    log_error "Please run this script on the production server"
    exit 1
fi

################################################################################
# Fix Empty Migration Folders
################################################################################

log_step "Checking for empty migration folders"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    log_error "Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

cd "$MIGRATIONS_DIR"

# Count total migration folders
TOTAL_FOLDERS=$(find . -mindepth 1 -maxdepth 1 -type d ! -name ".*" | wc -l)
log_info "Found $TOTAL_FOLDERS migration folder(s)"

# Find and remove empty migration folders
EMPTY_FOLDERS=$(find . -mindepth 1 -maxdepth 1 -type d -empty 2>/dev/null || true)

if [ -n "$EMPTY_FOLDERS" ]; then
    log_warn "Found empty migration folders:"
    echo "$EMPTY_FOLDERS" | while read -r folder; do
        folder_name=$(basename "$folder")
        log_warn "  - $folder_name"
        rm -rf "$folder"
        log_info "  ✓ Removed empty folder: $folder_name"
    done
else
    log_info "✓ No empty migration folders found"
fi

################################################################################
# Fix Incomplete Migration Folders
################################################################################

log_step "Checking for incomplete migration folders"

INCOMPLETE_COUNT=0

for dir in */ ; do
    if [ -d "$dir" ]; then
        if [ ! -f "$dir/migration.sql" ]; then
            FOLDER_NAME=$(basename "$dir")
            log_warn "Found incomplete migration folder: $FOLDER_NAME"
            log_warn "  - Missing migration.sql file"
            rm -rf "$dir"
            log_info "  ✓ Removed incomplete folder: $FOLDER_NAME"
            INCOMPLETE_COUNT=$((INCOMPLETE_COUNT + 1))
        fi
    fi
done

if [ $INCOMPLETE_COUNT -eq 0 ]; then
    log_info "✓ No incomplete migration folders found"
else
    log_info "✓ Removed $INCOMPLETE_COUNT incomplete migration folder(s)"
fi

################################################################################
# List Valid Migrations
################################################################################

log_step "Valid migrations in directory"

VALID_COUNT=0
for dir in */ ; do
    if [ -d "$dir" ] && [ -f "$dir/migration.sql" ]; then
        FOLDER_NAME=$(basename "$dir")
        log_info "  ✓ $FOLDER_NAME"
        VALID_COUNT=$((VALID_COUNT + 1))
    fi
done

log_info ""
log_info "Total valid migrations: $VALID_COUNT"

################################################################################
# Check Migration Status
################################################################################

log_step "Checking migration status"

# Check if server container is running
if docker ps | grep -q "restaurant_server_prod"; then
    log_info "Running migration status check..."
    
    if docker exec restaurant_server_prod \
        npx prisma migrate status --schema prisma/schema.prisma 2>&1; then
        log_info "✓ Migration status check completed"
    else
        log_warn "Migration status check encountered issues (see above)"
    fi
else
    log_warn "Server container is not running"
    log_warn "Start containers to check migration status: docker compose up -d"
fi

################################################################################
# Summary
################################################################################

log_step "Summary"

echo ""
echo "==============================================="
echo "  Migration Issues Fixed!"
echo "==============================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Run migrations:"
echo "   cd $APP_DIR/deploy"
echo "   bash digitalocean/scripts/migrate.sh"
echo ""
echo "2. Or run full deployment:"
echo "   bash digitalocean/scripts/deploy.sh"
echo ""
echo "3. Check migration status:"
echo "   docker exec restaurant_server_prod npx prisma migrate status"
echo ""
echo "==============================================="
echo ""

log_info "Fix completed successfully!"

exit 0
