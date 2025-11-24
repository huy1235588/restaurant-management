# Quick Reference - DigitalOcean Deployment

Tài liệu tham khảo nhanh các lệnh thường dùng khi quản lý deployment trên DigitalOcean VPS.

---

## 📋 Mục lục

- [SSH & Server Access](#ssh--server-access)
- [Docker Commands](#docker-commands)
- [Docker Compose Commands](#docker-compose-commands)
- [Database Operations](#database-operations)
- [Logs & Monitoring](#logs--monitoring)
- [Deployment Operations](#deployment-operations)
- [Backup & Restore](#backup--restore)
- [System Maintenance](#system-maintenance)
- [Troubleshooting](#troubleshooting)

---

## SSH & Server Access

### Kết nối SSH
```bash
# Kết nối với SSH key
ssh root@YOUR_DROPLET_IP

# Kết nối với custom port
ssh -p 2222 root@YOUR_DROPLET_IP

# Kết nối với private key cụ thể
ssh -i ~/.ssh/id_rsa_digitalocean root@YOUR_DROPLET_IP
```

### Copy files qua SSH
```bash
# Copy file từ local lên server
scp file.txt root@YOUR_DROPLET_IP:/opt/restaurant-management/

# Copy file từ server về local
scp root@YOUR_DROPLET_IP:/opt/restaurant-management/file.txt .

# Copy thư mục (recursive)
scp -r folder/ root@YOUR_DROPLET_IP:/opt/restaurant-management/
```

### SSH Tunnel (truy cập database từ xa)
```bash
# Forward port PostgreSQL qua SSH tunnel
ssh -L 5433:localhost:5432 root@YOUR_DROPLET_IP

# Sau đó connect với: localhost:5433
```

---

## Docker Commands

### Container Management
```bash
# Liệt kê containers đang chạy
docker ps

# Liệt kê tất cả containers (kể cả stopped)
docker ps -a

# Start container
docker start restaurant_server_prod

# Stop container
docker stop restaurant_server_prod

# Restart container
docker restart restaurant_server_prod

# Xóa container
docker rm restaurant_server_prod

# Xóa container đang chạy (force)
docker rm -f restaurant_server_prod
```

### Image Management
```bash
# Liệt kê images
docker images

# Xóa image
docker rmi IMAGE_ID

# Xóa tất cả unused images
docker image prune -a

# Build image
docker build -t restaurant-server:latest .
```

### Container Logs
```bash
# Xem logs
docker logs restaurant_server_prod

# Follow logs (real-time)
docker logs -f restaurant_server_prod

# Xem 100 dòng cuối
docker logs --tail 100 restaurant_server_prod

# Logs với timestamp
docker logs -t restaurant_server_prod
```

### Execute Commands trong Container
```bash
# Chạy bash trong container
docker exec -it restaurant_server_prod bash

# Chạy command một lần
docker exec restaurant_server_prod ls -la

# Chạy với user khác
docker exec -u root restaurant_server_prod whoami
```

### System Cleanup
```bash
# Xóa tất cả stopped containers
docker container prune

# Xóa unused images
docker image prune

# Xóa unused volumes
docker volume prune

# Cleanup toàn bộ (containers, images, networks, volumes)
docker system prune -a --volumes
```

---

## Docker Compose Commands

### Service Management
```bash
# Di chuyển vào thư mục deploy
cd /opt/restaurant-management/deploy

# Start tất cả services
docker-compose -f docker-compose.prod.yml up -d

# Start services với override
docker-compose -f docker-compose.prod.yml -f digitalocean/docker-compose.override.yml up -d

# Stop tất cả services
docker-compose -f docker-compose.prod.yml down

# Restart tất cả services
docker-compose -f docker-compose.prod.yml restart

# Restart một service cụ thể
docker-compose -f docker-compose.prod.yml restart server
```

### Logs
```bash
# Xem logs tất cả services
docker-compose -f docker-compose.prod.yml logs

# Follow logs
docker-compose -f docker-compose.prod.yml logs -f

# Logs của một service cụ thể
docker-compose -f docker-compose.prod.yml logs -f server

# Logs với timestamp và số dòng
docker-compose -f docker-compose.prod.yml logs --tail 50 -t server
```

### Build & Update
```bash
# Build lại images
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build server

# Build without cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Recreate containers
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### Status & Info
```bash
# Xem status của services
docker-compose -f docker-compose.prod.yml ps

# Xem resource usage
docker-compose -f docker-compose.prod.yml top

# Validate compose file
docker-compose -f docker-compose.prod.yml config
```

---

## Database Operations

### PostgreSQL Access
```bash
# Connect vào PostgreSQL container
docker exec -it restaurant_postgres_prod psql -U restaurant_admin -d restaurant_db

# Chạy query từ command line
docker exec -it restaurant_postgres_prod psql -U restaurant_admin -d restaurant_db -c "SELECT COUNT(*) FROM \"User\";"

# List databases
docker exec -it restaurant_postgres_prod psql -U restaurant_admin -c "\l"

# List tables
docker exec -it restaurant_postgres_prod psql -U restaurant_admin -d restaurant_db -c "\dt"
```

### Prisma Migrations

#### ✅ Recommended: Use Migration Scripts
```bash
# Run safe migrations
bash /opt/restaurant-management/deploy/digitalocean/scripts/migrate.sh

# Troubleshoot migration issues
bash /opt/restaurant-management/deploy/digitalocean/scripts/troubleshoot-migration.sh
```

#### Manual Migration Commands
```bash
# Source .env file first
cd /opt/restaurant-management/deploy
export $(cat .env | grep -v '^#' | xargs)

# Run migrations with explicit DATABASE_URL
export DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"

docker exec \
  -e DATABASE_URL="$DB_URL" \
  restaurant_server_prod \
  npx prisma migrate deploy --schema prisma/schema.prisma

# Check migration status
docker exec \
  -e DATABASE_URL="$DB_URL" \
  restaurant_server_prod \
  npx prisma migrate status --schema prisma/schema.prisma

# Generate Prisma Client
docker exec restaurant_server_prod npx prisma generate

# ⚠️ DANGER: Reset database (development only!)
docker exec \
  -e DATABASE_URL="$DB_URL" \
  restaurant_server_prod \
  npx prisma migrate reset --force
```

### Redis Access
```bash
# Connect vào Redis container
docker exec -it restaurant_redis_prod redis-cli

# With password
docker exec -it restaurant_redis_prod redis-cli -a YOUR_REDIS_PASSWORD

# Ping Redis
docker exec restaurant_redis_prod redis-cli -a YOUR_REDIS_PASSWORD ping

# Flush all data (DANGER!)
docker exec restaurant_redis_prod redis-cli -a YOUR_REDIS_PASSWORD FLUSHALL

# Get all keys
docker exec restaurant_redis_prod redis-cli -a YOUR_REDIS_PASSWORD KEYS "*"
```

---

## Logs & Monitoring

### Application Logs
```bash
# Backend logs
docker logs -f restaurant_server_prod

# Frontend logs
docker logs -f restaurant_client_prod

# Database logs
docker logs -f restaurant_postgres_prod

# Caddy logs
docker logs -f restaurant_caddy_prod
```

### System Logs
```bash
# System logs
sudo tail -f /var/log/syslog

# Auth logs (SSH attempts)
sudo tail -f /var/log/auth.log

# Firewall logs
sudo tail -f /var/log/ufw.log
```

### Resource Monitoring
```bash
# CPU và Memory usage
docker stats

# Disk usage
df -h

# Docker disk usage
docker system df

# Check specific volume size
du -sh /var/lib/docker/volumes/*

# Process monitoring
htop
# hoặc
top
```

### Health Checks
```bash
# Run health check script
cd /opt/restaurant-management/deploy/digitalocean/scripts
./health-check.sh

# Manual health checks
curl http://localhost:3000/api/health
curl http://localhost:5000/api/v1/health

# Check service status
systemctl status docker
```

---

## Deployment Operations

### Deploy Application
```bash
# Run deployment script (recommended)
cd /opt/restaurant-management/deploy/digitalocean/scripts
bash deploy.sh

# Manual deployment steps
cd /opt/restaurant-management
git pull origin main
cd deploy
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Rebuild Images (Fix Prisma Runtime Error)

**Error:** `Cannot find module '@prisma/client-runtime-utils'`

```bash
# 1. Run rebuild script (easiest)
bash /opt/restaurant-management/deploy/digitalocean/scripts/rebuild-images.sh

# Or manual rebuild:
cd /opt/restaurant-management/deploy

# 2. Stop containers
docker compose -f docker-compose.prod.yml stop

# 3. Rebuild images without cache
docker compose -f docker-compose.prod.yml build --no-cache

# 4. Start containers
docker compose -f docker-compose.prod.yml up -d

# 5. Run migrations
bash /opt/restaurant-management/deploy/digitalocean/scripts/migrate.sh

# 6. Check logs
docker logs -f restaurant_server_prod
```

### Environment Variables
```bash
# Edit .env file
cd /opt/restaurant-management/deploy
nano .env

# Reload environment (restart containers)
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Verify env vars loaded
docker exec restaurant_server_prod env | grep NODE_ENV
```

### Git Operations
```bash
# Check current branch
cd /opt/restaurant-management
git branch

# Pull latest changes
git pull origin main

# View recent commits
git log --oneline -10

# Reset to specific commit (DANGER!)
git reset --hard COMMIT_HASH

# Stash local changes
git stash
git pull
git stash pop
```

---

## Backup & Restore

### Create Backup
```bash
# Run backup script
cd /opt/restaurant-management/deploy/digitalocean/scripts
bash backup.sh

# Manual backup
docker exec restaurant_postgres_prod pg_dump -U restaurant_admin restaurant_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### List Backups
```bash
# List all backups
ls -lh /opt/restaurant-management/backups/

# Find recent backups
find /opt/restaurant-management/backups/ -name "*.sql.gz" -mtime -7
```

### Restore Backup
```bash
# Run restore script
cd /opt/restaurant-management/deploy/digitalocean/scripts
./restore.sh /opt/restaurant-management/backups/backup_20241125_030000.sql.gz

# Manual restore
docker exec -i restaurant_postgres_prod psql -U restaurant_admin restaurant_db < backup.sql
```

---

## System Maintenance

### Updates
```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Update Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Update Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Firewall
```bash
# Check firewall status
sudo ufw status verbose

# Allow port
sudo ufw allow 8080/tcp

# Deny port
sudo ufw deny 8080/tcp

# Delete rule
sudo ufw delete allow 8080/tcp

# Disable firewall (DANGER!)
sudo ufw disable

# Enable firewall
sudo ufw enable
```

### Disk Space Management
```bash
# Check disk usage
df -h

# Find large files
sudo du -h / | sort -rh | head -20

# Clean Docker
docker system prune -a --volumes

# Clean APT cache
sudo apt clean
sudo apt autoclean

# Clean old logs
sudo journalctl --vacuum-time=7d
```

### Cron Jobs
```bash
# Edit crontab
crontab -e

# List cron jobs
crontab -l

# View cron logs
grep CRON /var/log/syslog

# Example: Daily backup at 3 AM
0 3 * * * /opt/restaurant-management/deploy/digitalocean/scripts/backup.sh >> /var/log/backup.log 2>&1
```

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs restaurant_server_prod

# Check container status
docker ps -a | grep restaurant

# Inspect container
docker inspect restaurant_server_prod

# Remove and recreate
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Port Conflicts
```bash
# Check what's using port
sudo lsof -i :5000
sudo netstat -tulpn | grep 5000

# Kill process on port
sudo kill -9 PID
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
docker exec -it restaurant_postgres_prod psql -U restaurant_admin -d restaurant_db

# Check database logs
docker logs restaurant_postgres_prod

# Verify DATABASE_URL
docker exec restaurant_server_prod env | grep DATABASE_URL

# Restart database
docker restart restaurant_postgres_prod
```

### Out of Memory
```bash
# Check memory usage
free -h
docker stats

# Add swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### SSL Certificate Issues
```bash
# Check Caddy logs
docker logs restaurant_caddy_prod

# Verify domain points to server
nslookup yourdomain.com

# Test certificate
curl -vI https://yourdomain.com

# Force certificate renewal (Caddy auto-renews)
docker restart restaurant_caddy_prod
```

---

## Useful Aliases

Thêm vào `~/.bashrc` để tạo shortcuts:

```bash
# Docker shortcuts
alias dps='docker ps'
alias dpsa='docker ps -a'
alias dlog='docker logs -f'
alias dexec='docker exec -it'

# Docker Compose shortcuts
alias dc='docker-compose'
alias dcup='docker-compose -f docker-compose.prod.yml up -d'
alias dcdown='docker-compose -f docker-compose.prod.yml down'
alias dclogs='docker-compose -f docker-compose.prod.yml logs -f'

# Application shortcuts
alias app-logs='docker logs -f restaurant_server_prod'
alias app-restart='cd /opt/restaurant-management/deploy && docker-compose -f docker-compose.prod.yml restart'
alias app-deploy='cd /opt/restaurant-management/deploy/digitalocean/scripts && ./deploy.sh'

# Reload aliases
source ~/.bashrc
```

---

## Emergency Procedures

### Complete Restart
```bash
# Stop everything
cd /opt/restaurant-management/deploy
docker-compose -f docker-compose.prod.yml down

# Wait 10 seconds
sleep 10

# Start everything
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker ps
./digitalocean/scripts/health-check.sh
```

### Rollback Deployment
```bash
# Go back to previous commit
cd /opt/restaurant-management
git log --oneline -5
git reset --hard PREVIOUS_COMMIT_HASH

# Rebuild and restart
cd deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Emergency Backup
```bash
# Quick database backup
docker exec restaurant_postgres_prod pg_dump -U restaurant_admin restaurant_db > emergency_backup.sql

# Copy to local machine
scp root@YOUR_DROPLET_IP:/root/emergency_backup.sql .
```

---

**Tip**: Bookmark trang này và giữ terminal window mở để copy-paste commands nhanh! 🚀
