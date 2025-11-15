#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Restaurant Management - Smoke Tests${NC}"
echo -e "${GREEN}=================================================${NC}"

FAILED=0

# Function to test endpoint
test_endpoint() {
    local url=$1
    local name=$2
    
    echo -e "${YELLOW}Testing: $name${NC}"
    if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo -e "${GREEN}✓ $name - PASSED${NC}"
        return 0
    else
        echo -e "${RED}✗ $name - FAILED${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo -e "${YELLOW}Starting smoke tests...${NC}"
echo "Time: $(date)"
echo ""

# Test Frontend Health
test_endpoint "http://localhost:3000/health" "Frontend health check"

# Test Backend Health
test_endpoint "http://localhost:5000/api/health" "Backend health check"

# Test Frontend Home Page
test_endpoint "http://localhost:3000" "Frontend home page"

# Test Backend API Version
test_endpoint "http://localhost:5000/api" "Backend API endpoint"

# Check Docker containers
echo -e "${YELLOW}Checking Docker containers...${NC}"
if docker compose -f /opt/restaurant/docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Docker containers running${NC}"
else
    echo -e "${RED}✗ Some containers are not running${NC}"
    FAILED=$((FAILED + 1))
fi

# Check Database Connection
echo -e "${YELLOW}Checking database connection...${NC}"
if docker exec restaurant_postgres pg_isready -U restaurant_admin > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection - PASSED${NC}"
else
    echo -e "${RED}✗ Database connection - FAILED${NC}"
    FAILED=$((FAILED + 1))
fi

# Check Redis Connection
echo -e "${YELLOW}Checking Redis connection...${NC}"
if docker exec restaurant_redis redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✓ Redis connection - PASSED${NC}"
else
    echo -e "${RED}✗ Redis connection - FAILED${NC}"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo -e "${GREEN}=================================================${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All smoke tests passed (0 failures)${NC}"
    echo -e "${GREEN}=================================================${NC}"
    exit 0
else
    echo -e "${RED}✗ Smoke tests failed ($FAILED failures)${NC}"
    echo -e "${RED}=================================================${NC}"
    exit 1
fi
