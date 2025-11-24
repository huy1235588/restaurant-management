#!/bin/bash

################################################################################
# Restore Script for Restaurant Management System
# 
# This script restores PostgreSQL database from backup
# 
# Usage: ./restore.sh <backup-file>
# Example: ./restore.sh /opt/restaurant-management/backups/db_backup_20241125_030000.sql.gz
################################################################################

set -e  # Exit on any error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_DIR="/opt/restaurant-management"
DEPLOY_DIR="$APP_DIR/deploy"
LOG_FILE="$APP_DIR/logs/restore_$(date +%Y%m%d_%H%M%S).log"

# Database configuration
ENV_FILE="$DEPLOY_DIR/.env"

# Logging functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $1" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "\n${BLUE}===${NC} $1 ${BLUE}===${NC}\n" | tee -a "$LOG_FILE"
}

# Check arguments
if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file>"
    echo ""
    echo "Example:"
    echo "  $0 /opt/restaurant-management/backups/db_backup_20241125_030000.sql.gz"
    echo ""
    echo "Available backups:"
    ls -lh "$APP_DIR/backups"/db_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Load database credentials
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | grep 'POSTGRES_USER\|POSTGRES_PASSWORD\|POSTGRES_DB' | xargs)
else
    log_error ".env file not found: $ENV_FILE"
    exit 1
fi

# Create logs directory
mkdir -p "$APP_DIR/logs"

log_step "Database Restore Process"

log "Restore file: $BACKUP_FILE"
log "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
log "Target database: $POSTGRES_DB"

# Warning and confirmation
echo ""
echo -e "${RED}╔════════════════════════════════════════╗${NC}"
echo -e "${RED}║          ⚠️  WARNING  ⚠️               ║${NC}"
echo -e "${RED}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}This will:${NC}"
echo "  1. Stop the application"
echo "  2. Drop the current database"
echo "  3. Restore from backup"
echo "  4. Restart the application"
echo ""
echo -e "${RED}ALL CURRENT DATA WILL BE LOST!${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_warn "Restore cancelled by user"
    exit 0
fi

################################################################################
# Step 1: Create Emergency Backup
################################################################################

log_step "Creating emergency backup of current database"

EMERGENCY_BACKUP="$APP_DIR/backups/emergency_before_restore_$(date +%Y%m%d_%H%M%S).sql.gz"

if docker exec restaurant_postgres_prod pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$EMERGENCY_BACKUP"; then
    log "✓ Emergency backup created: $EMERGENCY_BACKUP"
    log "Size: $(du -h "$EMERGENCY_BACKUP" | cut -f1)"
else
    log_error "Emergency backup failed"
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        exit 1
    fi
fi

################################################################################
# Step 2: Stop Application Containers
################################################################################

log_step "Stopping application containers"

cd "$DEPLOY_DIR"

# Stop frontend and backend (keep database running)
log "Stopping frontend and backend..."
docker compose -f docker-compose.prod.yml stop client server || true

log "✓ Application containers stopped"

################################################################################
# Step 3: Drop and Recreate Database
################################################################################

log_step "Preparing database for restore"

# Drop all connections to database
log "Terminating active database connections..."
docker exec restaurant_postgres_prod psql -U "$POSTGRES_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" \
    || log_warn "Could not terminate connections"

# Drop database
log "Dropping database: $POSTGRES_DB"
docker exec restaurant_postgres_prod psql -U "$POSTGRES_USER" -d postgres -c \
    "DROP DATABASE IF EXISTS \"$POSTGRES_DB\";" \
    || { log_error "Failed to drop database"; exit 1; }

# Create fresh database
log "Creating fresh database: $POSTGRES_DB"
docker exec restaurant_postgres_prod psql -U "$POSTGRES_USER" -d postgres -c \
    "CREATE DATABASE \"$POSTGRES_DB\" OWNER \"$POSTGRES_USER\";" \
    || { log_error "Failed to create database"; exit 1; }

log "✓ Database recreated"

################################################################################
# Step 4: Restore from Backup
################################################################################

log_step "Restoring database from backup"

log "Decompressing and restoring backup..."
log "This may take several minutes..."

# Restore backup
if gunzip -c "$BACKUP_FILE" | docker exec -i restaurant_postgres_prod psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"; then
    log "✓ Database restored successfully"
else
    log_error "Database restore failed"
    log_error "Emergency backup available at: $EMERGENCY_BACKUP"
    exit 1
fi

################################################################################
# Step 5: Verify Restoration
################################################################################

log_step "Verifying database restoration"

# Count tables
TABLE_COUNT=$(docker exec restaurant_postgres_prod psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

log "Tables found: $TABLE_COUNT"

if [ "$TABLE_COUNT" -gt 0 ]; then
    log "✓ Database structure verified"
else
    log_error "No tables found in restored database"
    exit 1
fi

# Check for data (example: count users)
USER_COUNT=$(docker exec restaurant_postgres_prod psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | xargs || echo "0")

log "Users found: $USER_COUNT"

################################################################################
# Step 6: Run Migrations (if needed)
################################################################################

log_step "Running database migrations"

# Start server container temporarily to run migrations
log "Starting server container..."
docker compose -f docker-compose.prod.yml up -d server

# Wait for container
sleep 10

# Run migrations
log "Running Prisma migrations..."
if docker exec restaurant_server_prod npx prisma migrate deploy 2>&1 | tee -a "$LOG_FILE"; then
    log "✓ Migrations completed"
else
    log_warn "Migration warnings detected (may be normal if schema is up-to-date)"
fi

################################################################################
# Step 7: Restart All Services
################################################################################

log_step "Restarting all services"

# Restart all containers
log "Starting all services..."
docker compose -f docker-compose.prod.yml up -d

log "Waiting for services to be ready..."
sleep 15

# Check containers
RUNNING=$(docker compose -f docker-compose.prod.yml ps --status running | grep -c "running" || echo "0")
log "Running containers: $RUNNING"

if [ "$RUNNING" -ge 3 ]; then
    log "✓ Services restarted successfully"
else
    log_warn "Some services may not be running"
fi

################################################################################
# Step 8: Health Checks
################################################################################

log_step "Running health checks"

# Wait a bit more for services to be fully ready
sleep 10

# Check frontend
if curl -f http://localhost:3000/api/health &> /dev/null; then
    log "✓ Frontend is healthy"
else
    log_warn "✗ Frontend health check failed"
fi

# Check backend
if curl -f http://localhost:5000/api/v1/health &> /dev/null; then
    log "✓ Backend is healthy"
else
    log_warn "✗ Backend health check failed"
fi

# Check database connection from backend
if docker exec restaurant_server_prod npx prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
    log "✓ Database connection verified"
else
    log_warn "✗ Database connection check failed"
fi

################################################################################
# Display Summary
################################################################################

log_step "Restore Summary"

echo ""
echo "===============================================" | tee -a "$LOG_FILE"
echo "  Database Restore Completed!" | tee -a "$LOG_FILE"
echo "===============================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Restored from: $(basename "$BACKUP_FILE")" | tee -a "$LOG_FILE"
echo "Backup date: $(echo "$BACKUP_FILE" | grep -oP '\d{8}_\d{6}')" | tee -a "$LOG_FILE"
echo "Tables restored: $TABLE_COUNT" | tee -a "$LOG_FILE"
echo "Users restored: $USER_COUNT" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Emergency backup: $EMERGENCY_BACKUP" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "===============================================" | tee -a "$LOG_FILE"
echo "  Next Steps" | tee -a "$LOG_FILE"
echo "===============================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "1. Verify application functionality:" | tee -a "$LOG_FILE"
echo "   https://yourdomain.com" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "2. Test login and core features" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "3. If issues occur, you can restore from:" | tee -a "$LOG_FILE"
echo "   $EMERGENCY_BACKUP" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "===============================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

log "Restore completed successfully!"
log "Full log available at: $LOG_FILE"

exit 0
