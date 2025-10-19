# 🐳 Docker Deployment Guide - Restaurant Management System

> **Comprehensive documentation for deploying the Restaurant Management System using Docker**

## 📑 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Architecture](#-architecture)
- [Configuration](#-configuration)
- [Commands Reference](#-commands-reference)
- [Development Workflow](#-development-workflow)
- [Production Deployment](#-production-deployment)
- [Database Management](#-database-management)
- [Monitoring & Logs](#-monitoring--logs)
- [Troubleshooting](#-troubleshooting)
- [Performance Optimization](#-performance-optimization)
- [Security](#-security)
- [CI/CD](#-cicd)

---

## 🚀 Quick Start

### Step 1: Prerequisites Check

```powershell
# Verify Docker installation
docker --version  # Should be 20.10+
docker-compose --version  # Should be v2+
```

### Step 2: Setup Environment

```powershell
# Clone repository
git clone <your-repo-url>
cd restaurant-management

# Create environment file (Windows PowerShell)
.\docker.ps1 env

# Or on Linux/Mac
./docker.sh env
# or
make env
```

### Step 3: Configure .env

Edit `.env` file and update these critical values:

```env
# MUST CHANGE in production!
POSTGRES_PASSWORD=your-strong-password-here
JWT_SECRET=your-super-secret-32-chars-minimum

# Optional customization
POSTGRES_DB=restaurant_db
CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Generate secure JWT secret:**

```powershell
# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Linux/Mac
openssl rand -base64 32
```

### Step 4: Start Application

**Development Mode (with hot reload):**

```powershell
# Windows
.\docker.ps1 dev

# Linux/Mac
./docker.sh dev
# or
make dev
```

**Production Mode:**

```powershell
# Windows
.\docker.ps1 prod

# Linux/Mac
./docker.sh prod
# or
make prod
```

### Step 5: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

🎉 **That's it! You're ready to go.**

---

## 📋 Prerequisites

### Required Software

| Software | Minimum Version | Download |
|----------|----------------|----------|
| Docker Engine | 20.10+ | [Get Docker](https://docs.docker.com/get-docker/) |
| Docker Compose | v2+ | Included with Docker Desktop |
| Git | Any recent | [Get Git](https://git-scm.com/) |

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 10GB free space minimum
- **CPU**: 2 cores minimum, 4 cores recommended
- **OS**: Windows 10/11, macOS 10.15+, or Linux

### Port Requirements

Ensure these ports are available:

- `3000` - Frontend (Next.js)
- `5000` - Backend (Express)
- `5432` - PostgreSQL
- `6379` - Redis
- `80` - Nginx HTTP (optional)
- `443` - Nginx HTTPS (optional)

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Internet / Users                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
            ┌───────────▼───────────┐
            │  Nginx (Optional)     │
            │  Reverse Proxy        │
            │  Port 80/443          │
            └───────┬───────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
┌───────▼────────┐    ┌───────▼────────┐
│  Next.js       │    │  Express       │
│  Frontend      │    │  Backend       │
│  Port 3000     │    │  Port 5000     │
└────────────────┘    └───────┬────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼──────┐    ┌──────▼──────┐
            │ PostgreSQL   │    │   Redis     │
            │ Port 5432    │    │   Port 6379 │
            └──────────────┘    └─────────────┘
```

### Container Communication

All services communicate via the `restaurant_network` Docker bridge network:

- **Client → Server**: API calls and WebSocket connections
- **Server → PostgreSQL**: Database queries via Prisma ORM
- **Server → Redis**: Caching and session storage
- **Nginx → Client/Server**: Reverse proxy routing (optional)

### Multi-Stage Builds

Both client and server use optimized multi-stage builds:

1. **Dependencies Stage**: Install packages with cache mounts
2. **Builder Stage**: Build application (TypeScript → JavaScript)
3. **Runner Stage**: Minimal runtime image with only necessary files

**Benefits:**
- Smaller image sizes (~70% reduction)
- Faster builds with layer caching
- Enhanced security (no build tools in production)

---

## ⚙️ Configuration

### Environment Variables

Complete reference of all environment variables:

#### Database Configuration

```env
POSTGRES_USER=restaurant_admin        # Database username
POSTGRES_PASSWORD=restaurant_password # ⚠️ CHANGE IN PRODUCTION
POSTGRES_DB=restaurant_db             # Database name
POSTGRES_PORT=5432                    # PostgreSQL port
```

#### Redis Configuration

```env
REDIS_PORT=6379                       # Redis port
```

#### Server Configuration

```env
NODE_ENV=production                   # Environment mode
SERVER_PORT=5000                      # Backend port
API_VERSION=v1                        # API version prefix
API_BASE_URL=http://localhost:5000    # Backend base URL
```

#### Client Configuration

```env
CLIENT_PORT=3000                              # Frontend port
CLIENT_URL=http://localhost:3000              # Frontend URL (for CORS)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1  # API endpoint (public)
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000  # WebSocket URL (public)
```

#### JWT Configuration

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production  # ⚠️ CHANGE
JWT_EXPIRES_IN=15m                    # Access token lifetime
JWT_REFRESH_EXPIRES_IN=7d             # Refresh token lifetime
```

#### Nginx Configuration (Optional)

```env
NGINX_HTTP_PORT=80                    # HTTP port
NGINX_HTTPS_PORT=443                  # HTTPS port
```

### Docker Compose Profiles

- **Default**: Runs client, server, postgres, redis
- **nginx** (`--profile nginx`): Adds Nginx reverse proxy

```bash
# Start with Nginx
docker-compose --profile nginx up -d
```

---

## 📟 Commands Reference

### Management Scripts

#### Windows (PowerShell) - `docker.ps1`

```powershell
# Environment
.\docker.ps1 env              # Create .env file

# Development
.\docker.ps1 dev              # Start dev environment
.\docker.ps1 dev-logs         # View dev logs
.\docker.ps1 dev-down         # Stop dev environment

# Production
.\docker.ps1 prod             # Start production
.\docker.ps1 prod-nginx       # Start with Nginx
.\docker.ps1 prod-logs        # View logs
.\docker.ps1 prod-down        # Stop production

# Building
.\docker.ps1 build            # Build all images
.\docker.ps1 build-client     # Build client only
.\docker.ps1 build-server     # Build server only
.\docker.ps1 rebuild          # Rebuild without cache

# Container Management
.\docker.ps1 logs             # View all logs
.\docker.ps1 logs-client      # Client logs
.\docker.ps1 logs-server      # Server logs
.\docker.ps1 logs-db          # Database logs
.\docker.ps1 ps               # Show containers
.\docker.ps1 status           # Container status + resources
.\docker.ps1 restart          # Restart all
.\docker.ps1 restart-server   # Restart server
.\docker.ps1 restart-client   # Restart client

# Database
.\docker.ps1 db-migrate       # Run migrations
.\docker.ps1 db-seed          # Seed database
.\docker.ps1 db-reset         # Reset database (⚠️ destructive)
.\docker.ps1 db-studio        # Open Prisma Studio
.\docker.ps1 db-backup        # Backup to backup.sql
.\docker.ps1 db-restore       # Restore from backup.sql

# Shell Access
.\docker.ps1 shell-server     # Server container shell
.\docker.ps1 shell-client     # Client container shell
.\docker.ps1 shell-db         # PostgreSQL shell

# Cleanup
.\docker.ps1 clean            # Stop and remove containers
.\docker.ps1 clean-all        # Remove containers + volumes (⚠️)
.\docker.ps1 prune            # Clean unused Docker resources
```

#### Linux/Mac - `docker.sh` or `Makefile`

```bash
# All commands are the same, replace .\docker.ps1 with:
./docker.sh <command>
# or
make <command>
```

### Docker Compose Direct Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose up -d --build
docker-compose --profile nginx up -d --build  # With Nginx
docker-compose logs -f
docker-compose down

# Specific services
docker-compose restart server
docker-compose logs -f client
docker-compose exec server sh
```

---

## 💻 Development Workflow

### Starting Development Environment

```powershell
# 1. Start all services
.\docker.ps1 dev

# 2. Check status
.\docker.ps1 status

# 3. View logs (optional)
.\docker.ps1 logs
```

### Hot Reload

Both client and server support hot reload in development mode:

- **Client**: Changes to `client/src/` are automatically reflected
- **Server**: Changes to `server/src/` trigger automatic restart
- **Database Schema**: Run `.\docker.ps1 db-migrate` after Prisma schema changes

### Development Features

- **Volume Mounts**: Source code mounted for live editing
- **No Build Step**: Changes applied instantly
- **Debug Friendly**: Full logs and error traces
- **Database Persistence**: Data retained between restarts

### Making Changes

```powershell
# 1. Edit files in your IDE
# client/src/* or server/src/*

# 2. Changes auto-reload

# 3. If dependencies change, rebuild:
.\docker.ps1 dev-down
.\docker.ps1 build
.\docker.ps1 dev
```

### Database Changes

```powershell
# 1. Edit prisma/schema.prisma

# 2. Create migration
.\docker.ps1 shell-server
pnpm prisma:migrate

# 3. Or from host (if migrations mounted)
docker-compose -f docker-compose.dev.yml exec server pnpm prisma:migrate
```

---

## 🚀 Production Deployment

### Local Production Testing

```powershell
# 1. Build production images
.\docker.ps1 build

# 2. Start production stack
.\docker.ps1 prod

# 3. Verify services are healthy
.\docker.ps1 status

# 4. Check logs for errors
.\docker.ps1 logs
```

### Production with Nginx

```powershell
# Start with Nginx reverse proxy
.\docker.ps1 prod-nginx

# Access via Nginx
# http://localhost (port 80)
```

### SSL/HTTPS Configuration

1. **Obtain SSL Certificate**
   - Use Let's Encrypt: `certbot certonly --standalone -d yourdomain.com`
   - Or use your certificate provider

2. **Place Certificates**
   ```bash
   mkdir -p nginx/ssl
   cp /path/to/cert.pem nginx/ssl/
   cp /path/to/key.pem nginx/ssl/
   ```

3. **Update nginx.conf**
   - Uncomment HTTPS server block in `nginx/nginx.conf`
   - Update `server_name` with your domain

4. **Restart Nginx**
   ```powershell
   docker-compose restart nginx
   ```

### Environment Variables for Production

Update `.env` with production values:

```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
POSTGRES_PASSWORD=<strong-random-password>
JWT_SECRET=<strong-random-secret-32+chars>
```

### Health Checks

All services include health checks:

- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping` command
- **Server**: HTTP GET to `/health` endpoint
- **Client**: HTTP GET to root `/` (Next.js page)

Monitor health:

```powershell
docker ps  # Check HEALTH column
.\docker.ps1 status
```

---

## 🗄️ Database Management

### Running Migrations

```powershell
# Automatically run on container start
# Or manually:
.\docker.ps1 db-migrate
```

### Seeding Database

```powershell
# Seed with initial data
.\docker.ps1 db-seed
```

### Backup Database

```powershell
# Backup to backup.sql
.\docker.ps1 db-backup

# Manual backup
docker-compose exec postgres pg_dump -U restaurant_admin restaurant_db > backup_$(date +%Y%m%d).sql
```

### Restore Database

```powershell
# Restore from backup.sql
.\docker.ps1 db-restore

# Manual restore
Get-Content backup.sql | docker-compose exec -T postgres psql -U restaurant_admin restaurant_db
```

### Reset Database (⚠️ Destructive)

```powershell
# Drops all data and re-runs migrations
.\docker.ps1 db-reset
```

### Prisma Studio

```powershell
# Open visual database editor
.\docker.ps1 db-studio
# Access at http://localhost:5555
```

### Direct Database Access

```powershell
# PostgreSQL shell
.\docker.ps1 shell-db

# Inside PostgreSQL shell
\dt              # List tables
\d table_name    # Describe table
SELECT * FROM users LIMIT 10;
\q               # Quit
```

### Data Persistence

Data is stored in Docker volumes:

- `postgres_data` - Production database
- `postgres_dev_data` - Development database
- `redis_data` - Redis persistence

Volumes persist even when containers are removed (unless using `docker-compose down -v`).

---

## 📊 Monitoring & Logs

### Viewing Logs

```powershell
# All services
.\docker.ps1 logs

# Specific service
.\docker.ps1 logs-server
.\docker.ps1 logs-client
.\docker.ps1 logs-db

# Docker Compose
docker-compose logs -f [service_name]
docker-compose logs --tail=100 server
```

### Container Status

```powershell
# List containers
.\docker.ps1 ps

# Detailed status + resource usage
.\docker.ps1 status

# Docker stats (live resource monitor)
docker stats
```

### Resource Monitoring

```powershell
# CPU, Memory, Network, Disk I/O
docker stats

# Specific container
docker stats restaurant_server

# Save stats to file
docker stats --no-stream > stats.txt
```

### Log Files

Server logs are persisted to `./server/logs/` directory:

```powershell
# View application logs
ls ./server/logs
cat ./server/logs/app.log
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:

```powershell
# Check what's using the port
netstat -ano | findstr :3000

# Option 1: Kill the process
taskkill /PID <PID> /F

# Option 2: Change port in .env
CLIENT_PORT=3001
```

#### 2. Database Connection Failed

**Error**: `ECONNREFUSED` or `Can't reach database server`

**Solutions**:

```powershell
# Check if PostgreSQL is healthy
docker ps  # Look for health status

# Check database logs
.\docker.ps1 logs-db

# Restart database
docker-compose restart postgres

# Verify DATABASE_URL format
postgresql://user:password@postgres:5432/database?schema=public
```

#### 3. Container Won't Start

**Solutions**:

```powershell
# Check logs
.\docker.ps1 logs-server

# Rebuild without cache
.\docker.ps1 rebuild

# Remove and recreate
.\docker.ps1 clean
.\docker.ps1 prod
```

#### 4. Hot Reload Not Working (Development)

**Solutions**:

```powershell
# Ensure using dev compose file
.\docker.ps1 dev

# Check volume mounts
docker inspect restaurant_server_dev | grep Mounts

# Restart dev environment
.\docker.ps1 dev-down
.\docker.ps1 dev
```

#### 5. Build Failures

**Solutions**:

```powershell
# Clear Docker build cache
docker builder prune -af

# Check .dockerignore is not excluding needed files
cat client\.dockerignore
cat server\.dockerignore

# Build with verbose output
docker-compose build --progress=plain
```

#### 6. Out of Disk Space

**Solutions**:

```powershell
# Check disk usage
docker system df

# Remove unused data
.\docker.ps1 prune

# Remove all stopped containers, unused images
docker system prune -a

# Remove specific volumes (⚠️ data loss)
docker volume rm <volume_name>
```

### Debug Mode

```powershell
# Server debug mode
docker-compose exec server sh
cd /app
ls -la
cat package.json
pnpm --version

# Client debug mode
docker-compose exec client sh
cd /app
ls -la
```

### Network Issues

```powershell
# Inspect network
docker network inspect restaurant_network

# Test connectivity between containers
docker-compose exec client ping server
docker-compose exec server ping postgres
```

### Clean Slate Approach

```powershell
# Nuclear option: remove everything and start fresh
.\docker.ps1 clean-all
docker system prune -a --volumes
.\docker.ps1 prod
```

---

## ⚡ Performance Optimization

### Build Optimization

1. **Use Build Cache**
   ```powershell
   # docker-compose.yml already configured with cache_from
   docker-compose build
   ```

2. **Multi-stage Builds**
   - Already implemented
   - Reduces final image size by ~70%

3. **Layer Caching**
   - Package files copied before source code
   - Dependencies cached separately

### Runtime Optimization

#### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

#### Connection Pooling

Already configured in DATABASE_URL:

```env
DATABASE_URL=postgresql://...?connect_timeout=10&pool_timeout=10
```

#### Redis Caching

Redis is configured for caching and sessions:

```typescript
// In your code, use Redis for:
- Session storage
- API response caching
- Rate limiting
```

### Nginx Optimization

Already optimized in `nginx/nginx.conf`:

- ✅ Gzip compression enabled
- ✅ Keepalive connections
- ✅ Static file caching (365 days)
- ✅ Rate limiting configured

### Database Optimization

```sql
-- Create indexes (example)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

```powershell
# Analyze query performance
.\docker.ps1 shell-db
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 1;
```

---

## 🔒 Security

### Security Checklist

- ✅ **Non-root Users**: All containers run as non-root
- ✅ **Minimal Base Images**: Using Alpine Linux
- ✅ **No Secrets in Code**: Environment variables only
- ✅ **Security Headers**: Configured in Nginx
- ✅ **Rate Limiting**: Nginx rate limiting enabled
- ✅ **Network Isolation**: Private Docker network
- ✅ **Health Checks**: Automatic restart on failure

### Production Security

#### 1. Change Default Credentials

```env
# ⚠️ CRITICAL: Change these in production!
POSTGRES_PASSWORD=<strong-random-password>
JWT_SECRET=<strong-random-32+chars-secret>
```

#### 2. Enable HTTPS

- Use Let's Encrypt for free SSL
- Configure nginx.conf HTTPS block
- Force HTTPS redirect

#### 3. Firewall Configuration

```bash
# Example: UFW on Ubuntu
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5432/tcp  # Block direct DB access
sudo ufw enable
```

#### 4. Environment Variables

```powershell
# Never commit .env to git
echo .env >> .gitignore

# Use secrets management in production
# - AWS Secrets Manager
# - HashiCorp Vault
# - Docker Secrets
```

#### 5. Regular Updates

```powershell
# Update base images
docker-compose pull
docker-compose up -d --build

# Update dependencies
# In client/ and server/
pnpm update
```

#### 6. Security Scanning

```powershell
# Install Trivy
# https://github.com/aquasecurity/trivy

# Scan images
trivy image restaurant_server:latest
trivy image restaurant_client:latest
```

### Security Headers

Already configured in `nginx/nginx.conf`:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

---

## 🔄 CI/CD

### GitHub Actions Workflow

Located at `.github/workflows/docker-build.yml`:

**Features:**
- Automatic builds on push to `main`/`develop`
- Security scanning with Trivy
- Push to GitHub Container Registry
- Multi-platform builds (optional)

### Manual Registry Push

```powershell
# Login to registry
docker login ghcr.io

# Tag images
docker tag restaurant_server:latest ghcr.io/your-username/restaurant-server:latest
docker tag restaurant_client:latest ghcr.io/your-username/restaurant-client:latest

# Push images
docker push ghcr.io/your-username/restaurant-server:latest
docker push ghcr.io/your-username/restaurant-client:latest
```

### Pull and Deploy

```powershell
# On production server
docker-compose pull
docker-compose up -d
```

---

## 📚 Additional Resources

### Official Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Tools & Extensions

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [VS Code Docker Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
- [Portainer](https://www.portainer.io/) - Docker management UI
- [ctop](https://github.com/bcicen/ctop) - Container monitoring

### Best Practices

1. **Use .dockerignore** - Reduce build context size
2. **Multi-stage Builds** - Smaller images
3. **Layer Caching** - Faster builds
4. **Health Checks** - Automatic recovery
5. **Volume Mounts** - Data persistence
6. **Environment Variables** - Configuration management
7. **Non-root Users** - Enhanced security
8. **Logging** - Centralized log management

---

## 🆘 Getting Help

If you encounter issues:

1. **Check Logs**: `.\docker.ps1 logs`
2. **Verify Status**: `.\docker.ps1 status`
3. **Review Configuration**: Check `.env` file
4. **Consult Troubleshooting**: See [Troubleshooting](#-troubleshooting) section
5. **Clean Start**: `.\docker.ps1 clean && .\docker.ps1 prod`

---

## 📝 Summary

### Development Quick Commands

```powershell
.\docker.ps1 env       # Setup
.\docker.ps1 dev       # Start
.\docker.ps1 logs      # Monitor
.\docker.ps1 dev-down  # Stop
```

### Production Quick Commands

```powershell
.\docker.ps1 env          # Setup
.\docker.ps1 prod         # Start
.\docker.ps1 status       # Check
.\docker.ps1 prod-down    # Stop
```

### Key Files

| File | Purpose |
|------|---------|
| `.env` | Environment configuration |
| `docker-compose.yml` | Production setup |
| `docker-compose.dev.yml` | Development setup |
| `client/Dockerfile` | Client production build |
| `server/Dockerfile` | Server production build |
| `nginx/nginx.conf` | Reverse proxy config |
| `docker.ps1` / `docker.sh` | Management scripts |

---

**🎉 Happy Deploying!**

*For questions or issues, please open an issue on GitHub.*
