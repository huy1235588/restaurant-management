#!/bin/bash
# Setup Local Development Environment
# Restaurant Management System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================${NC}"
echo -e "${CYAN} Restaurant Management System${NC}"
echo -e "${CYAN} Local Development Setup${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""

# Check if Docker is installed
echo -e "${YELLOW}Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is installed: $(docker --version)${NC}"
else
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo -e "${YELLOW}  Please install Docker from: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Check if Docker Compose is available
echo -e "${YELLOW}Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose is installed: $(docker-compose --version)${NC}"
elif docker compose version &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose (V2) is installed${NC}"
    # Use 'docker compose' instead of 'docker-compose'
    shopt -s expand_aliases
    alias docker-compose='docker compose'
else
    echo -e "${RED}✗ Docker Compose is not available${NC}"
    exit 1
fi

# Navigate to deploy directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"
cd "$DEPLOY_DIR"

# Check if .env exists, create from example if not
echo ""
echo -e "${YELLOW}Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
        
        # Generate JWT secrets
        echo -e "${YELLOW}Generating secure JWT secrets...${NC}"
        if command -v openssl &> /dev/null; then
            JWT_SECRET=$(openssl rand -base64 32)
            JWT_REFRESH_SECRET=$(openssl rand -base64 32)
            SESSION_SECRET=$(openssl rand -base64 32)
        else
            # Fallback if openssl not available
            JWT_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
            JWT_REFRESH_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
            SESSION_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        fi
        
        # Replace placeholders in .env
        sed -i.bak \
            -e "s/JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_CHARS_MINIMUM/JWT_SECRET=$JWT_SECRET/" \
            -e "s/JWT_REFRESH_SECRET=CHANGE_THIS_TOO_DIFFERENT_FROM_ABOVE/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" \
            -e "s/SESSION_SECRET=CHANGE_THIS_IN_PRODUCTION_TO_RANDOM_VALUE/SESSION_SECRET=$SESSION_SECRET/" \
            ".env"
        rm -f ".env.bak"
        
        echo -e "${GREEN}✓ Generated secure JWT secrets${NC}"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Start Docker Compose services
echo ""
echo -e "${YELLOW}Starting Docker services (PostgreSQL & Redis)...${NC}"
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker services started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start Docker services${NC}"
    exit 1
fi

# Wait for services to be healthy
echo ""
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0
SERVICES_READY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ] && [ "$SERVICES_READY" = false ]; do
    ATTEMPT=$((ATTEMPT + 1))
    sleep 2
    
    POSTGRES_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' restaurant_postgres_dev 2>/dev/null || echo "starting")
    REDIS_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' restaurant_redis_dev 2>/dev/null || echo "starting")
    
    if [ "$POSTGRES_HEALTH" = "healthy" ] && [ "$REDIS_HEALTH" = "healthy" ]; then
        SERVICES_READY=true
    else
        echo -e "  Attempt $ATTEMPT/$MAX_ATTEMPTS - Waiting for health checks..."
    fi
done

if [ "$SERVICES_READY" = true ]; then
    echo -e "${GREEN}✓ All services are healthy${NC}"
else
    echo -e "${YELLOW}⚠ Services started but health checks timed out${NC}"
    echo -e "${YELLOW}  You may need to wait a bit longer or check: docker-compose logs${NC}"
fi

# Navigate to server directory for database setup
echo ""
echo -e "${YELLOW}Setting up database...${NC}"
SERVER_DIR="$(dirname "$DEPLOY_DIR")/app/server"

if [ -d "$SERVER_DIR" ]; then
    cd "$SERVER_DIR"
    
    # Check if pnpm is installed
    if command -v pnpm &> /dev/null; then
        echo -e "${YELLOW}Running Prisma migrations...${NC}"
        pnpm prisma migrate deploy
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database migrations completed${NC}"
            
            # Ask if user wants to seed database
            read -p "Seed database with demo data? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}Seeding database...${NC}"
                pnpm prisma db seed
                
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✓ Database seeded successfully${NC}"
                else
                    echo -e "${YELLOW}⚠ Database seeding failed${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}⚠ Database migration failed${NC}"
            echo -e "${YELLOW}  You may need to run migrations manually${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ pnpm not found. Please run migrations manually:${NC}"
        echo -e "${YELLOW}  cd app/server && pnpm prisma migrate deploy${NC}"
    fi
    
    cd "$DEPLOY_DIR"
else
    echo -e "${YELLOW}⚠ Server directory not found, skipping database setup${NC}"
fi

# Print success message and next steps
echo ""
echo -e "${CYAN}====================================${NC}"
echo -e "${GREEN} Setup Complete!${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""
echo -e "${YELLOW}Services running:${NC}"
echo -e "  PostgreSQL: localhost:5432"
echo -e "  Redis:      localhost:6379"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Start backend server:"
echo -e "     ${CYAN}cd app/server && pnpm dev${NC}"
echo ""
echo -e "  2. Start frontend client:"
echo -e "     ${CYAN}cd app/client && pnpm dev${NC}"
echo ""
echo -e "  3. Open your browser:"
echo -e "     Frontend: ${CYAN}http://localhost:3000${NC}"
echo -e "     Backend:  ${CYAN}http://localhost:5000/api/v1${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  ${CYAN}docker-compose -f deploy/docker-compose.yml ps${NC}      # Check service status"
echo -e "  ${CYAN}docker-compose -f deploy/docker-compose.yml logs${NC}    # View logs"
echo -e "  ${CYAN}docker-compose -f deploy/docker-compose.yml down${NC}    # Stop services"
echo ""
echo -e "For deployment, see: ${CYAN}deploy/README.md${NC}"
echo ""
