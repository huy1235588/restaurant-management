# Tasks: Digital Ocean Deployment Implementation

## ✅ Code Implementation Status

**All code artifacts have been implemented and are ready for deployment:**

### Completed Implementation (100%)
- [x] Production Docker Compose configuration (`docker-compose.prod.yml`)
- [x] Deployment scripts (`scripts/backup-db.sh`, `deploy.sh`, `rollback.sh`, etc.)
- [x] CI/CD workflows (`.github/workflows/deploy.yml`, `rollback.yml`)
- [x] Reverse proxy configuration (`Caddyfile`)
- [x] Health check endpoints (backend and frontend)
- [x] Environment template (`.env.production.example`)
- [x] Secret generation script (`scripts/generate-secrets.sh`)
- [x] Comprehensive documentation (`docs/DEPLOYMENT.md`, `OPERATIONS.md`, `COST_OPTIMIZATION.md`)
- [x] Quick reference guide (`DEPLOYMENT_QUICK_REFERENCE.md`)
- [x] Implementation summary (`DEPLOYMENT_IMPLEMENTATION_SUMMARY.md`)

**Files Created**: 15 new files, 2 enhanced files
**Lines of Code/Config**: ~3,500+ lines (scripts, configs, docs)
**Documentation**: ~1,700+ lines across 4 guides

### What Remains
The tasks below are **manual deployment steps** that must be executed on Digital Ocean infrastructure. All necessary code, scripts, and configurations are ready to use.

**Estimated Time**: 4-6 hours for first-time manual deployment following `docs/DEPLOYMENT.md`

---

## Phase 1: Infrastructure Setup (Week 1)

### 1.1 Digital Ocean Account & Credits
- [ ] Create Digital Ocean account (or use existing)
- [ ] Apply GitHub Student Developer Pack for $200 credit
- [ ] Verify credit application and available balance
- [ ] Set up billing alerts ($5, $10, $15 thresholds)
- [ ] Add payment method as backup

### 1.2 Droplet Provisioning
- [ ] Create 2GB RAM Basic Droplet (Ubuntu 22.04 LTS)
- [ ] Select nearest datacenter region for optimal latency
- [ ] Add SSH key for authentication (generate if needed)
- [ ] Enable monitoring (free)
- [ ] Optionally enable weekly backups (+20% cost)
- [ ] Note droplet IP address for configuration

### 1.3 Volume Storage Setup
- [ ] Create 25GB Block Storage Volume
- [ ] Attach volume to droplet
- [ ] SSH to droplet and format volume (if new)
- [ ] Mount volume at `/mnt/volume`
- [ ] Add to `/etc/fstab` for automatic mount
- [ ] Create directory structure: `postgres/`, `redis/`, `uploads/`, `backups/`, `logs/`
- [ ] Set proper ownership: `chown -R 1000:1000 /mnt/volume`
- [ ] Verify mount persists after reboot

### 1.4 Basic Server Configuration
- [ ] Update system packages: `apt update && apt upgrade -y`
- [ ] Set proper timezone: `timedatectl set-timezone Asia/Ho_Chi_Minh`
- [ ] Set hostname: `hostnamectl set-hostname restaurant-prod`
- [ ] Create deploy user: `adduser deploy`
- [ ] Add deploy to sudo group: `usermod -aG sudo deploy`
- [ ] Configure sudo without password for deploy user (optional)
- [ ] Copy SSH keys to deploy user

### 1.5 Security Hardening
- [ ] Configure UFW firewall
  ```bash
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw enable
  ```
- [ ] Disable SSH password authentication
  - Edit `/etc/ssh/sshd_config`
  - Set `PasswordAuthentication no`
  - Set `PermitRootLogin no`
  - Restart SSH: `systemctl restart sshd`
- [ ] Install and configure fail2ban
  ```bash
  apt install fail2ban -y
  systemctl enable fail2ban
  systemctl start fail2ban
  ```
- [ ] Configure automatic security updates
  ```bash
  apt install unattended-upgrades -y
  dpkg-reconfigure -plow unattended-upgrades
  ```

### 1.6 Docker Installation
- [ ] Install Docker Engine
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  ```
- [ ] Verify Docker version: `docker --version` (should be 24.0+)
- [ ] Add deploy user to docker group: `usermod -aG docker deploy`
- [ ] Install Docker Compose V2
  ```bash
  apt install docker-compose-plugin -y
  ```
- [ ] Verify Docker Compose: `docker compose version`
- [ ] Enable Docker service: `systemctl enable docker`
- [ ] Configure Docker log rotation in `/etc/docker/daemon.json`
  ```json
  {
    "log-driver": "json-file",
    "log-opts": {
      "max-size": "10m",
      "max-file": "3"
    }
  }
  ```
- [ ] Restart Docker: `systemctl restart docker`

### 1.7 Swap Configuration (for 2GB RAM droplet)
- [ ] Create 2GB swap file
  ```bash
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  ```
- [ ] Add to `/etc/fstab`: `/swapfile none swap sw 0 0`
- [ ] Set swappiness: `sysctl vm.swappiness=10`
- [ ] Make permanent: Add `vm.swappiness=10` to `/etc/sysctl.conf`
- [ ] Verify swap: `free -h`

**Validation**: SSH to droplet, verify Docker runs, volume mounted, firewall active

---

## Phase 2: Application Configuration (Week 1-2)

### 2.1 Repository Setup on Droplet
- [ ] SSH to droplet as deploy user
- [ ] Install git: `apt install git -y`
- [ ] Generate SSH key for GitHub access
  ```bash
  ssh-keygen -t ed25519 -C "deploy@restaurant"
  ```
- [ ] Add public key to GitHub repository (Settings → Deploy Keys)
- [ ] Clone repository: `git clone git@github.com:user/restaurant-management.git /opt/restaurant`
- [ ] Set ownership: `chown -R deploy:deploy /opt/restaurant`
- [ ] Verify repository cloned successfully

### 2.2 Production Environment Configuration
- [ ] Create `.env.production` file in `/opt/restaurant/`
- [ ] Generate strong JWT secret (32+ characters)
  ```bash
  openssl rand -base64 32
  ```
- [ ] Generate strong PostgreSQL password
  ```bash
  openssl rand -base64 32
  ```
- [ ] Configure production environment variables:
  ```env
  NODE_ENV=production
  
  # Server
  PORT=5000
  API_VERSION=v1
  API_BASE_URL=http://<DROPLET_IP>:5000
  CLIENT_URL=http://<DROPLET_IP>:3000
  
  # Database
  POSTGRES_USER=restaurant_admin
  POSTGRES_PASSWORD=<GENERATED_STRONG_PASSWORD>
  POSTGRES_DB=restaurant_db
  POSTGRES_PORT=5432
  DATABASE_URL=postgresql://restaurant_admin:<PASSWORD>@postgres:5432/restaurant_db
  
  # Redis
  REDIS_URL=redis://redis:6379
  REDIS_PORT=6379
  
  # JWT
  JWT_SECRET=<GENERATED_STRONG_SECRET>
  JWT_EXPIRES_IN=15m
  JWT_REFRESH_EXPIRES_IN=7d
  
  # Storage
  STORAGE_TYPE=cloudinary
  CLOUDINARY_CLOUD_NAME=<YOUR_VALUE>
  CLOUDINARY_API_KEY=<YOUR_VALUE>
  CLOUDINARY_API_SECRET=<YOUR_VALUE>
  
  # Frontend
  NEXT_PUBLIC_API_URL=http://<DROPLET_IP>:5000
  NEXT_PUBLIC_SOCKET_URL=http://<DROPLET_IP>:5000
  ```
- [ ] Set restrictive permissions: `chmod 600 /opt/restaurant/.env.production`
- [ ] Verify all required variables are set

### 2.3 Production Docker Compose
- [ ] Create `docker-compose.prod.yml` based on existing `docker-compose.yml`
- [ ] Add resource limits for all services
  ```yaml
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
      reservations:
        memory: 256M
  ```
- [ ] Configure volume mounts to Digital Ocean Volume paths
  ```yaml
  volumes:
    - /mnt/volume/postgres:/var/lib/postgresql/data
    - /mnt/volume/uploads:/app/uploads
    - /mnt/volume/logs:/app/logs
  ```
- [ ] Add health checks to all services
- [ ] Set restart policy: `restart: unless-stopped`
- [ ] Configure logging with rotation
- [ ] Use production environment file: `env_file: .env.production`

### 2.4 Build Production Docker Images
- [ ] Build backend image:
  ```bash
  docker build -t restaurant-server:prod -f app/server/Dockerfile app/server
  ```
- [ ] Build frontend image:
  ```bash
  docker build -t restaurant-client:prod -f app/client/Dockerfile app/client \
    --build-arg NEXT_PUBLIC_API_URL=http://<DROPLET_IP>:5000
  ```
- [ ] Verify images built successfully: `docker images`
- [ ] Test images locally before deployment

### 2.5 Database Setup
- [ ] Start only PostgreSQL container first
  ```bash
  docker compose -f docker-compose.prod.yml up -d postgres
  ```
- [ ] Wait for PostgreSQL to be healthy: `docker compose ps`
- [ ] Run Prisma migrations
  ```bash
  docker exec restaurant_server npx prisma migrate deploy
  ```
- [ ] Seed initial data (if needed)
  ```bash
  docker exec restaurant_server npm run prisma:seed
  ```
- [ ] Verify database schema and data
- [ ] Create initial database backup

**Validation**: All containers running, database migrated, health checks passing

---

## Phase 3: Reverse Proxy & SSL (Week 2)

### 3.1 Cloudflare Account Setup
- [ ] Create Cloudflare account (free plan)
- [ ] Verify email address
- [ ] Access Cloudflare dashboard

### 3.2 Domain Configuration (Option A: Custom Domain)
- [ ] Purchase domain (optional, ~$10-15/year)
- [ ] Add site to Cloudflare
- [ ] Update domain nameservers to Cloudflare
- [ ] Wait for nameserver propagation (up to 24 hours)
- [ ] Create A record pointing to droplet IP
- [ ] Create CNAME for www subdomain (if needed)

### 3.2 Alternative: Cloudflare DDNS (Option B: Free)
- [ ] Skip if using custom domain
- [ ] Set up Cloudflare API token for DDNS
- [ ] Use droplet IP directly or create subdomain
- [ ] Document access URL

### 3.3 Cloudflare SSL Configuration
- [ ] Navigate to SSL/TLS settings in Cloudflare
- [ ] Set SSL/TLS encryption mode to "Full" (or "Flexible" if no origin cert)
- [ ] Enable "Always Use HTTPS"
- [ ] Set minimum TLS version to 1.2
- [ ] Enable "Automatic HTTPS Rewrites"
- [ ] Enable HTTP Strict Transport Security (HSTS)
  - Max Age: 12 months
  - Include subdomains: Yes
  - Preload: No (unless certain)
- [ ] Enable "Certificate Transparency Monitoring"

### 3.4 Cloudflare Firewall Rules
- [ ] Create firewall rule to allow only Cloudflare IPs (optional)
- [ ] Enable "Under Attack Mode" if needed for DDoS protection
- [ ] Configure rate limiting: 100 requests per minute per IP
- [ ] Set up bot protection (free tier)

### 3.5 Cloudflare CDN & Optimization
- [ ] Enable caching for static assets
- [ ] Set caching rules:
  - Browser Cache TTL: 4 hours
  - Cloudflare Cache Level: Standard
- [ ] Enable Auto Minify for HTML, CSS, JS
- [ ] Enable Brotli compression
- [ ] Configure page rules for aggressive caching on `/public/*`, `/_next/static/*`

### 3.6 Caddy Installation & Configuration
- [ ] Install Caddy on droplet
  ```bash
  apt install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt update
  apt install caddy
  ```
- [ ] Create Caddyfile at `/etc/caddy/Caddyfile`
  ```caddy
  {
      admin off
  }
  
  :80 {
      # Redirect API calls to backend
      handle /api/* {
          reverse_proxy localhost:5000
      }
      
      # Redirect socket.io to backend
      handle /socket.io/* {
          reverse_proxy localhost:5000
      }
      
      # Everything else goes to frontend
      handle {
          reverse_proxy localhost:3000
      }
      
      # Security headers
      header {
          X-Frame-Options "DENY"
          X-Content-Type-Options "nosniff"
          X-XSS-Protection "1; mode=block"
          Referrer-Policy "no-referrer-when-downgrade"
      }
      
      # Enable gzip
      encode gzip
  }
  ```
- [ ] Validate Caddyfile: `caddy validate --config /etc/caddy/Caddyfile`
- [ ] Reload Caddy: `systemctl reload caddy`
- [ ] Enable Caddy on boot: `systemctl enable caddy`

### 3.7 SSL Verification
- [ ] Access application via HTTPS (if custom domain)
- [ ] Verify SSL certificate is valid
- [ ] Test HTTP to HTTPS redirect
- [ ] Check SSL Labs score: https://www.ssllabs.com/ssltest/
- [ ] Verify all assets load over HTTPS (no mixed content)
- [ ] Test WebSocket connection works over HTTPS

**Validation**: Application accessible via HTTPS, SSL A+ rating, all features working

---

## Phase 4: CI/CD Pipeline (Week 2-3)

### 4.1 GitHub Container Registry Setup
- [ ] Create Personal Access Token (PAT) with `write:packages` scope
- [ ] Login to GitHub Container Registry locally
  ```bash
  echo $PAT | docker login ghcr.io -u USERNAME --password-stdin
  ```
- [ ] Tag and push test image to verify access
- [ ] Add GitHub Container Registry URL to documentation

### 4.2 GitHub Secrets Configuration
- [ ] Navigate to repository Settings → Secrets and variables → Actions
- [ ] Add secrets:
  - `DROPLET_IP`: Digital Ocean droplet IP address
  - `DROPLET_SSH_KEY`: Private SSH key for deploy user
  - `DROPLET_USER`: deploy
  - `JWT_SECRET`: Production JWT secret
  - `POSTGRES_PASSWORD`: Production database password
  - `CLOUDINARY_API_SECRET`: Cloudinary API secret
  - `DOCKER_USERNAME`: GitHub username
  - `DOCKER_PASSWORD`: GitHub PAT with packages scope

### 4.3 GitHub Actions Workflow - Build & Test
- [ ] Create `.github/workflows/deploy.yml`
- [ ] Add job: Lint and type-check
  ```yaml
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
  ```
- [ ] Add job: Run tests (if tests exist)
  ```yaml
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm test
  ```
- [ ] Add job: Build Docker images
  ```yaml
  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: ./app/server
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/server:latest
            ghcr.io/${{ github.repository }}/server:${{ github.sha }}
      - uses: docker/build-push-action@v5
        with:
          context: ./app/client
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/client:latest
            ghcr.io/${{ github.repository }}/client:${{ github.sha }}
  ```

### 4.4 GitHub Actions Workflow - Deploy
- [ ] Add deployment job with SSH
  ```yaml
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Digital Ocean
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.DROPLET_USER }}
          key: ${{ secrets.DROPLET_SSH_KEY }}
          script: |
            cd /opt/restaurant
            
            # Pull latest code
            git pull origin main
            
            # Login to GitHub Container Registry
            echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            # Pull new images
            docker compose -f docker-compose.prod.yml pull
            
            # Create pre-deployment backup
            ./scripts/backup-db.sh
            
            # Blue-green deployment
            docker compose -f docker-compose.prod.yml up -d
            
            # Wait for health checks
            sleep 30
            
            # Verify health
            curl -f http://localhost:3000/health || exit 1
            curl -f http://localhost:5000/api/health || exit 1
            
            # Cleanup old images
            docker image prune -af --filter "until=24h"
  ```
- [ ] Add rollback job (manual trigger)
  ```yaml
  rollback:
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_dispatch'
    steps:
      # Similar SSH action with rollback script
  ```

### 4.5 Deployment Scripts
- [ ] Create `/opt/restaurant/scripts/deploy.sh` for blue-green deployment
  ```bash
  #!/bin/bash
  set -e
  
  echo "Starting blue-green deployment..."
  
  # Pull latest images
  docker compose -f docker-compose.prod.yml pull
  
  # Start new containers (blue)
  docker compose -f docker-compose.blue.yml up -d
  
  # Health check blue environment
  sleep 30
  if curl -f http://localhost:3001/health && curl -f http://localhost:5001/api/health; then
    echo "Blue environment healthy"
    
    # Switch proxy to blue
    # Update Caddyfile ports or use environment variable
    
    # Stop green environment
    docker compose -f docker-compose.prod.yml down
    
    # Rename blue to prod for next deployment
    mv docker-compose.blue.yml docker-compose.prod.yml
    
    echo "Deployment successful"
  else
    echo "Blue environment unhealthy, rolling back"
    docker compose -f docker-compose.blue.yml down
    exit 1
  fi
  ```
- [ ] Create `/opt/restaurant/scripts/rollback.sh`
  ```bash
  #!/bin/bash
  # Stop current containers
  docker compose -f docker-compose.prod.yml down
  
  # Revert to previous image tags
  # (Implementation depends on tagging strategy)
  
  # Start previous version
  docker compose -f docker-compose.prod.yml up -d
  ```
- [ ] Make scripts executable: `chmod +x scripts/*.sh`

### 4.6 Health Check Endpoints
- [ ] Implement backend health endpoint in Express
  ```typescript
  app.get('/api/health', async (req, res) => {
    try {
      // Check database
      await prisma.$queryRaw`SELECT 1`;
      
      // Check Redis
      await redis.ping();
      
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: Date.now(),
        services: {
          database: 'healthy',
          redis: 'healthy'
        }
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message
      });
    }
  });
  ```
- [ ] Implement frontend health endpoint
  ```typescript
  // app/health/route.ts
  export async function GET() {
    return Response.json({
      status: 'healthy',
      timestamp: Date.now()
    });
  }
  ```
- [ ] Test health endpoints locally
- [ ] Add health endpoints to documentation

### 4.7 First Automated Deployment
- [ ] Commit workflow files to repository
- [ ] Push to main branch
- [ ] Monitor GitHub Actions execution
- [ ] Verify build succeeds
- [ ] Verify deployment succeeds
- [ ] Test application functionality after deployment
- [ ] Check logs for errors

**Validation**: Successful automated deployment via GitHub Actions, application working

---

## Phase 5: Monitoring & Backup (Week 3)

### 5.1 Automated Database Backup
- [ ] Create backup script `/opt/restaurant/scripts/backup-db.sh`
  ```bash
  #!/bin/bash
  set -e
  
  DATE=$(date +%Y%m%d_%H%M%S)
  BACKUP_DIR="/mnt/volume/backups/postgres"
  POSTGRES_CONTAINER="restaurant_postgres"
  
  # Ensure backup directory exists
  mkdir -p $BACKUP_DIR
  
  # Create backup
  docker exec $POSTGRES_CONTAINER pg_dump -U restaurant_admin restaurant_db | \
    gzip > $BACKUP_DIR/backup_$DATE.sql.gz
  
  # Verify backup created
  if [ -f "$BACKUP_DIR/backup_$DATE.sql.gz" ]; then
    echo "Backup created: backup_$DATE.sql.gz"
    
    # Delete backups older than 14 days
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +14 -delete
    echo "Old backups cleaned up"
  else
    echo "Backup failed!"
    exit 1
  fi
  ```
- [ ] Make script executable: `chmod +x scripts/backup-db.sh`
- [ ] Test backup script manually: `./scripts/backup-db.sh`
- [ ] Verify backup file created in `/mnt/volume/backups/postgres/`

### 5.2 Cron Job for Automated Backups
- [ ] Edit crontab: `crontab -e`
- [ ] Add daily backup at 2 AM
  ```cron
  0 2 * * * /opt/restaurant/scripts/backup-db.sh >> /mnt/volume/logs/backup.log 2>&1
  ```
- [ ] Verify cron job added: `crontab -l`
- [ ] Check cron service running: `systemctl status cron`
- [ ] Monitor backup logs: `tail -f /mnt/volume/logs/backup.log`

### 5.3 Database Restore Script
- [ ] Create restore script `/opt/restaurant/scripts/restore-db.sh`
  ```bash
  #!/bin/bash
  set -e
  
  if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file>"
    echo "Available backups:"
    ls -lh /mnt/volume/backups/postgres/
    exit 1
  fi
  
  BACKUP_FILE=$1
  POSTGRES_CONTAINER="restaurant_postgres"
  
  # Stop application containers
  cd /opt/restaurant
  docker compose -f docker-compose.prod.yml stop server client
  
  # Restore database
  gunzip -c $BACKUP_FILE | docker exec -i $POSTGRES_CONTAINER \
    psql -U restaurant_admin -d restaurant_db
  
  echo "Database restored from $BACKUP_FILE"
  
  # Restart application
  docker compose -f docker-compose.prod.yml start server client
  
  echo "Application restarted"
  ```
- [ ] Make executable: `chmod +x scripts/restore-db.sh`
- [ ] Test restore in staging/dev environment first
- [ ] Document restore procedure

### 5.4 Digital Ocean Volume Snapshots
- [ ] Create manual volume snapshot via Digital Ocean dashboard
- [ ] Test snapshot restoration to new volume
- [ ] Document snapshot creation process
- [ ] Set up weekly snapshot schedule (manual or via API)
- [ ] Create script for automated snapshots via Digital Ocean API (optional)
  ```bash
  # Using doctl CLI
  doctl compute volume-action snapshot <volume-id> --snapshot-name "weekly-$(date +%Y%m%d)"
  ```

### 5.5 Log Rotation Configuration
- [ ] Verify Winston log rotation configured in backend
- [ ] Check log files not growing unbounded
- [ ] Configure logrotate for system logs (optional)
  ```
  /mnt/volume/logs/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
  }
  ```
- [ ] Test log rotation: `logrotate -f /etc/logrotate.conf`

### 5.6 Digital Ocean Monitoring Setup
- [ ] Access Digital Ocean dashboard → Droplet → Monitoring
- [ ] Review default metrics (CPU, memory, disk, network)
- [ ] Create alert policies:
  - CPU > 80% for 10 minutes
  - Memory > 90% for 5 minutes
  - Disk > 85%
  - Droplet unreachable for 5 minutes
- [ ] Configure notification email
- [ ] Test alert by simulating high load (optional)

### 5.7 Application Metrics Endpoint
- [ ] Implement `/api/metrics` endpoint (optional, for advanced monitoring)
  ```typescript
  app.get('/api/metrics', (req, res) => {
    res.json({
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      connections: io.engine.clientsCount, // Socket.io connections
      // Add more metrics as needed
    });
  });
  ```
- [ ] Document available metrics
- [ ] Consider integrating Prometheus + Grafana for future (out of scope for now)

**Validation**: Backups running daily, restore tested, monitoring active, logs rotating

---

## Phase 6: Documentation & Testing (Week 3-4)

### 6.1 Deployment Documentation
- [ ] Create `docs/DEPLOYMENT.md` with:
  - Prerequisites (accounts, access, tools)
  - Initial setup step-by-step guide
  - Environment variable reference
  - Cloudflare configuration guide
  - GitHub Actions setup
  - First deployment process
  - Common troubleshooting issues
- [ ] Document cost breakdown and optimization tips
- [ ] Add screenshots for key steps (optional)
- [ ] Include video tutorial link (optional)

### 6.2 Operations Runbook
- [ ] Create `docs/OPERATIONS.md` with:
  - SSH access instructions
  - How to view logs
  - Manual deployment steps
  - Rollback procedures
  - Backup and restore procedures
  - Scaling guide (upgrading droplet size)
  - Security incident response
  - Performance troubleshooting guide
- [ ] Add common commands reference
- [ ] Include disaster recovery checklist

### 6.3 Cost Monitoring Documentation
- [ ] Create `docs/COST_OPTIMIZATION.md` with:
  - Monthly cost breakdown by resource
  - GitHub Student Pack credit application
  - Billing alert setup
  - Resource utilization monitoring
  - Optimization opportunities
  - Alternative configurations
  - Cost-saving tips
- [ ] Document current resource usage
- [ ] Estimate credit burn rate

### 6.4 Smoke Tests
- [ ] Create smoke test script `/opt/restaurant/scripts/smoke-test.sh`
  ```bash
  #!/bin/bash
  set -e
  
  echo "Running smoke tests..."
  
  # Test frontend
  if curl -f http://localhost:3000/health; then
    echo "✓ Frontend health check passed"
  else
    echo "✗ Frontend health check failed"
    exit 1
  fi
  
  # Test backend
  if curl -f http://localhost:5000/api/health; then
    echo "✓ Backend health check passed"
  else
    echo "✗ Backend health check failed"
    exit 1
  fi
  
  # Test database connection (via API)
  # Test Redis connection (via API)
  # Test WebSocket connection (optional)
  
  echo "All smoke tests passed ✓"
  ```
- [ ] Make executable: `chmod +x scripts/smoke-test.sh`
- [ ] Run smoke tests after deployment
- [ ] Add smoke tests to CI/CD pipeline

### 6.5 Load Testing (Optional)
- [ ] Install Apache Bench: `apt install apache2-utils -y`
- [ ] Run basic load test
  ```bash
  ab -n 1000 -c 10 http://localhost:3000/
  ab -n 1000 -c 10 http://localhost:5000/api/health
  ```
- [ ] Monitor resource usage during load test
- [ ] Document performance baseline
- [ ] Identify bottlenecks if any
- [ ] Optimize if necessary

### 6.6 Security Audit
- [ ] Run Lynis security audit: `apt install lynis && lynis audit system`
- [ ] Review Lynis recommendations
- [ ] Scan Docker images for vulnerabilities: `docker scan restaurant-server:prod`
- [ ] Check for exposed secrets in code: `git secrets --scan`
- [ ] Verify firewall rules: `ufw status verbose`
- [ ] Review SSL configuration: https://www.ssllabs.com/ssltest/
- [ ] Document security findings and resolutions

### 6.7 Final End-to-End Testing
- [ ] Register new user account
- [ ] Login and test authentication
- [ ] Create/edit menu items
- [ ] Create table reservation
- [ ] Place order and test kitchen display
- [ ] Test WebSocket real-time updates
- [ ] Process payment
- [ ] Test all major features
- [ ] Verify data persists after container restart
- [ ] Test on mobile devices

### 6.8 README Updates
- [ ] Update main `README.md` with deployment section
- [ ] Add badges for deployment status (optional)
- [ ] Link to deployment documentation
- [ ] Add live demo URL
- [ ] Update tech stack section if needed
- [ ] Add screenshots of deployed application

**Validation**: Complete documentation, all tests passing, application fully functional

---

## Phase 7: Optimization & Finalization (Week 4)

### 7.1 Performance Optimization
- [ ] Review backend response times via logs
- [ ] Identify slow database queries
- [ ] Add database indexes where needed
- [ ] Implement Redis caching for frequent queries
- [ ] Optimize Docker images (reduce size)
  ```dockerfile
  # Use multi-stage builds
  # Remove dev dependencies in production
  ```
- [ ] Enable Next.js production optimizations
- [ ] Verify gzip compression enabled
- [ ] Test page load times with Google PageSpeed Insights

### 7.2 Resource Monitoring & Tuning
- [ ] Monitor resource usage for 72 hours
- [ ] Review Docker stats: `docker stats`
- [ ] Adjust resource limits if needed in docker-compose.prod.yml
- [ ] Optimize PostgreSQL configuration for 512MB memory
  ```
  shared_buffers = 128MB
  effective_cache_size = 384MB
  maintenance_work_mem = 64MB
  ```
- [ ] Tune Redis maxmemory and eviction policy
- [ ] Document optimal configuration

### 7.3 Backup Verification
- [ ] Verify database backups running successfully
- [ ] Test restore from latest backup
- [ ] Measure restore time (should be < 30 minutes)
- [ ] Verify backup retention policy working (14 days)
- [ ] Check backup file sizes and storage usage
- [ ] Document backup/restore procedures

### 7.4 Security Final Check
- [ ] Review all environment variables (no secrets exposed)
- [ ] Verify SSL certificate valid and auto-renewing
- [ ] Check firewall rules: `ufw status`
- [ ] Review fail2ban logs: `fail2ban-client status sshd`
- [ ] Verify no unnecessary ports exposed: `netstat -tuln`
- [ ] Change default passwords if any
- [ ] Document security configuration

### 7.5 Disaster Recovery Drill
- [ ] Document disaster recovery procedures
- [ ] Simulate droplet failure (create test scenario)
- [ ] Practice recovery from volume snapshot
- [ ] Measure actual recovery time
- [ ] Document lessons learned
- [ ] Update disaster recovery plan

### 7.6 Cost Review
- [ ] Review actual costs after 1-2 weeks
- [ ] Verify billing alerts working
- [ ] Check remaining student credits
- [ ] Document actual vs estimated costs
- [ ] Identify cost optimization opportunities
- [ ] Project costs for thesis duration (3-4 months)

### 7.7 Monitoring Dashboard
- [ ] Set up Digital Ocean monitoring dashboard
- [ ] Configure Cloudflare analytics
- [ ] Review error logs daily
- [ ] Set up email/Slack notifications for critical alerts (optional)
- [ ] Document monitoring procedures

### 7.8 Graduation Presentation Prep
- [ ] Take screenshots of live application
- [ ] Record video demo of key features (optional)
- [ ] Document architecture diagram
- [ ] Prepare deployment workflow diagram
- [ ] Document challenges and solutions
- [ ] Create cost analysis slide
- [ ] Prepare backup plan for demo day

### 7.9 Final Checklist Review
- [ ] Application accessible via public URL ✓
- [ ] SSL/TLS enabled ✓
- [ ] All features working ✓
- [ ] Automated deployment working ✓
- [ ] Backups running and tested ✓
- [ ] Monitoring active ✓
- [ ] Documentation complete ✓
- [ ] Cost within budget ($20/month or free with credits) ✓
- [ ] Load tested for 20-50 concurrent users ✓
- [ ] Security hardened ✓

**Validation**: Production-ready deployment, documented, optimized, within budget

---

## Post-Deployment Maintenance

### Weekly Tasks
- [ ] Review monitoring alerts
- [ ] Check application logs for errors
- [ ] Verify backups running successfully
- [ ] Monitor resource usage trends
- [ ] Review cost and credit balance

### Monthly Tasks
- [ ] Review security updates and apply
- [ ] Rotate secrets (every 90 days)
- [ ] Test disaster recovery procedures
- [ ] Review and optimize performance
- [ ] Update documentation if needed

### Before Thesis Presentation
- [ ] Verify application is running
- [ ] Run smoke tests
- [ ] Check SSL certificate valid
- [ ] Prepare demo account credentials
- [ ] Have backup plan ready

---

## Dependencies & Sequencing

**Sequential Tasks** (must be done in order):
1. Droplet provisioning → Volume attachment → Docker installation
2. Repository cloning → Environment configuration → Docker Compose setup
3. Cloudflare account → Domain/DNS → SSL configuration
4. GitHub secrets → CI/CD workflow → Automated deployment
5. Application deployment → Backup setup → Monitoring

**Parallel Tasks** (can be done simultaneously):
- Documentation writing (throughout all phases)
- Cost monitoring setup (anytime after droplet provisioning)
- Load testing (after initial deployment)
- Security audit (after deployment complete)

**Critical Path**: Droplet setup → Docker installation → Application deployment → SSL/Domain → CI/CD

---

## Rollback Plan

If deployment fails at any stage:

1. **Droplet provisioning failed**: Delete and recreate droplet
2. **Docker issues**: Reinstall Docker, check system requirements
3. **Application errors**: Rollback to previous commit, check logs
4. **Database migration failed**: Restore from backup
5. **SSL issues**: Use HTTP temporarily, debug Cloudflare settings
6. **CI/CD pipeline failed**: Run manual deployment, fix workflow file

---

## Success Metrics

- ✅ Deployment completed within 4 weeks
- ✅ Application uptime > 99% during thesis period
- ✅ Page load time < 3 seconds
- ✅ API response time < 500ms
- ✅ Monthly cost < $20 (or $0 with student credits)
- ✅ Automated deployment working
- ✅ Zero data loss (backups tested)
- ✅ Documentation complete
- ✅ Security hardened (no critical vulnerabilities)
- ✅ Can handle 20+ concurrent users

---

## Total Task Count

**Phase 1**: 39 tasks (Infrastructure)  
**Phase 2**: 25 tasks (Application Configuration)  
**Phase 3**: 33 tasks (SSL & Reverse Proxy)  
**Phase 4**: 37 tasks (CI/CD Pipeline)  
**Phase 5**: 22 tasks (Monitoring & Backup)  
**Phase 6**: 32 tasks (Documentation & Testing)  
**Phase 7**: 36 tasks (Optimization & Finalization)  

**Grand Total**: 224 tasks

Estimated completion time: 3-4 weeks (depending on experience level and time availability)
