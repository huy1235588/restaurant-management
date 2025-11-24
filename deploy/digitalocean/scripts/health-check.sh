#!/bin/bash

################################################################################
# Health Check Script for Restaurant Management System
# 
# This script verifies all services are running correctly
# 
# Usage: ./health-check.sh
################################################################################

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_DIR="/opt/restaurant-management"
DEPLOY_DIR="$APP_DIR/deploy"

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    PASSED=$((PASSED + 1))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    FAILED=$((FAILED + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

section_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

################################################################################
# Health Checks
################################################################################

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Restaurant Management Health Check   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

################################################################################
# 1. Docker Status
################################################################################

section_header "Docker Status"

if systemctl is-active --quiet docker; then
    check_pass "Docker daemon is running"
else
    check_fail "Docker daemon is not running"
fi

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    check_pass "Docker Compose is available"
else
    check_fail "Docker Compose not found"
fi

################################################################################
# 2. Container Status
################################################################################

section_header "Container Status"

cd "$DEPLOY_DIR" 2>/dev/null || cd /

# Expected containers
CONTAINERS=("restaurant_postgres_prod" "restaurant_redis_prod" "restaurant_server_prod" "restaurant_client_prod")

for container in "${CONTAINERS[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        # Check if healthy
        STATUS=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null)
        
        if [ "$STATUS" = "running" ]; then
            if [ "$HEALTH" = "healthy" ] || [ "$HEALTH" = "" ]; then
                check_pass "$container is running"
            else
                check_warn "$container is running but health: $HEALTH"
            fi
        else
            check_fail "$container status: $STATUS"
        fi
    else
        check_fail "$container is not running"
    fi
done

################################################################################
# 3. Database Connectivity
################################################################################

section_header "Database Connectivity"

if docker exec restaurant_postgres_prod pg_isready -U restaurant_admin &> /dev/null; then
    check_pass "PostgreSQL is accepting connections"
else
    check_fail "PostgreSQL is not accepting connections"
fi

# Test query
if docker exec restaurant_postgres_prod psql -U restaurant_admin -d restaurant_db -c "SELECT 1;" &> /dev/null; then
    check_pass "PostgreSQL query execution works"
else
    check_fail "PostgreSQL query execution failed"
fi

# Check table count
TABLE_COUNT=$(docker exec restaurant_postgres_prod psql -U restaurant_admin -d restaurant_db -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs || echo "0")

if [ "$TABLE_COUNT" -gt 0 ]; then
    check_pass "Database has $TABLE_COUNT tables"
else
    check_fail "No tables found in database"
fi

################################################################################
# 4. Redis Connectivity
################################################################################

section_header "Redis Connectivity"

# Load Redis password from .env
if [ -f "$DEPLOY_DIR/.env" ]; then
    REDIS_PASSWORD=$(grep "^REDIS_PASSWORD=" "$DEPLOY_DIR/.env" | cut -d '=' -f2 | tr -d '"' | tr -d "'")
fi

if [ -n "$REDIS_PASSWORD" ]; then
    if docker exec restaurant_redis_prod redis-cli -a "$REDIS_PASSWORD" ping 2>/dev/null | grep -q "PONG"; then
        check_pass "Redis is responding"
    else
        check_fail "Redis is not responding"
    fi
    
    # Check Redis info
    REDIS_VERSION=$(docker exec restaurant_redis_prod redis-cli -a "$REDIS_PASSWORD" INFO server 2>/dev/null | grep "redis_version:" | cut -d ':' -f2 | tr -d '\r')
    if [ -n "$REDIS_VERSION" ]; then
        check_pass "Redis version: $REDIS_VERSION"
    fi
else
    check_warn "Cannot check Redis (password not found in .env)"
fi

################################################################################
# 5. Application Endpoints
################################################################################

section_header "Application Endpoints"

# Frontend health
if curl -f -s http://localhost:3000/api/health &> /dev/null; then
    check_pass "Frontend health endpoint responding"
else
    check_fail "Frontend health endpoint not responding"
fi

# Backend health
if curl -f -s http://localhost:5000/api/v1/health &> /dev/null; then
    check_pass "Backend health endpoint responding"
    
    # Get API response
    API_RESPONSE=$(curl -s http://localhost:5000/api/v1/health 2>/dev/null)
    if echo "$API_RESPONSE" | grep -q "ok\|healthy\|success"; then
        check_pass "Backend API status is healthy"
    else
        check_warn "Backend API status unclear"
    fi
else
    check_fail "Backend health endpoint not responding"
fi

# WebSocket
if curl -f -s http://localhost:5000/socket.io/ &> /dev/null; then
    check_pass "WebSocket endpoint is accessible"
else
    check_warn "WebSocket endpoint check failed (may be normal)"
fi

################################################################################
# 6. SSL/HTTPS (if Caddy is running)
################################################################################

section_header "SSL/HTTPS Status"

if docker ps --format '{{.Names}}' | grep -q "caddy\|nginx"; then
    check_pass "Reverse proxy container is running"
    
    # Check if ports are listening
    if netstat -tuln 2>/dev/null | grep -q ":80 "; then
        check_pass "Port 80 (HTTP) is listening"
    else
        check_warn "Port 80 (HTTP) is not listening"
    fi
    
    if netstat -tuln 2>/dev/null | grep -q ":443 "; then
        check_pass "Port 443 (HTTPS) is listening"
    else
        check_warn "Port 443 (HTTPS) is not listening"
    fi
else
    check_warn "Reverse proxy not running (direct access mode)"
fi

################################################################################
# 7. System Resources
################################################################################

section_header "System Resources"

# Memory
TOTAL_MEM=$(free -m | awk '/Mem:/ {print $2}')
USED_MEM=$(free -m | awk '/Mem:/ {print $3}')
MEM_PERCENT=$((USED_MEM * 100 / TOTAL_MEM))

if [ $MEM_PERCENT -lt 80 ]; then
    check_pass "Memory usage: ${MEM_PERCENT}% (${USED_MEM}MB/${TOTAL_MEM}MB)"
elif [ $MEM_PERCENT -lt 90 ]; then
    check_warn "Memory usage: ${MEM_PERCENT}% (${USED_MEM}MB/${TOTAL_MEM}MB)"
else
    check_fail "Memory usage: ${MEM_PERCENT}% (${USED_MEM}MB/${TOTAL_MEM}MB) - Too high!"
fi

# Disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
DISK_AVAIL=$(df -h / | awk 'NR==2 {print $4}')

if [ "$DISK_USAGE" -lt 80 ]; then
    check_pass "Disk usage: ${DISK_USAGE}% (${DISK_AVAIL} available)"
elif [ "$DISK_USAGE" -lt 90 ]; then
    check_warn "Disk usage: ${DISK_USAGE}% (${DISK_AVAIL} available)"
else
    check_fail "Disk usage: ${DISK_USAGE}% (${DISK_AVAIL} available) - Too high!"
fi

# Docker disk usage
DOCKER_IMAGES_SIZE=$(docker system df 2>/dev/null | awk '/Images/ {print $4}' || echo "N/A")
DOCKER_CONTAINERS_SIZE=$(docker system df 2>/dev/null | awk '/Containers/ {print $4}' || echo "N/A")
DOCKER_VOLUMES_SIZE=$(docker system df 2>/dev/null | awk '/Local Volumes/ {print $4}' || echo "N/A")

if [ "$DOCKER_IMAGES_SIZE" != "N/A" ]; then
    check_pass "Docker images size: $DOCKER_IMAGES_SIZE"
    check_pass "Docker volumes size: $DOCKER_VOLUMES_SIZE"
fi

################################################################################
# 8. Firewall Status
################################################################################

section_header "Firewall Status"

if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        check_pass "UFW firewall is active"
        
        # Check critical ports
        if ufw status | grep -q "80/tcp.*ALLOW"; then
            check_pass "Port 80 (HTTP) allowed in firewall"
        else
            check_warn "Port 80 (HTTP) not explicitly allowed"
        fi
        
        if ufw status | grep -q "443/tcp.*ALLOW"; then
            check_pass "Port 443 (HTTPS) allowed in firewall"
        else
            check_warn "Port 443 (HTTPS) not explicitly allowed"
        fi
    else
        check_warn "UFW firewall is not active"
    fi
else
    check_warn "UFW not installed"
fi

################################################################################
# 9. Logs Check
################################################################################

section_header "Recent Errors in Logs"

# Check for errors in container logs (last 50 lines)
ERROR_COUNT=0

for container in "${CONTAINERS[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        ERRORS=$(docker logs --tail 50 "$container" 2>&1 | grep -i "error\|exception\|fatal" | wc -l)
        
        if [ "$ERRORS" -eq 0 ]; then
            check_pass "$container: No recent errors"
        elif [ "$ERRORS" -lt 5 ]; then
            check_warn "$container: $ERRORS error(s) in recent logs"
        else
            check_fail "$container: $ERRORS error(s) in recent logs"
        fi
        
        ERROR_COUNT=$((ERROR_COUNT + ERRORS))
    fi
done

################################################################################
# 10. Backup Status
################################################################################

section_header "Backup Status"

BACKUP_DIR="$APP_DIR/backups"

if [ -d "$BACKUP_DIR" ]; then
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -type f | wc -l)
    
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        LATEST_BACKUP=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -f2- -d" ")
        BACKUP_AGE=$(find "$LATEST_BACKUP" -mtime +1 | wc -l)
        BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" | cut -d' ' -f1)
        
        if [ "$BACKUP_AGE" -eq 0 ]; then
            check_pass "Latest backup: $BACKUP_DATE (< 24 hours old)"
        else
            check_warn "Latest backup: $BACKUP_DATE (> 24 hours old)"
        fi
        
        check_pass "Total backups: $BACKUP_COUNT"
    else
        check_warn "No backups found in $BACKUP_DIR"
    fi
else
    check_warn "Backup directory not found: $BACKUP_DIR"
fi

################################################################################
# Summary
################################################################################

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Health Check Summary          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}Passed:${NC}   $PASSED"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "  ${RED}Failed:${NC}   $FAILED"
echo ""

# Overall status
TOTAL=$((PASSED + FAILED))
if [ "$TOTAL" -eq 0 ]; then
    TOTAL=1  # Avoid division by zero
fi
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}Overall Status: HEALTHY ✓${NC}"
    echo -e "Success Rate: ${SUCCESS_RATE}%"
    EXIT_CODE=0
elif [ "$FAILED" -lt 3 ]; then
    echo -e "${YELLOW}Overall Status: DEGRADED ⚠${NC}"
    echo -e "Success Rate: ${SUCCESS_RATE}%"
    echo -e "\nAction required: Check failed items above"
    EXIT_CODE=1
else
    echo -e "${RED}Overall Status: CRITICAL ✗${NC}"
    echo -e "Success Rate: ${SUCCESS_RATE}%"
    echo -e "\nImmediate action required!"
    EXIT_CODE=2
fi

echo ""

# Suggestions
if [ "$FAILED" -gt 0 ] || [ "$WARNINGS" -gt 0 ]; then
    echo "Troubleshooting suggestions:"
    echo "  1. Check container logs: docker compose -f docker-compose.prod.yml logs -f"
    echo "  2. Restart services: docker compose -f docker-compose.prod.yml restart"
    echo "  3. Review deployment guide: deploy/digitalocean/DEPLOYMENT_GUIDE_VI.md"
    echo "  4. Check security: deploy/digitalocean/SECURITY_CHECKLIST.md"
    echo ""
fi

exit $EXIT_CODE
