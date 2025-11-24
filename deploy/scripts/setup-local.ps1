#!/usr/bin/env pwsh
# Setup Local Development Environment
# Restaurant Management System

Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Restaurant Management System" -ForegroundColor Cyan
Write-Host " Local Development Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not found"
    }
    Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "  Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose not found"
    }
    Write-Host "✓ Docker Compose is installed: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose is not available" -ForegroundColor Red
    exit 1
}

# Navigate to deploy directory
$deployDir = Split-Path -Parent $PSScriptRoot
Set-Location $deployDir

# Check if .env exists, create from example if not
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ Created .env from .env.example" -ForegroundColor Green
        
        # Generate JWT secrets
        Write-Host "Generating secure JWT secrets..." -ForegroundColor Yellow
        $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $jwtRefreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        
        # Replace placeholders in .env
        (Get-Content ".env") | ForEach-Object {
            $_ -replace 'JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_CHARS_MINIMUM', "JWT_SECRET=$jwtSecret" `
               -replace 'JWT_REFRESH_SECRET=CHANGE_THIS_TOO_DIFFERENT_FROM_ABOVE', "JWT_REFRESH_SECRET=$jwtRefreshSecret" `
               -replace 'SESSION_SECRET=CHANGE_THIS_IN_PRODUCTION_TO_RANDOM_VALUE', "SESSION_SECRET=$jwtSecret"
        } | Set-Content ".env"
        
        Write-Host "✓ Generated secure JWT secrets" -ForegroundColor Green
    } else {
        Write-Host "✗ .env.example not found" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Start Docker Compose services
Write-Host ""
Write-Host "Starting Docker services (PostgreSQL & Redis)..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker services started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start Docker services" -ForegroundColor Red
    exit 1
}

# Wait for services to be healthy
Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$servicesReady = $false

while ($attempt -lt $maxAttempts -and -not $servicesReady) {
    $attempt++
    Start-Sleep -Seconds 2
    
    $postgresHealth = docker inspect --format='{{.State.Health.Status}}' restaurant_postgres_dev 2>$null
    $redisHealth = docker inspect --format='{{.State.Health.Status}}' restaurant_redis_dev 2>$null
    
    if ($postgresHealth -eq "healthy" -and $redisHealth -eq "healthy") {
        $servicesReady = $true
    } else {
        Write-Host "  Attempt $attempt/$maxAttempts - Waiting for health checks..." -ForegroundColor Gray
    }
}

if ($servicesReady) {
    Write-Host "✓ All services are healthy" -ForegroundColor Green
} else {
    Write-Host "⚠ Services started but health checks timed out" -ForegroundColor Yellow
    Write-Host "  You may need to wait a bit longer or check: docker-compose logs" -ForegroundColor Yellow
}

# Navigate to server directory for database setup
Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Yellow
$serverDir = Join-Path (Split-Path -Parent $deployDir) "app\server"

if (Test-Path $serverDir) {
    Push-Location $serverDir
    
    # Check if pnpm is installed
    $pnpmInstalled = Get-Command pnpm -ErrorAction SilentlyContinue
    if ($pnpmInstalled) {
        Write-Host "Running Prisma migrations..." -ForegroundColor Yellow
        pnpm prisma migrate deploy
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database migrations completed" -ForegroundColor Green
            
            # Ask if user wants to seed database
            $seed = Read-Host "Seed database with demo data? (y/N)"
            if ($seed -eq "y" -or $seed -eq "Y") {
                Write-Host "Seeding database..." -ForegroundColor Yellow
                pnpm prisma db seed
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✓ Database seeded successfully" -ForegroundColor Green
                } else {
                    Write-Host "⚠ Database seeding failed" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "⚠ Database migration failed" -ForegroundColor Yellow
            Write-Host "  You may need to run migrations manually" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ pnpm not found. Please run migrations manually:" -ForegroundColor Yellow
        Write-Host "  cd app/server && pnpm prisma migrate deploy" -ForegroundColor Yellow
    }
    
    Pop-Location
} else {
    Write-Host "⚠ Server directory not found, skipping database setup" -ForegroundColor Yellow
}

# Print success message and next steps
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Setup Complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services running:" -ForegroundColor Yellow
Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "  Redis:      localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start backend server:" -ForegroundColor White
Write-Host "     cd app/server && pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Start frontend client:" -ForegroundColor White
Write-Host "     cd app/client && pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Open your browser:" -ForegroundColor White
Write-Host "     Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "     Backend:  http://localhost:5000/api/v1" -ForegroundColor Gray
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  docker-compose -f deploy/docker-compose.yml ps      # Check service status" -ForegroundColor Gray
Write-Host "  docker-compose -f deploy/docker-compose.yml logs    # View logs" -ForegroundColor Gray
Write-Host "  docker-compose -f deploy/docker-compose.yml down    # Stop services" -ForegroundColor Gray
Write-Host ""
Write-Host "For deployment, see: deploy/README.md" -ForegroundColor Cyan
Write-Host ""
