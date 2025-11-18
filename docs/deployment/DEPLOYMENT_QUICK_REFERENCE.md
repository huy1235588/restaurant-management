# Digital Ocean Deployment - Quick Reference

## 🚀 Quick Start

### Prerequisites
- Digital Ocean account with $200 GitHub Student credit
- SSH key generated and added to GitHub
- Domain (optional) or use IP address

### 1-Minute Overview
```bash
# On your local machine
git clone <repository>
cd restaurant-management

# On Digital Ocean droplet (after setup)
cd /opt/restaurant
./scripts/deploy.sh
```

## 📁 Files Created

### Docker & Configuration
- `docker-compose.prod.yml` - Production Docker Compose configuration
- `Caddyfile` - Reverse proxy configuration
- `.env.production.example` - Environment variables template

### Scripts (`scripts/`)
- `backup-db.sh` - Database backup script
- `restore-db.sh` - Database restore script
- `deploy.sh` - Blue-green deployment script
- `rollback.sh` - Rollback to previous version
- `smoke-test.sh` - Health check tests
- `generate-secrets.sh` - Generate secure passwords

### GitHub Actions (`.github/workflows/`)
- `deploy.yml` - Automated deployment pipeline
- `rollback.yml` - Manual rollback workflow

### Documentation (`docs/`)
- `DEPLOYMENT.md` - Complete deployment guide
- `OPERATIONS.md` - Day-to-day operations runbook
- `COST_OPTIMIZATION.md` - Cost saving strategies

### Health Endpoints
- Backend: `app/server/src/routes/index.ts` (enhanced `/health`)
- Frontend: `app/client/src/app/health/route.ts` (new `/health`)

## 🎯 Key Commands

### Deployment
```bash
# Manual deployment
cd /opt/restaurant && ./scripts/deploy.sh

# Automated (GitHub Actions)
git push origin main  # Auto-deploys

# Rollback
./scripts/rollback.sh
```

### Monitoring
```bash
# Health checks
curl http://localhost:3000/health
curl http://localhost:5000/api/health

# Smoke tests
./scripts/smoke-test.sh

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Resource usage
docker stats
free -h
df -h
```

### Database
```bash
# Backup
./scripts/backup-db.sh

# Restore
./scripts/restore-db.sh /mnt/volume/backups/postgres/backup_YYYYMMDD_HHMMSS.sql.gz

# Connect
docker exec -it restaurant_postgres psql -U restaurant_admin -d restaurant_db

# Migrations
docker compose exec server npx prisma migrate deploy
```

### Service Management
```bash
# Status
docker compose -f /opt/restaurant/docker-compose.prod.yml ps

# Restart
docker compose -f /opt/restaurant/docker-compose.prod.yml restart

# Logs
docker compose logs -f server
docker compose logs -f client

# Stop/Start
docker compose down
docker compose up -d
```

## 💰 Cost Summary

**With GitHub Student Credits**: FREE for 15+ months
**Without Credits**: $13-20/month

### Cost Breakdown
- Droplet 2GB RAM: $12/month
- Volume 10-25GB: $1-2.50/month
- Cloudflare: $0 (free tier)
- Cloudinary: $0 (free tier)
- GitHub Actions: $0 (free for public repos)

## 🔐 GitHub Secrets Required

```
DROPLET_IP              # Your droplet IP address
DROPLET_USER            # deploy
DROPLET_SSH_KEY         # Private SSH key
JWT_SECRET              # Generated secret (openssl rand -base64 32)
POSTGRES_PASSWORD       # Generated password
CLOUDINARY_API_SECRET   # From Cloudinary dashboard
NEXT_PUBLIC_API_URL     # http://YOUR_IP:5000
NEXT_PUBLIC_SOCKET_URL  # http://YOUR_IP:5000
APP_URL                 # Your application URL
```

## 📍 Important Paths

```
/opt/restaurant              # Application directory
/mnt/volume/postgres         # Database data
/mnt/volume/redis            # Redis data
/mnt/volume/uploads          # File uploads
/mnt/volume/backups          # Database backups
/mnt/volume/logs             # Application logs
/etc/caddy/Caddyfile         # Caddy configuration
```

## 🔗 Resource Limits (docker-compose.prod.yml)

```yaml
postgres: 512MB max, 256MB reserved
redis: 128MB max, 64MB reserved
server: 512MB max, 256MB reserved
client: 512MB max, 256MB reserved
Total: ~1.7GB (fits in 2GB droplet with OS overhead)
```

## 🚨 Troubleshooting

### Application Down
```bash
docker compose ps  # Check status
docker compose logs server  # Check logs
docker compose restart  # Restart services
```

### Out of Memory
```bash
free -h  # Check memory
docker stats  # Check container usage
docker compose restart  # Free up memory
```

### Out of Disk Space
```bash
df -h  # Check disk usage
docker system prune -af  # Clean Docker
find /mnt/volume/logs -mtime +7 -delete  # Clean logs
```

### Database Issues
```bash
docker exec restaurant_postgres pg_isready  # Check status
docker logs restaurant_postgres  # View logs
./scripts/restore-db.sh BACKUP_FILE  # Restore if needed
```

## 📊 Monitoring URLs

- **Digital Ocean Dashboard**: https://cloud.digitalocean.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **GitHub Actions**: https://github.com/YOUR_USERNAME/restaurant-management/actions
- **Application**: http://YOUR_DOMAIN or http://YOUR_IP

## 🎓 For Graduation Thesis

### Demo Preparation
1. Verify application is running: `./scripts/smoke-test.sh`
2. Create demo accounts with sample data
3. Take screenshots of deployment infrastructure
4. Prepare architecture diagram
5. Document challenges and solutions

### Presentation Points
- Cost optimization: $13/month or FREE with student credits
- Production-grade: Docker, CI/CD, automated backups
- Security: Firewall, SSL, fail2ban, secrets management
- Monitoring: Health checks, logs, alerts
- Scalability: Can upgrade as needed

## 📚 Documentation Links

- Full deployment guide: `docs/DEPLOYMENT.md`
- Operations runbook: `docs/OPERATIONS.md`
- Cost optimization: `docs/COST_OPTIMIZATION.md`
- Proposal: `openspec/changes/deploy-to-digitalocean/proposal.md`
- Design decisions: `openspec/changes/deploy-to-digitalocean/design.md`
- Task checklist: `openspec/changes/deploy-to-digitalocean/tasks.md`

## ✅ Success Criteria

- [ ] Application accessible via public URL
- [ ] SSL/HTTPS enabled (if using domain)
- [ ] Automated deployment via GitHub Actions working
- [ ] Database backups running daily
- [ ] Monitoring and health checks active
- [ ] Cost within budget ($20/month or free with credits)
- [ ] Documentation complete
- [ ] Load tested for 20+ concurrent users
- [ ] Security hardened (firewall, SSH keys, secrets)

## 🆘 Support

- Check documentation in `docs/` directory
- Review logs: `docker compose logs`
- Run smoke tests: `./scripts/smoke-test.sh`
- Check Digital Ocean community tutorials
- GitHub Issues for repository-specific questions

---

**Estimated Setup Time**: 4-6 hours for complete initial deployment
**Maintenance Time**: 30 minutes per week
**Monthly Cost**: $13-20 (or FREE with GitHub Student credits)
