#!/bin/bash

################################################################################
# Deployment Script for Restaurant Management System
# 
# This script automates deployment to DigitalOcean VPS
# 
# Usage: ./deploy.sh [options]
# 
# Options:
#   --skip-backup    Skip pre-deployment backup
#   --no-build       Skip Docker image rebuild
#   --help           Show help message
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/restaurant-management"
DEPLOY_DIR="$APP_DIR/deploy"
BACKUP_DIR="$APP_DIR/backups"
LOG_FILE="$APP_DIR/logs/deploy_$(date +%Y%m%d_%H%M%S).log"

# Flags
SKIP_BACKUP=false
NO_BUILD=false

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "\n${BLUE}===${NC} $1 ${BLUE}===${NC}\n" | tee -a "$LOG_FILE"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --no-build)
            NO_BUILD=true
            shift
            ;;
        --help)
            echo "Usage: ./deploy.sh [options]"
            echo ""
            echo "Options:"
            echo "  --skip-backup    Skip pre-deployment backup"
            echo "  --no-build       Skip Docker image rebuild"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Create logs directory if not exists
mkdir -p "$APP_DIR/logs"

log_step "Restaurant Management System - Deployment"
log_info "Deployment started at $(date)"
log_info "Log file: $LOG_FILE"

################################################################################
# Pre-deployment Checks
################################################################################

log_step "Running pre-deployment checks"

# Check if running in correct directory
if [ ! -d "$APP_DIR" ]; then
    log_error "Application directory not found: $APP_DIR"
    log_error "Please run setup-vps.sh first"
    exit 1
fi

# Check if .env file exists
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    log_error ".env file not found in $DEPLOY_DIR"
    log_error "Please create .env file from .env.example"
    exit 1
fi

# Check if docker is running
if ! docker info &> /dev/null; then
    log_error "Docker is not running"
    exit 1
fi

# Check if docker-compose.prod.yml exists
if [ ! -f "$DEPLOY_DIR/docker-compose.prod.yml" ]; then
    log_error "docker-compose.prod.yml not found"
    exit 1
fi

log_info "✓ All pre-deployment checks passed"

################################################################################
# Create Pre-deployment Backup
################################################################################

if [ "$SKIP_BACKUP" = false ]; then
    log_step "Creating pre-deployment backup"
    
    BACKUP_SCRIPT="$DEPLOY_DIR/digitalocean/scripts/backup.sh"
    
    if [ -f "$BACKUP_SCRIPT" ]; then
        bash "$BACKUP_SCRIPT" || log_warn "Backup failed, continuing anyway..."
    else
        log_warn "Backup script not found, skipping backup"
    fi
else
    log_warn "Skipping pre-deployment backup (--skip-backup flag)"
fi

################################################################################
# Pull Latest Code
################################################################################

log_step "Pulling latest code from repository"

cd "$APP_DIR"

# Check if git repository exists
if [ -d ".git" ]; then
    # Stash any local changes
    if ! git diff-index --quiet HEAD --; then
        log_warn "Local changes detected, stashing..."
        git stash
    fi
    
    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    log_info "Current branch: $CURRENT_BRANCH"
    
    # Get current commit
    BEFORE_COMMIT=$(git rev-parse --short HEAD)
    log_info "Current commit: $BEFORE_COMMIT"
    
    # Pull latest changes
    if git pull origin "$CURRENT_BRANCH"; then
        AFTER_COMMIT=$(git rev-parse --short HEAD)
        log_info "Updated to commit: $AFTER_COMMIT"
        
        if [ "$BEFORE_COMMIT" = "$AFTER_COMMIT" ]; then
            log_info "No new changes to deploy"
        else
            log_info "New changes detected:"
            git log --oneline "$BEFORE_COMMIT..$AFTER_COMMIT" | tee -a "$LOG_FILE"
        fi
    else
        log_error "Git pull failed"
        exit 1
    fi
    
    # Pop stashed changes if any
    if git stash list | grep -q "stash@{0}"; then
        log_info "Applying stashed changes..."
        git stash pop || log_warn "Could not apply stashed changes"
    fi
else
    log_warn "Not a git repository, skipping git pull"
fi

################################################################################
# Build Docker Images
################################################################################

cd "$DEPLOY_DIR"

if [ "$NO_BUILD" = false ]; then
    log_step "Building Docker images"
    
    # Export BuildKit
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    
    log_info "Building images with BuildKit..."
    
    if docker compose -f docker-compose.prod.yml build --parallel; then
        log_info "✓ Docker images built successfully"
    else
        log_error "Docker build failed"
        log_error "Check build logs above"
        exit 1
    fi
else
    log_warn "Skipping Docker image build (--no-build flag)"
fi

################################################################################
# Stop Current Containers
################################################################################

log_step "Stopping and removing current containers"

# Stop and remove containers to force fresh start
log_info "Stopping and removing containers..."
docker compose -f docker-compose.prod.yml down || true

# Remove dangling images
log_info "Cleaning up dangling images..."
docker image prune -f || true

log_info "✓ Containers stopped and removed"

################################################################################
# Start New Containers
################################################################################

log_step "Starting updated containers"

# Start services
if docker compose -f docker-compose.prod.yml up -d; then
    log_info "✓ Containers started successfully"
else
    log_error "Failed to start containers"
    log_error "Attempting rollback..."
    
    # Rollback attempt
    docker compose -f docker-compose.prod.yml down
    docker compose -f docker-compose.prod.yml up -d
    
    exit 1
fi

################################################################################
# Run Database Migrations
################################################################################

log_step "Running database migrations"

# Wait for database to be ready
log_info "Waiting for database to be ready..."
sleep 10

# Source .env file to get DATABASE_URL
if [ -f "$DEPLOY_DIR/.env" ]; then
    export $(cat "$DEPLOY_DIR/.env" | grep -v '^#' | xargs)
    log_info "Environment variables loaded from .env"
else
    log_error ".env file not found"
    exit 1
fi

# Check if server container is running
if docker ps | grep -q "restaurant_server_prod"; then
    # Prefer using the dedicated migrate script if available (better logging & checks)
    MIGRATE_SCRIPT="$DEPLOY_DIR/digitalocean/scripts/migrate.sh"

    if [ -f "$MIGRATE_SCRIPT" ]; then
        log_info "Found migrate script: $MIGRATE_SCRIPT. Executing..."
        if bash "$MIGRATE_SCRIPT" 2>&1 | tee -a "$LOG_FILE"; then
            log_info "✓ Database migrations completed (via migrate.sh)"
        else
            log_error "Database migrations (migrate.sh) failed"
            log_warn "Checking server logs for details..."
            docker logs restaurant_server_prod | tail -20 | tee -a "$LOG_FILE"
            log_warn "Application may not function correctly"
        fi
    else
        log_info "No migrate script found, running prisma migrate deploy (fallback)"

        # Build DATABASE_URL from environment variables
        DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"

        # Run migration with explicit DATABASE_URL and explicit schema path, log output
        if docker exec \
            -e DATABASE_URL="$DB_URL" \
            restaurant_server_prod \
            sh -c "npx prisma migrate deploy --schema prisma/schema.prisma" 2>&1 | tee -a "$LOG_FILE"; then
            log_info "✓ Database migrations completed (via docker exec)"
        else
            log_error "Database migrations failed (fallback)"
            log_warn "Checking server logs for details..."
            docker logs restaurant_server_prod | tail -20 | tee -a "$LOG_FILE"
            log_warn "Application may not function correctly"
        fi
    fi
else
    log_error "Server container not running"
    docker logs restaurant_server_prod | tail -50 | tee -a "$LOG_FILE"
    exit 1
fi

################################################################################
# Health Checks
################################################################################

log_step "Running health checks"

# Wait for services to be healthy
log_info "Waiting for services to be healthy (60s timeout)..."
TIMEOUT=60
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    # Check if all containers are running
    RUNNING_RAW=$(docker compose -f docker-compose.prod.yml ps --status running 2>/dev/null | grep -c "running" || echo "0")
    TOTAL_RAW=$(docker compose -f docker-compose.prod.yml ps 2>/dev/null | grep -c "restaurant" || echo "0")

    # Sanitize outputs to digits only to avoid '[ integer expression expected ]' errors
    RUNNING=$(echo "$RUNNING_RAW" | tr -cd '0-9')
    TOTAL=$(echo "$TOTAL_RAW" | tr -cd '0-9')
    RUNNING=${RUNNING:-0}
    TOTAL=${TOTAL:-0}

    if [ "$RUNNING" -eq "$TOTAL" ] && [ "$RUNNING" -gt 0 ]; then
        log_info "✓ All containers are running"
        break
    fi
    
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    echo -n "."
done

echo ""

if [ $ELAPSED -ge $TIMEOUT ]; then
    log_error "Timeout waiting for containers to be healthy"
    log_warn "Check container logs for issues"
fi

# Run health check script if available
HEALTH_SCRIPT="$DEPLOY_DIR/digitalocean/scripts/health-check.sh"

if [ -f "$HEALTH_SCRIPT" ]; then
    log_info "Running comprehensive health checks..."
    bash "$HEALTH_SCRIPT" || log_warn "Some health checks failed"
else
    # Basic health checks
    log_info "Running basic health checks..."
    
    # Check frontend
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log_info "✓ Frontend health check passed"
    else
        log_warn "✗ Frontend health check failed"
    fi
    
    # Check backend
    if curl -f http://localhost:5000/api/v1/health &> /dev/null; then
        log_info "✓ Backend health check passed"
        
        # Get and display version info
        VERSION_INFO=$(curl -s http://localhost:5000/api/v1/version 2>/dev/null || echo "{}")
        if [ -n "$VERSION_INFO" ] && [ "$VERSION_INFO" != "{}" ]; then
            log_info "Backend version: $(echo $VERSION_INFO | grep -o '"version":"[^"]*"' | cut -d'"' -f4)"
        fi
    else
        log_warn "✗ Backend health check failed"
    fi
fi

################################################################################
# Cleanup
################################################################################

log_step "Cleaning up"

# Remove dangling images
log_info "Removing unused Docker images..."
docker image prune -f &> /dev/null || true

# Show disk usage
log_info "Current disk usage:"
df -h / | grep -v "Filesystem" | tee -a "$LOG_FILE"

################################################################################
# Display Deployment Summary
################################################################################

log_step "Deployment Summary"

echo ""
echo "===============================================" | tee -a "$LOG_FILE"
echo "  Deployment Completed Successfully!" | tee -a "$LOG_FILE"
echo "===============================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Time: $(date)" | tee -a "$LOG_FILE"
echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')" | tee -a "$LOG_FILE"
echo "Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Display deployed version
BACKEND_VERSION=$(curl -s http://localhost:5000/api/v1/version 2>/dev/null | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
if [ -n "$BACKEND_VERSION" ] && [ "$BACKEND_VERSION" != "dev" ]; then
    echo "Deployed Version: $BACKEND_VERSION" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
fi


echo "Running Containers:" | tee -a "$LOG_FILE"
docker compose -f docker-compose.prod.yml ps | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "===============================================" | tee -a "$LOG_FILE"
echo "  Next Steps" | tee -a "$LOG_FILE"
echo "===============================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "1. Verify application is accessible:" | tee -a "$LOG_FILE"
echo "   https://yourdomain.com" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "2. Check logs if issues:" | tee -a "$LOG_FILE"
echo "   docker compose -f docker-compose.prod.yml logs -f" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "3. Monitor application:" | tee -a "$LOG_FILE"
echo "   ./digitalocean/scripts/health-check.sh" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "===============================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

log_info "Deployment completed successfully!"
log_info "Full log available at: $LOG_FILE"

exit 0
