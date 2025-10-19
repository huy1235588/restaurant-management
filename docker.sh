#!/bin/bash
# Bash script for Restaurant Management System Docker Operations
# Run with: ./docker.sh <command>

set -e

COMMAND=${1:-help}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${CYAN}Restaurant Management System - Docker Commands${NC}"
    echo ""
    echo -e "${YELLOW}Development Commands:${NC}"
    echo "  ./docker.sh dev              - Start development environment with hot reload"
    echo "  ./docker.sh dev-logs         - View development logs"
    echo "  ./docker.sh dev-down         - Stop development environment"
    echo ""
    echo -e "${YELLOW}Production Commands:${NC}"
    echo "  ./docker.sh prod             - Start production environment"
    echo "  ./docker.sh prod-nginx       - Start production with Nginx reverse proxy"
    echo "  ./docker.sh prod-logs        - View production logs"
    echo "  ./docker.sh prod-down        - Stop production environment"
    echo ""
    echo -e "${YELLOW}Build Commands:${NC}"
    echo "  ./docker.sh build            - Build all Docker images"
    echo "  ./docker.sh build-client     - Build client image only"
    echo "  ./docker.sh build-server     - Build server image only"
    echo "  ./docker.sh rebuild          - Rebuild all images without cache"
    echo ""
    echo -e "${YELLOW}Management Commands:${NC}"
    echo "  ./docker.sh logs             - View logs for all services"
    echo "  ./docker.sh logs-client      - View client logs"
    echo "  ./docker.sh logs-server      - View server logs"
    echo "  ./docker.sh logs-db          - View database logs"
    echo "  ./docker.sh ps               - Show running containers"
    echo "  ./docker.sh restart          - Restart all services"
    echo "  ./docker.sh restart-server   - Restart server only"
    echo "  ./docker.sh restart-client   - Restart client only"
    echo ""
    echo -e "${YELLOW}Database Commands:${NC}"
    echo "  ./docker.sh db-migrate       - Run database migrations"
    echo "  ./docker.sh db-seed          - Seed database with initial data"
    echo "  ./docker.sh db-reset         - Reset database (WARNING: deletes all data)"
    echo "  ./docker.sh db-studio        - Open Prisma Studio"
    echo "  ./docker.sh db-backup        - Backup database to backup.sql"
    echo "  ./docker.sh db-restore       - Restore database from backup.sql"
    echo ""
    echo -e "${YELLOW}Shell Access:${NC}"
    echo "  ./docker.sh shell-server     - Access server container shell"
    echo "  ./docker.sh shell-client     - Access client container shell"
    echo "  ./docker.sh shell-db         - Access PostgreSQL shell"
    echo ""
    echo -e "${YELLOW}Cleanup Commands:${NC}"
    echo "  ./docker.sh clean            - Stop and remove containers"
    echo "  ./docker.sh clean-all        - Stop, remove containers and volumes (WARNING: deletes data)"
    echo "  ./docker.sh prune            - Remove unused Docker resources"
    echo ""
    echo -e "${YELLOW}Utility Commands:${NC}"
    echo "  ./docker.sh env              - Create .env file from .env.example"
    echo "  ./docker.sh status           - Show container status and health"
}

ensure_env_file() {
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${GREEN}✅ Created .env file. Please update it with your settings.${NC}"
        else
            echo -e "${RED}❌ .env.example not found${NC}"
            exit 1
        fi
    fi
}

case "$COMMAND" in
    help)
        show_help
        ;;
    
    # Environment setup
    env)
        if [ -f .env ]; then
            echo -e "${YELLOW}⚠️  .env file already exists${NC}"
        else
            ensure_env_file
        fi
        ;;
    
    # Development
    dev)
        ensure_env_file
        docker-compose -f docker-compose.dev.yml up -d
        echo -e "${GREEN}🚀 Development environment started${NC}"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:5000"
        ;;
    
    dev-logs)
        docker-compose -f docker-compose.dev.yml logs -f
        ;;
    
    dev-down)
        docker-compose -f docker-compose.dev.yml down
        echo -e "${GREEN}✅ Development environment stopped${NC}"
        ;;
    
    # Production
    prod)
        ensure_env_file
        docker-compose up -d --build
        echo -e "${GREEN}🚀 Production environment started${NC}"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:5000"
        ;;
    
    prod-nginx)
        ensure_env_file
        docker-compose --profile nginx up -d --build
        echo -e "${GREEN}🚀 Production environment with Nginx started${NC}"
        echo "   Application: http://localhost"
        ;;
    
    prod-logs)
        docker-compose logs -f
        ;;
    
    prod-down)
        docker-compose down
        echo -e "${GREEN}✅ Production environment stopped${NC}"
        ;;
    
    # Build
    build)
        docker-compose build
        ;;
    
    build-client)
        docker-compose build client
        ;;
    
    build-server)
        docker-compose build server
        ;;
    
    rebuild)
        docker-compose build --no-cache
        ;;
    
    # Logs
    logs)
        docker-compose logs -f
        ;;
    
    logs-client)
        docker-compose logs -f client
        ;;
    
    logs-server)
        docker-compose logs -f server
        ;;
    
    logs-db)
        docker-compose logs -f postgres
        ;;
    
    # Container management
    ps)
        docker-compose ps
        ;;
    
    status)
        echo -e "${CYAN}Container Status:${NC}"
        docker-compose ps
        echo ""
        echo -e "${CYAN}Resource Usage:${NC}"
        docker stats --no-stream
        ;;
    
    restart)
        docker-compose restart
        echo -e "${GREEN}✅ All services restarted${NC}"
        ;;
    
    restart-server)
        docker-compose restart server
        echo -e "${GREEN}✅ Server restarted${NC}"
        ;;
    
    restart-client)
        docker-compose restart client
        echo -e "${GREEN}✅ Client restarted${NC}"
        ;;
    
    # Database operations
    db-migrate)
        docker-compose exec server pnpm prisma:migrate
        ;;
    
    db-seed)
        docker-compose exec server pnpm prisma:seed
        ;;
    
    db-reset)
        echo -e "${RED}⚠️  WARNING: This will delete all data!${NC}"
        read -p "Are you sure? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose exec server pnpm prisma:reset
        fi
        ;;
    
    db-studio)
        docker-compose exec server pnpm prisma:studio
        ;;
    
    db-backup)
        docker-compose exec postgres pg_dump -U restaurant_admin restaurant_db > backup.sql
        echo -e "${GREEN}✅ Database backed up to backup.sql${NC}"
        ;;
    
    db-restore)
        if [ -f backup.sql ]; then
            docker-compose exec -T postgres psql -U restaurant_admin restaurant_db < backup.sql
            echo -e "${GREEN}✅ Database restored from backup.sql${NC}"
        else
            echo -e "${RED}❌ backup.sql not found${NC}"
        fi
        ;;
    
    # Shell access
    shell-server)
        docker-compose exec server sh
        ;;
    
    shell-client)
        docker-compose exec client sh
        ;;
    
    shell-db)
        docker-compose exec postgres psql -U restaurant_admin -d restaurant_db
        ;;
    
    # Cleanup
    clean)
        docker-compose down
        echo -e "${GREEN}✅ Containers stopped and removed${NC}"
        ;;
    
    clean-all)
        echo -e "${RED}⚠️  WARNING: This will delete all data including volumes!${NC}"
        read -p "Are you sure? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            echo -e "${GREEN}✅ Containers, networks, and volumes removed${NC}"
        fi
        ;;
    
    prune)
        docker system prune -f
        echo -e "${GREEN}✅ Unused Docker resources removed${NC}"
        ;;
    
    *)
        echo -e "${RED}❌ Unknown command: $COMMAND${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
