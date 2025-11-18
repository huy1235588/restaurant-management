# Operations Runbook - Restaurant Management System

This runbook provides procedures for operating and maintaining the production deployment on Digital Ocean.

## Table of Contents
- [SSH Access](#ssh-access)
- [Service Management](#service-management)
- [Log Management](#log-management)
- [Database Operations](#database-operations)
- [Deployment Operations](#deployment-operations)
- [Monitoring](#monitoring)
- [Incident Response](#incident-response)
- [Performance Tuning](#performance-tuning)

## SSH Access

### Connect to Server

```bash
# Using password (if configured)
ssh deploy@YOUR_DROPLET_IP

# Using SSH key
ssh -i ~/.ssh/id_rsa deploy@YOUR_DROPLET_IP

# Using SSH config (recommended)
# Add to ~/.ssh/config:
Host restaurant-prod
    HostName YOUR_DROPLET_IP
    User deploy
    IdentityFile ~/.ssh/id_rsa
    
# Then connect with:
ssh restaurant-prod
```

### SSH Troubleshooting

```bash
# Permission denied
chmod 600 ~/.ssh/id_rsa

# Connection timeout
# Check firewall: sudo ufw status
# Check SSH service: sudo systemctl status sshd

# Host key verification failed
ssh-keygen -R YOUR_DROPLET_IP
```

## Service Management

### Check Service Status

```bash
cd /opt/restaurant

# View all containers
docker compose -f docker-compose.prod.yml ps

# View specific service
docker compose -f docker-compose.prod.yml ps server

# Check health status
docker inspect restaurant_server --format='{{.State.Health.Status}}'
```

### Start/Stop Services

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Start specific service
docker compose -f docker-compose.prod.yml up -d server

# Stop all services
docker compose -f docker-compose.prod.yml down

# Stop specific service
docker compose -f docker-compose.prod.yml stop server

# Restart service
docker compose -f docker-compose.prod.yml restart server

# Recreate service (useful after config changes)
docker compose -f docker-compose.prod.yml up -d --force-recreate server
```

### View Resource Usage

```bash
# Real-time stats
docker stats

# Container processes
docker compose -f docker-compose.prod.yml top

# System resources
htop  # or top

# Disk usage
df -h
du -sh /mnt/volume/*

# Memory usage
free -h
```

## Log Management

### View Logs

```bash
cd /opt/restaurant

# All services
docker compose -f docker-compose.prod.yml logs

# Specific service
docker compose -f docker-compose.prod.yml logs server
docker compose -f docker-compose.prod.yml logs client

# Follow logs (real-time)
docker compose -f docker-compose.prod.yml logs -f server

# Last N lines
docker compose -f docker-compose.prod.yml logs --tail=100 server

# With timestamps
docker compose -f docker-compose.prod.yml logs -f -t server

# Filter by time
docker compose logs --since 1h server
docker compose logs --since 2024-01-15T10:00:00 server
```

### Application Logs

```bash
# Backend logs (Winston)
tail -f /mnt/volume/logs/error.log
tail -f /mnt/volume/logs/combined.log

# Access logs
tail -f /mnt/volume/logs/access.log

# Backup logs
tail -f /mnt/volume/logs/backup.log

# Caddy logs
sudo tail -f /var/log/caddy/access.log
```

### Log Rotation

```bash
# Check Docker log size
du -h /var/lib/docker/containers/*/*-json.log

# Manual cleanup if needed
docker compose -f docker-compose.prod.yml down
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log
docker compose -f docker-compose.prod.yml up -d

# Application log cleanup
find /mnt/volume/logs -name "*.log" -mtime +30 -delete
```

## Database Operations

### Connect to Database

```bash
# Using psql
docker exec -it restaurant_postgres psql -U restaurant_admin -d restaurant_db

# Common queries
# List tables
\dt

# Describe table
\d table_name

# Show database size
SELECT pg_size_pretty(pg_database_size('restaurant_db'));

# Show table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Exit
\q
```

### Backup Database

```bash
# Manual backup
cd /opt/restaurant
./scripts/backup-db.sh

# Verify backup
ls -lh /mnt/volume/backups/postgres/

# Check backup integrity
gunzip -t /mnt/volume/backups/postgres/backup_YYYYMMDD_HHMMSS.sql.gz
```

### Restore Database

```bash
# List available backups
ls -lh /mnt/volume/backups/postgres/

# Restore from specific backup
cd /opt/restaurant
./scripts/restore-db.sh /mnt/volume/backups/postgres/backup_20250115_020000.sql.gz

# Verify restore
docker exec -it restaurant_postgres psql -U restaurant_admin -d restaurant_db -c "SELECT COUNT(*) FROM users;"
```

### Database Migrations

```bash
# Check migration status
docker compose exec server npx prisma migrate status

# Run pending migrations
docker compose exec server npx prisma migrate deploy

# Create new migration (development only)
docker compose exec server npx prisma migrate dev --name migration_name

# Reset database (DANGER: deletes all data)
docker compose exec server npx prisma migrate reset
```

### Database Optimization

```bash
# Analyze and vacuum
docker exec restaurant_postgres psql -U restaurant_admin -d restaurant_db -c "VACUUM ANALYZE;"

# Check slow queries (if logging enabled)
docker exec restaurant_postgres psql -U restaurant_admin -d restaurant_db -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Reindex if needed
docker exec restaurant_postgres psql -U restaurant_admin -d restaurant_db -c "REINDEX DATABASE restaurant_db;"
```

## Deployment Operations

### Manual Deployment

```bash
cd /opt/restaurant

# Pull latest code
git pull origin main

# Run deployment script
./scripts/deploy.sh

# Monitor deployment
docker compose -f docker-compose.prod.yml logs -f
```

### Rollback

```bash
cd /opt/restaurant

# Rollback to previous version
./scripts/rollback.sh

# Rollback with database restore
./scripts/rollback.sh /mnt/volume/backups/postgres/backup_20250115_020000.sql.gz
```

### Update Environment Variables

```bash
# Edit environment file
nano /opt/restaurant/.env.production

# Restart affected services
docker compose -f docker-compose.prod.yml restart server client

# Verify changes
docker compose -f docker-compose.prod.yml exec server printenv | grep VARIABLE_NAME
```

### Update Docker Images

```bash
# Pull latest images
cd /opt/restaurant
GITHUB_REPOSITORY="YOUR_USERNAME/restaurant-management" docker compose -f docker-compose.prod.yml pull

# Restart with new images
docker compose -f docker-compose.prod.yml up -d

# Clean old images
docker image prune -af
```

## Monitoring

### Health Checks

```bash
# Run smoke tests
cd /opt/restaurant
./scripts/smoke-test.sh

# Manual health checks
curl http://localhost:3000/health
curl http://localhost:5000/api/health

# Check from external
curl http://YOUR_DOMAIN/health
```

### Resource Monitoring

```bash
# System resources
htop

# Disk space
df -h
ncdu /mnt/volume  # Interactive disk usage

# Memory
free -h
vmstat 5  # Every 5 seconds

# Docker stats
docker stats --no-stream

# Network
sudo netstat -tuln
sudo ss -tuln
```

### Database Monitoring

```bash
# Active connections
docker exec restaurant_postgres psql -U restaurant_admin -d restaurant_db -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
docker exec restaurant_postgres psql -U restaurant_admin -d restaurant_db -c "SELECT pg_size_pretty(pg_database_size('restaurant_db'));"

# Slow queries (if enabled)
docker exec restaurant_postgres psql -U restaurant_admin -d restaurant_db -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Lock monitoring
docker exec restaurant_postgres psql -U restaurant_admin -d restaurant_db -c "SELECT * FROM pg_locks WHERE NOT granted;"
```

### Application Metrics

```bash
# Check API response time
time curl http://localhost:5000/api/health

# Check WebSocket connections
docker compose exec server sh -c 'echo "info clients" | redis-cli' | grep connected_clients

# View error logs
docker compose logs server | grep ERROR

# Count errors in last hour
docker compose logs --since 1h server | grep ERROR | wc -l
```

## Incident Response

### Service Down

**Symptoms**: Application not responding, 502/503 errors

**Steps**:
1. Check container status:
   ```bash
   docker compose -f /opt/restaurant/docker-compose.prod.yml ps
   ```

2. Check logs:
   ```bash
   docker compose logs --tail=100 server
   ```

3. Restart affected service:
   ```bash
   docker compose restart server
   ```

4. If persistent, check resources:
   ```bash
   free -h
   df -h
   docker stats
   ```

5. Rollback if needed:
   ```bash
   ./scripts/rollback.sh
   ```

### Database Connection Failed

**Symptoms**: "Cannot connect to database" errors

**Steps**:
1. Check PostgreSQL status:
   ```bash
   docker compose ps postgres
   docker exec restaurant_postgres pg_isready
   ```

2. Check logs:
   ```bash
   docker logs restaurant_postgres
   ```

3. Check connections:
   ```bash
   docker exec restaurant_postgres psql -U restaurant_admin -d restaurant_db -c "SELECT count(*) FROM pg_stat_activity;"
   ```

4. Restart if needed:
   ```bash
   docker compose restart postgres
   ```

5. If data corruption suspected, restore from backup:
   ```bash
   ./scripts/restore-db.sh /mnt/volume/backups/postgres/backup_LATEST.sql.gz
   ```

### Out of Disk Space

**Symptoms**: Cannot write files, database errors

**Steps**:
1. Check disk usage:
   ```bash
   df -h
   du -sh /mnt/volume/*
   ```

2. Clean Docker:
   ```bash
   docker system prune -af
   docker volume prune -f
   ```

3. Clean old logs:
   ```bash
   find /mnt/volume/logs -name "*.log" -mtime +7 -delete
   ```

4. Clean old backups:
   ```bash
   find /mnt/volume/backups -name "*.sql.gz" -mtime +14 -delete
   ```

5. If still full, upgrade volume size in Digital Ocean

### High CPU/Memory Usage

**Symptoms**: Slow response, timeouts

**Steps**:
1. Identify culprit:
   ```bash
   docker stats
   htop
   ```

2. Check for memory leaks:
   ```bash
   docker compose logs server | grep "Out of memory"
   ```

3. Restart service:
   ```bash
   docker compose restart server
   ```

4. Review and optimize code/queries

5. Consider upgrading droplet

### SSL Certificate Issues

**Symptoms**: HTTPS not working, certificate errors

**Steps**:
1. Check Caddy status:
   ```bash
   sudo systemctl status caddy
   sudo journalctl -u caddy -n 50
   ```

2. Validate Caddyfile:
   ```bash
   sudo caddy validate --config /etc/caddy/Caddyfile
   ```

3. If using Cloudflare:
   - Check SSL/TLS mode (should be Full or Flexible)
   - Check DNS records pointing to correct IP
   - Check proxy status (orange cloud)

4. Reload Caddy:
   ```bash
   sudo systemctl reload caddy
   ```

## Performance Tuning

### Database Optimization

```bash
# Update PostgreSQL config for 512MB memory
docker exec restaurant_postgres sh -c 'echo "
shared_buffers = 128MB
effective_cache_size = 384MB
maintenance_work_mem = 64MB
max_connections = 100
" >> /var/lib/postgresql/data/postgresql.conf'

docker compose restart postgres
```

### Redis Optimization

```bash
# Check Redis memory usage
docker exec restaurant_redis redis-cli INFO memory

# Adjust maxmemory if needed (already set in docker-compose.prod.yml)
# Current: 128MB with allkeys-lru eviction
```

### Application Optimization

```bash
# Check Node.js memory usage
docker exec restaurant_server node -e "console.log(process.memoryUsage())"

# Increase Node.js memory limit if needed
# Edit docker-compose.prod.yml:
# environment:
#   NODE_OPTIONS: --max-old-space-size=384
```

### CDN and Caching

**Cloudflare Settings**:
- Enable Auto Minify (HTML, CSS, JS)
- Enable Brotli compression
- Set Browser Cache TTL: 4 hours
- Create Page Rules for static assets

**Caddy Caching**:
- Already configured with gzip/zstd compression
- Review access logs for optimization opportunities

## Scaling Guide

### Upgrade Droplet Size

1. **Before upgrading**:
   - Create backup: `./scripts/backup-db.sh`
   - Note current commit: `git rev-parse HEAD`

2. **Upgrade in Digital Ocean**:
   - Droplet → Actions → Resize
   - Choose new size (e.g., 4GB RAM - $24/month)
   - Click "Resize Droplet"
   - Wait for completion (~5 minutes)

3. **After upgrading**:
   - Verify: `free -h`
   - Update resource limits in `docker-compose.prod.yml`
   - Restart services: `docker compose -f docker-compose.prod.yml restart`

### Add Managed Database (Optional)

**Cost**: $15/month for basic plan

**Benefits**:
- Automated backups
- High availability
- Managed updates

**Migration**:
1. Create managed PostgreSQL in Digital Ocean
2. Export data: `pg_dump -U restaurant_admin restaurant_db > dump.sql`
3. Import to managed DB
4. Update `DATABASE_URL` in `.env.production`
5. Restart application

## Security Checklist

### Regular Security Tasks

**Weekly**:
- [ ] Review fail2ban logs: `sudo fail2ban-client status sshd`
- [ ] Check for unauthorized SSH attempts: `sudo last`
- [ ] Monitor resource usage

**Monthly**:
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Review and update secrets if needed
- [ ] Check SSL certificate validity
- [ ] Review Cloudflare security events

**Quarterly**:
- [ ] Rotate JWT secret and database passwords
- [ ] Security audit: `sudo lynis audit system`
- [ ] Review and update firewall rules
- [ ] Test disaster recovery procedures

### Security Incident Response

1. **Unauthorized Access Detected**:
   - Change all passwords immediately
   - Review access logs: `sudo last -f /var/log/auth.log`
   - Block suspicious IPs: `sudo ufw deny from IP_ADDRESS`
   - Rotate all secrets

2. **Data Breach Suspected**:
   - Take droplet snapshot immediately
   - Isolate affected services
   - Review database audit logs
   - Contact security team/advisor

## Common Commands Reference

```bash
# Service Management
docker compose -f /opt/restaurant/docker-compose.prod.yml ps
docker compose -f /opt/restaurant/docker-compose.prod.yml logs -f
docker compose -f /opt/restaurant/docker-compose.prod.yml restart SERVICE

# Deployment
cd /opt/restaurant && ./scripts/deploy.sh
cd /opt/restaurant && ./scripts/rollback.sh

# Database
./scripts/backup-db.sh
./scripts/restore-db.sh BACKUP_FILE
docker exec -it restaurant_postgres psql -U restaurant_admin -d restaurant_db

# Monitoring
./scripts/smoke-test.sh
docker stats
free -h
df -h

# Logs
docker compose logs -f server
tail -f /mnt/volume/logs/error.log
sudo tail -f /var/log/caddy/access.log

# Cleanup
docker system prune -af
find /mnt/volume/logs -name "*.log" -mtime +7 -delete
find /mnt/volume/backups -name "*.sql.gz" -mtime +14 -delete
```

## Emergency Contacts

- **Primary**: Your Name - your@email.com
- **Digital Ocean Support**: https://www.digitalocean.com/support
- **GitHub Support**: https://support.github.com
- **Cloudflare Support**: https://support.cloudflare.com

## Disaster Recovery

### Complete System Failure

**Recovery Time Objective (RTO)**: 1 hour
**Recovery Point Objective (RPO)**: 24 hours (daily backups)

**Procedure**:
1. Create new droplet (same configuration)
2. Attach volume (if volume survived) or restore from snapshot
3. Follow Phase 1 setup from DEPLOYMENT.md
4. Clone repository
5. Restore database from latest backup
6. Deploy application
7. Update DNS if IP changed
8. Verify all services working

### Data Corruption

**Procedure**:
1. Stop application: `docker compose down`
2. Identify corruption scope
3. Restore from latest good backup
4. Run database integrity checks
5. Restart application
6. Verify data integrity

## Notes

- Always test changes in development first
- Keep this runbook updated with any new procedures
- Document any incidents and resolutions
- Regular backup testing is critical
