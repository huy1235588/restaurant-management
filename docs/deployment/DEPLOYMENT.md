# Deployment Guide - Digital Ocean (Student Budget Optimized)

This guide covers deploying the Restaurant Management System to Digital Ocean with cost optimization for student graduation projects.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Cost Overview](#cost-overview)
- [Phase 1: Initial Setup](#phase-1-initial-setup)
- [Phase 2: Application Deployment](#phase-2-application-deployment)
- [Phase 3: SSL & Domain](#phase-3-ssl--domain)
- [Phase 4: CI/CD Setup](#phase-4-cicd-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts
1. **Digital Ocean Account**
   - Sign up at https://digitalocean.com
   - Apply for GitHub Student Developer Pack ($200 credit): https://education.github.com/pack
   - Credit lasts 10-16 months for our setup

2. **Cloudflare Account** (Free)
   - Sign up at https://cloudflare.com
   - Used for SSL, CDN, and DDoS protection

3. **GitHub Account**
   - Repository access
   - GitHub Actions enabled

4. **Domain** (Optional, ~$10-15/year)
   - Or use Digital Ocean IP directly
   - Or use free subdomain services

### Local Tools
- SSH client (built-in on Linux/Mac, use PowerShell/WSL on Windows)
- Git
- Text editor

## Cost Overview

### Minimal Setup ($13/month or FREE with student credits)
- **Droplet 2GB RAM**: $12/month
- **Volume 10GB**: $1/month
- **Cloudflare**: $0/month (free tier)
- **Total**: $13/month

### With Student Credits
- $200 credit provides **15+ months** of free hosting
- No credit card charges during credit period
- Set billing alerts to monitor usage

## Phase 1: Initial Setup

### 1.1 Create Digital Ocean Droplet

1. Log in to Digital Ocean dashboard
2. Click "Create" → "Droplets"
3. Configure:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic - $12/month (2GB RAM, 1 vCPU, 50GB SSD)
   - **Datacenter**: Choose nearest region (e.g., Singapore, San Francisco)
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `restaurant-prod`
   - **Enable**: Monitoring (free)
   - **Backups**: Optional (+$2.40/month)

4. Click "Create Droplet"
5. Note your droplet IP address: `xxx.xxx.xxx.xxx`

### 1.2 Create Block Storage Volume

1. In Digital Ocean dashboard: "Manage" → "Volumes"
2. Click "Create Volume"
3. Configure:
   - **Size**: 25GB ($2.50/month) or 10GB ($1/month)
   - **Region**: Same as droplet
   - **Name**: `restaurant-volume`
   - **Attach to**: Select your droplet

4. SSH to droplet and format volume:

```bash
# SSH to droplet
ssh root@xxx.xxx.xxx.xxx

# Format volume (only if new)
sudo mkfs.ext4 /dev/disk/by-id/scsi-0DO_Volume_restaurant-volume

# Create mount point
sudo mkdir -p /mnt/volume

# Mount volume
sudo mount -o discard,defaults /dev/disk/by-id/scsi-0DO_Volume_restaurant-volume /mnt/volume

# Add to fstab for auto-mount
echo '/dev/disk/by-id/scsi-0DO_Volume_restaurant-volume /mnt/volume ext4 defaults,nofail,discard 0 0' | sudo tee -a /etc/fstab

# Create directory structure
sudo mkdir -p /mnt/volume/{postgres,redis,uploads,backups,logs}
sudo chown -R 1000:1000 /mnt/volume
```

### 1.3 Basic Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Set timezone
sudo timedatectl set-timezone Asia/Ho_Chi_Minh  # Change to your timezone

# Set hostname
sudo hostnamectl set-hostname restaurant-prod

# Create deploy user
sudo adduser deploy
sudo usermod -aG sudo deploy

# Copy SSH keys to deploy user
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### 1.4 Security Hardening

```bash
# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Disable SSH password authentication
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 1.5 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add deploy user to docker group
sudo usermod -aG docker deploy

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Configure Docker log rotation
sudo tee /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker

# Verify installation
docker --version
docker compose version
```

### 1.6 Configure Swap (for 2GB RAM)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Set swappiness
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# Verify
free -h
```

## Phase 2: Application Deployment

### 2.1 Clone Repository

```bash
# Switch to deploy user
su - deploy

# Install git
sudo apt install git -y

# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "deploy@restaurant"
cat ~/.ssh/id_ed25519.pub
# Copy this key and add to GitHub: Settings → SSH and GPG keys → New SSH key

# Clone repository
sudo mkdir -p /opt/restaurant
sudo chown deploy:deploy /opt/restaurant
git clone git@github.com:YOUR_USERNAME/restaurant-management.git /opt/restaurant
cd /opt/restaurant
```

### 2.2 Configure Environment Variables

```bash
cd /opt/restaurant

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Create production environment file
cat > .env.production <<EOF
NODE_ENV=production

# Server
PORT=5000
API_VERSION=v1
API_BASE_URL=http://YOUR_DROPLET_IP:5000
CLIENT_URL=http://YOUR_DROPLET_IP:3000

# Database
POSTGRES_USER=restaurant_admin
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=restaurant_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://restaurant_admin:$POSTGRES_PASSWORD@postgres:5432/restaurant_db

# Redis
REDIS_URL=redis://redis:6379
REDIS_PORT=6379

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Storage (Cloudinary)
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
NEXT_PUBLIC_API_URL=http://YOUR_DROPLET_IP:5000
NEXT_PUBLIC_SOCKET_URL=http://YOUR_DROPLET_IP:5000

# GitHub (for docker-compose)
GITHUB_REPOSITORY=YOUR_USERNAME/restaurant-management
EOF

# Secure the file
chmod 600 .env.production

# Create symlink for easier access
ln -sf .env.production .env

echo "Generated secrets:"
echo "JWT_SECRET: $JWT_SECRET"
echo "POSTGRES_PASSWORD: $POSTGRES_PASSWORD"
echo "Save these secrets securely!"
```

### 2.3 Build and Start Services

```bash
cd /opt/restaurant

# Build Docker images locally (first time)
docker build -t restaurant-server:prod -f app/server/Dockerfile app/server
docker build -t restaurant-client:prod -f app/client/Dockerfile app/client \
  --build-arg NEXT_PUBLIC_API_URL=http://YOUR_DROPLET_IP:5000

# Tag images for docker-compose
docker tag restaurant-server:prod ghcr.io/$GITHUB_REPOSITORY/server:latest
docker tag restaurant-client:prod ghcr.io/$GITHUB_REPOSITORY/client:latest

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 2.4 Database Setup

```bash
# Wait for PostgreSQL to be ready
sleep 20

# Run migrations (automatically done by entrypoint, but can be done manually)
docker compose -f docker-compose.prod.yml exec server npx prisma migrate deploy

# Seed database (OPTIONAL - only if you need sample data)
# Note: Seeding is skipped in production by default for security
# Run manually if needed:
docker compose -f docker-compose.prod.yml exec server pnpm prisma:seed

# Create initial backup
sudo mkdir -p /mnt/volume/backups/postgres
chmod +x ./scripts/backup-db.sh
./scripts/backup-db.sh
```

### 2.5 Install Caddy (Reverse Proxy)

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Copy Caddyfile
sudo cp /opt/restaurant/Caddyfile /etc/caddy/Caddyfile

# Validate configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Start Caddy
sudo systemctl enable caddy
sudo systemctl start caddy

# Check status
sudo systemctl status caddy
```

### 2.6 Verify Deployment

```bash
# Test health endpoints
curl http://localhost:3000/health
curl http://localhost:5000/api/health

# Test from external
curl http://YOUR_DROPLET_IP

# Run smoke tests
chmod +x ./scripts/smoke-test.sh
./scripts/smoke-test.sh
```

## Phase 3: SSL & Domain

### 3.1 Cloudflare Setup (Recommended)

1. **Add Site to Cloudflare**
   - Log in to Cloudflare
   - Click "Add a Site"
   - Enter your domain
   - Select Free plan

2. **Update Nameservers**
   - Copy Cloudflare nameservers
   - Update at your domain registrar
   - Wait for propagation (up to 24 hours)

3. **Create DNS Records**
   - Type: A
   - Name: @ (or subdomain)
   - Content: YOUR_DROPLET_IP
   - Proxy status: Proxied (orange cloud)
   - TTL: Auto

4. **SSL/TLS Configuration**
   - SSL/TLS → Overview → Set to "Full" or "Flexible"
   - SSL/TLS → Edge Certificates:
     - Enable "Always Use HTTPS"
     - Enable "Automatic HTTPS Rewrites"
     - Set Minimum TLS Version: 1.2
   - Enable HSTS (optional):
     - Max Age: 12 months
     - Include subdomains: Yes

5. **Firewall & Security**
   - Security → WAF → Enable
   - Create rate limiting rule: 100 requests/minute
   - Enable Bot Fight Mode

6. **Caching**
   - Caching → Configuration:
     - Caching Level: Standard
     - Browser Cache TTL: 4 hours
   - Create Page Rules for static assets:
     - URL: `yourdomain.com/_next/static/*`
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 month

### 3.2 Alternative: Let's Encrypt (without domain)

If using IP directly:

```bash
# Update Caddyfile for HTTPS
sudo tee /etc/caddy/Caddyfile <<EOF
{
    admin off
}

YOUR_DROPLET_IP {
    # Same configuration as before
    handle /api/* {
        reverse_proxy localhost:5000
    }
    # ... rest of config
}
EOF

sudo systemctl reload caddy
```

## Phase 4: CI/CD Setup

### 4.1 GitHub Secrets Configuration

1. Go to repository: Settings → Secrets and variables → Actions
2. Add secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DROPLET_IP` | `xxx.xxx.xxx.xxx` | Your droplet IP |
| `DROPLET_USER` | `deploy` | SSH user |
| `DROPLET_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Private SSH key |
| `JWT_SECRET` | Generated secret | From .env.production |
| `POSTGRES_PASSWORD` | Generated password | From .env.production |
| `CLOUDINARY_API_SECRET` | Your API secret | From Cloudinary |
| `NEXT_PUBLIC_API_URL` | `http://YOUR_IP:5000` | Frontend API URL |
| `NEXT_PUBLIC_SOCKET_URL` | `http://YOUR_IP:5000` | Frontend Socket URL |
| `APP_URL` | `http://YOUR_DOMAIN` | Application URL |

### 4.2 Make Scripts Executable on Server

```bash
ssh deploy@YOUR_DROPLET_IP
cd /opt/restaurant
chmod +x scripts/*.sh
```

### 4.3 Test Automated Deployment

1. Make a small change to the code
2. Commit and push to main branch
3. Check GitHub Actions: Repository → Actions
4. Monitor deployment progress
5. Verify application updates

### 4.4 Setup Automated Backups

```bash
ssh deploy@YOUR_DROPLET_IP

# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/restaurant/scripts/backup-db.sh >> /mnt/volume/logs/backup.log 2>&1

# Verify cron job
crontab -l
```

## Monitoring

### Digital Ocean Dashboard

1. Droplet → Monitoring
2. View metrics: CPU, Memory, Disk, Network
3. Create alert policies:
   - CPU > 80% for 10 minutes
   - Memory > 90% for 5 minutes
   - Disk > 85%

### Log Monitoring

```bash
# Application logs
docker compose -f /opt/restaurant/docker-compose.prod.yml logs -f

# Caddy logs
sudo tail -f /var/log/caddy/access.log

# Backup logs
tail -f /mnt/volume/logs/backup.log

# System logs
sudo journalctl -u docker -f
```

### Health Checks

```bash
# Run smoke tests
cd /opt/restaurant
./scripts/smoke-test.sh

# Check container health
docker compose -f docker-compose.prod.yml ps

# Check resource usage
docker stats

# Check disk space
df -h
```

## Troubleshooting

### Application Won't Start

```bash
# Check container logs
docker compose -f /opt/restaurant/docker-compose.prod.yml logs

# Check specific service
docker compose logs server
docker compose logs client

# Restart services
docker compose -f /opt/restaurant/docker-compose.prod.yml restart

# Rebuild and restart
docker compose -f /opt/restaurant/docker-compose.prod.yml up -d --build
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker exec restaurant_postgres pg_isready -U restaurant_admin

# Check database logs
docker logs restaurant_postgres

# Connect to database
docker exec -it restaurant_postgres psql -U restaurant_admin -d restaurant_db

# Run migrations manually
docker compose exec server npx prisma migrate deploy
```

### Out of Memory

```bash
# Check memory usage
free -h
docker stats

# Restart services to free memory
docker compose restart

# Increase swap if needed
sudo swapoff /swapfile
sudo fallocate -l 4G /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### SSL Issues

- **Cloudflare**: Check SSL/TLS mode (Full or Flexible)
- **Let's Encrypt**: Check Caddy logs: `sudo journalctl -u caddy`
- **Certificate expired**: Caddy auto-renews, check configuration

### Deployment Failed

```bash
# Check GitHub Actions logs
# Manual deployment
cd /opt/restaurant
git pull origin main
./scripts/deploy.sh

# Rollback if needed
./scripts/rollback.sh
```

## Cost Optimization Tips

1. **Use Student Credits Wisely**
   - Monitor billing dashboard weekly
   - Set up billing alerts
   - Turn off unused services

2. **Optimize Resource Usage**
   - Monitor container memory limits
   - Use image caching
   - Enable compression

3. **Free Tier Services**
   - Cloudflare: CDN, SSL, DDoS protection
   - Cloudinary: Image storage and optimization
   - GitHub Actions: 2000 minutes/month

4. **Scaling Path**
   - Start with 2GB droplet
   - Upgrade to 4GB ($24/month) if needed
   - Add managed database ($15/month) for production

## Backup & Recovery

### Manual Backup

```bash
cd /opt/restaurant
./scripts/backup-db.sh
```

### Restore from Backup

```bash
# List backups
ls -lh /mnt/volume/backups/postgres/

# Restore specific backup
./scripts/restore-db.sh /mnt/volume/backups/postgres/backup_20250115_020000.sql.gz
```

### Volume Snapshot

1. Digital Ocean → Volumes → restaurant-volume
2. Click "Take Snapshot"
3. Name: `restaurant-snapshot-YYYYMMDD`
4. Wait for completion

### Disaster Recovery

If droplet fails:
1. Create new droplet
2. Attach volume snapshot
3. Run Phase 1 setup
4. Deploy application
5. Restore from latest backup

Recovery time: ~30-60 minutes

## Next Steps

1. **Custom Domain**: Configure your domain with Cloudflare
2. **Monitoring**: Set up advanced monitoring if needed
3. **Backups**: Verify automated backups working
4. **Documentation**: Prepare for thesis presentation
5. **Testing**: Load test with expected user count

## Support Resources

- Digital Ocean Docs: https://docs.digitalocean.com
- Cloudflare Docs: https://developers.cloudflare.com
- Docker Docs: https://docs.docker.com
- Caddy Docs: https://caddyserver.com/docs

## Success Checklist

- [ ] Droplet created and configured
- [ ] Volume attached and mounted
- [ ] Security hardened (firewall, fail2ban, SSH)
- [ ] Docker installed and running
- [ ] Application deployed and healthy
- [ ] Caddy reverse proxy configured
- [ ] SSL certificate working (if using domain)
- [ ] CI/CD pipeline functional
- [ ] Automated backups scheduled
- [ ] Monitoring alerts configured
- [ ] Documentation complete
- [ ] Application accessible and tested

**Estimated Total Time**: 4-6 hours for initial setup

**Monthly Cost**: $13-20 (or FREE with student credits for 15+ months)
