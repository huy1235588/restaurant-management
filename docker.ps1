# PowerShell script for Restaurant Management System Docker Operations
# Run with: .\docker.ps1 <command>

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "Restaurant Management System - Docker Commands" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Development Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 dev              - Start development environment with hot reload"
    Write-Host "  .\docker.ps1 dev-logs         - View development logs"
    Write-Host "  .\docker.ps1 dev-down         - Stop development environment"
    Write-Host ""
    Write-Host "Production Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 prod             - Start production environment"
    Write-Host "  .\docker.ps1 prod-nginx       - Start production with Nginx reverse proxy"
    Write-Host "  .\docker.ps1 prod-logs        - View production logs"
    Write-Host "  .\docker.ps1 prod-down        - Stop production environment"
    Write-Host ""
    Write-Host "Build Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 build            - Build all Docker images"
    Write-Host "  .\docker.ps1 build-client     - Build client image only"
    Write-Host "  .\docker.ps1 build-server     - Build server image only"
    Write-Host "  .\docker.ps1 rebuild          - Rebuild all images without cache"
    Write-Host ""
    Write-Host "Management Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 logs             - View logs for all services"
    Write-Host "  .\docker.ps1 logs-client      - View client logs"
    Write-Host "  .\docker.ps1 logs-server      - View server logs"
    Write-Host "  .\docker.ps1 logs-db          - View database logs"
    Write-Host "  .\docker.ps1 ps               - Show running containers"
    Write-Host "  .\docker.ps1 restart          - Restart all services"
    Write-Host "  .\docker.ps1 restart-server   - Restart server only"
    Write-Host "  .\docker.ps1 restart-client   - Restart client only"
    Write-Host ""
    Write-Host "Database Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 db-migrate       - Run database migrations"
    Write-Host "  .\docker.ps1 db-seed          - Seed database with initial data"
    Write-Host "  .\docker.ps1 db-reset         - Reset database (WARNING: deletes all data)"
    Write-Host "  .\docker.ps1 db-studio        - Open Prisma Studio"
    Write-Host "  .\docker.ps1 db-backup        - Backup database to backup.sql"
    Write-Host "  .\docker.ps1 db-restore       - Restore database from backup.sql"
    Write-Host ""
    Write-Host "Shell Access:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 shell-server     - Access server container shell"
    Write-Host "  .\docker.ps1 shell-client     - Access client container shell"
    Write-Host "  .\docker.ps1 shell-db         - Access PostgreSQL shell"
    Write-Host ""
    Write-Host "Cleanup Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 clean            - Stop and remove containers"
    Write-Host "  .\docker.ps1 clean-all        - Stop, remove containers and volumes (WARNING: deletes data)"
    Write-Host "  .\docker.ps1 prune            - Remove unused Docker resources"
    Write-Host ""
    Write-Host "Utility Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 env              - Create .env file from .env.example"
    Write-Host "  .\docker.ps1 status           - Show container status and health"
}

function Ensure-EnvFile {
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "✅ Created .env file. Please update it with your settings." -ForegroundColor Green
        } else {
            Write-Host "❌ .env.example not found" -ForegroundColor Red
            exit 1
        }
    }
}

switch ($Command.ToLower()) {
    "help" {
        Show-Help
    }
    
    # Environment setup
    "env" {
        if (Test-Path ".env") {
            Write-Host "⚠️  .env file already exists" -ForegroundColor Yellow
        } else {
            Ensure-EnvFile
        }
    }
    
    # Development
    "dev" {
        Ensure-EnvFile
        docker-compose -f docker-compose.dev.yml up -d
        Write-Host "🚀 Development environment started" -ForegroundColor Green
        Write-Host "   Frontend: http://localhost:3000"
        Write-Host "   Backend:  http://localhost:5000"
    }
    
    "dev-logs" {
        docker-compose -f docker-compose.dev.yml logs -f
    }
    
    "dev-down" {
        docker-compose -f docker-compose.dev.yml down
        Write-Host "✅ Development environment stopped" -ForegroundColor Green
    }
    
    # Production
    "prod" {
        Ensure-EnvFile
        docker-compose up -d --build
        Write-Host "🚀 Production environment started" -ForegroundColor Green
        Write-Host "   Frontend: http://localhost:3000"
        Write-Host "   Backend:  http://localhost:5000"
    }
    
    "prod-nginx" {
        Ensure-EnvFile
        docker-compose --profile nginx up -d --build
        Write-Host "🚀 Production environment with Nginx started" -ForegroundColor Green
        Write-Host "   Application: http://localhost"
    }
    
    "prod-logs" {
        docker-compose logs -f
    }
    
    "prod-down" {
        docker-compose down
        Write-Host "✅ Production environment stopped" -ForegroundColor Green
    }
    
    # Build
    "build" {
        docker-compose build
    }
    
    "build-client" {
        docker-compose build client
    }
    
    "build-server" {
        docker-compose build server
    }
    
    "rebuild" {
        docker-compose build --no-cache
    }
    
    # Logs
    "logs" {
        docker-compose logs -f
    }
    
    "logs-client" {
        docker-compose logs -f client
    }
    
    "logs-server" {
        docker-compose logs -f server
    }
    
    "logs-db" {
        docker-compose logs -f postgres
    }
    
    # Container management
    "ps" {
        docker-compose ps
    }
    
    "status" {
        Write-Host "Container Status:" -ForegroundColor Cyan
        docker-compose ps
        Write-Host ""
        Write-Host "Resource Usage:" -ForegroundColor Cyan
        docker stats --no-stream
    }
    
    "restart" {
        docker-compose restart
        Write-Host "✅ All services restarted" -ForegroundColor Green
    }
    
    "restart-server" {
        docker-compose restart server
        Write-Host "✅ Server restarted" -ForegroundColor Green
    }
    
    "restart-client" {
        docker-compose restart client
        Write-Host "✅ Client restarted" -ForegroundColor Green
    }
    
    # Database operations
    "db-migrate" {
        docker-compose exec server pnpm prisma:migrate
    }
    
    "db-seed" {
        docker-compose exec server pnpm prisma:seed
    }
    
    "db-reset" {
        Write-Host "⚠️  WARNING: This will delete all data!" -ForegroundColor Red
        $confirmation = Read-Host "Are you sure? [y/N]"
        if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
            docker-compose exec server pnpm prisma:reset
        }
    }
    
    "db-studio" {
        docker-compose exec server pnpm prisma:studio
    }
    
    "db-backup" {
        docker-compose exec postgres pg_dump -U restaurant_admin restaurant_db > backup.sql
        Write-Host "✅ Database backed up to backup.sql" -ForegroundColor Green
    }
    
    "db-restore" {
        if (Test-Path "backup.sql") {
            Get-Content backup.sql | docker-compose exec -T postgres psql -U restaurant_admin restaurant_db
            Write-Host "✅ Database restored from backup.sql" -ForegroundColor Green
        } else {
            Write-Host "❌ backup.sql not found" -ForegroundColor Red
        }
    }
    
    # Shell access
    "shell-server" {
        docker-compose exec server sh
    }
    
    "shell-client" {
        docker-compose exec client sh
    }
    
    "shell-db" {
        docker-compose exec postgres psql -U restaurant_admin -d restaurant_db
    }
    
    # Cleanup
    "clean" {
        docker-compose down
        Write-Host "✅ Containers stopped and removed" -ForegroundColor Green
    }
    
    "clean-all" {
        Write-Host "⚠️  WARNING: This will delete all data including volumes!" -ForegroundColor Red
        $confirmation = Read-Host "Are you sure? [y/N]"
        if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
            docker-compose down -v
            Write-Host "✅ Containers, networks, and volumes removed" -ForegroundColor Green
        }
    }
    
    "prune" {
        docker system prune -f
        Write-Host "✅ Unused Docker resources removed" -ForegroundColor Green
    }
    
    default {
        Write-Host "❌ Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
