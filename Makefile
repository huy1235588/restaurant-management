# Makefile for Restaurant Management System Docker Operations

.PHONY: help build up down restart logs clean dev prod backup restore

# Default target
help:
	@echo "Restaurant Management System - Docker Commands"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev              - Start development environment with hot reload"
	@echo "  make dev-logs         - View development logs"
	@echo "  make dev-down         - Stop development environment"
	@echo ""
	@echo "Production Commands:"
	@echo "  make prod             - Start production environment"
	@echo "  make prod-nginx       - Start production with Nginx reverse proxy"
	@echo "  make prod-logs        - View production logs"
	@echo "  make prod-down        - Stop production environment"
	@echo ""
	@echo "Build Commands:"
	@echo "  make build            - Build all Docker images"
	@echo "  make build-client     - Build client image only"
	@echo "  make build-server     - Build server image only"
	@echo "  make rebuild          - Rebuild all images without cache"
	@echo ""
	@echo "Management Commands:"
	@echo "  make logs             - View logs for all services"
	@echo "  make logs-client      - View client logs"
	@echo "  make logs-server      - View server logs"
	@echo "  make logs-db          - View database logs"
	@echo "  make ps               - Show running containers"
	@echo "  make restart          - Restart all services"
	@echo "  make restart-server   - Restart server only"
	@echo "  make restart-client   - Restart client only"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-migrate       - Run database migrations"
	@echo "  make db-seed          - Seed database with initial data"
	@echo "  make db-reset         - Reset database (WARNING: deletes all data)"
	@echo "  make db-studio        - Open Prisma Studio"
	@echo "  make db-backup        - Backup database to backup.sql"
	@echo "  make db-restore       - Restore database from backup.sql"
	@echo ""
	@echo "Shell Access:"
	@echo "  make shell-server     - Access server container shell"
	@echo "  make shell-client     - Access client container shell"
	@echo "  make shell-db         - Access PostgreSQL shell"
	@echo ""
	@echo "Cleanup Commands:"
	@echo "  make clean            - Stop and remove containers"
	@echo "  make clean-all        - Stop, remove containers and volumes (WARNING: deletes data)"
	@echo "  make prune            - Remove unused Docker resources"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make env              - Create .env file from .env.example"
	@echo "  make status           - Show container status and health"

# Environment setup
env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Created .env file. Please update it with your settings."; \
	else \
		echo "⚠️  .env file already exists"; \
	fi

# Development
dev: env
	docker-compose -f docker-compose.dev.yml up -d
	@echo "🚀 Development environment started"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:5000"

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-down:
	docker-compose -f docker-compose.dev.yml down

# Production
prod: env
	docker-compose up -d --build
	@echo "🚀 Production environment started"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:5000"

prod-nginx: env
	docker-compose --profile production up -d --build
	@echo "🚀 Production environment with Nginx started"
	@echo "   Application: http://localhost"

prod-logs:
	docker-compose logs -f

prod-down:
	docker-compose down

# Build
build:
	docker-compose build

build-client:
	docker-compose build client

build-server:
	docker-compose build server

rebuild:
	docker-compose build --no-cache

# Logs
logs:
	docker-compose logs -f

logs-client:
	docker-compose logs -f client

logs-server:
	docker-compose logs -f server

logs-db:
	docker-compose logs -f postgres

# Container management
ps:
	docker-compose ps

status:
	@echo "Container Status:"
	@docker-compose ps
	@echo ""
	@echo "Resource Usage:"
	@docker stats --no-stream

restart:
	docker-compose restart

restart-server:
	docker-compose restart server

restart-client:
	docker-compose restart client

# Database operations
db-migrate:
	docker-compose exec server pnpm prisma:migrate

db-seed:
	docker-compose exec server pnpm prisma:seed

db-reset:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose exec server pnpm prisma:reset; \
	fi

db-studio:
	docker-compose exec server pnpm prisma:studio

db-backup:
	docker-compose exec postgres pg_dump -U restaurant_admin restaurant_db > backup.sql
	@echo "✅ Database backed up to backup.sql"

db-restore:
	@if [ -f backup.sql ]; then \
		docker-compose exec -T postgres psql -U restaurant_admin restaurant_db < backup.sql; \
		echo "✅ Database restored from backup.sql"; \
	else \
		echo "❌ backup.sql not found"; \
	fi

# Shell access
shell-server:
	docker-compose exec server sh

shell-client:
	docker-compose exec client sh

shell-db:
	docker-compose exec postgres psql -U restaurant_admin -d restaurant_db

# Cleanup
clean:
	docker-compose down
	@echo "✅ Containers stopped and removed"

clean-all:
	@echo "⚠️  WARNING: This will delete all data including volumes!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "✅ Containers, networks, and volumes removed"; \
	fi

prune:
	docker system prune -f
	@echo "✅ Unused Docker resources removed"
