# Specification: Digital Ocean Deployment

## ADDED Requirements

### Requirement: Infrastructure Provisioning
The system SHALL provide infrastructure setup on Digital Ocean optimized for student budget constraints.

#### Scenario: Provision Digital Ocean Droplet
**GIVEN** a Digital Ocean account with student credits  
**WHEN** provisioning infrastructure  
**THEN** the system shall:
- Create a 2GB RAM Basic Droplet running Ubuntu 22.04 LTS
- Attach a 25GB Block Storage Volume for persistent data
- Configure firewall rules (UFW) allowing ports 22, 80, 443
- Set up SSH key-based authentication (password login disabled)
- Install Docker Engine 24.0+ and Docker Compose V2+
- Configure automatic security updates
- Set up swap space (2GB) for memory management

#### Scenario: Configure Volume Storage
**GIVEN** an attached Digital Ocean Volume  
**WHEN** setting up persistent storage  
**THEN** the system shall:
- Mount volume at `/mnt/volume`
- Create directory structure: `/mnt/volume/{postgres,redis,uploads,backups,logs}`
- Set proper permissions (docker group access)
- Configure automatic mount on reboot via `/etc/fstab`
- Verify write permissions and disk space

#### Scenario: Apply Student Cost Optimization
**GIVEN** a Digital Ocean account  
**WHEN** setting up the project  
**THEN** the system shall:
- Apply GitHub Student Developer Pack credits ($200)
- Use smallest viable droplet size (2GB RAM)
- Enable droplet backups only if required (adds 20% cost)
- Use container-based database instead of managed service
- Document monthly cost breakdown in deployment guide

---

### Requirement: Production Docker Configuration
The system SHALL configure Docker containers for production deployment with resource limits and health checks.

#### Scenario: Production Docker Compose Configuration
**GIVEN** the existing docker-compose.yml  
**WHEN** preparing for production deployment  
**THEN** the system shall create `docker-compose.prod.yml` with:
- Resource limits for each container (memory, CPU)
- Restart policies set to `unless-stopped`
- Health checks for all services
- Volume mounts pointing to Digital Ocean Volume paths
- Environment variables loaded from `.env.production`
- Network configuration for service isolation
- Logging drivers with rotation (max 3 files, 10MB each)

#### Scenario: Container Resource Allocation
**GIVEN** a 2GB RAM droplet  
**WHEN** configuring Docker containers  
**THEN** the system shall allocate:
- PostgreSQL: 512MB memory limit
- Redis: 128MB memory limit
- Backend (Express): 384MB memory limit
- Frontend (Next.js): 384MB memory limit
- Reverse proxy (Caddy): 64MB memory limit
- CPU shares proportional to memory allocation

#### Scenario: Container Health Checks
**GIVEN** deployed Docker containers  
**WHEN** containers are running  
**THEN** the system shall implement health checks:
- PostgreSQL: `pg_isready` command every 30s
- Redis: `redis-cli ping` every 30s
- Backend: HTTP GET `/api/health` every 30s
- Frontend: HTTP GET `/health` every 30s
- Unhealthy containers restart after 3 failed checks

---

### Requirement: CI/CD Pipeline with GitHub Actions
The system SHALL automate deployment through GitHub Actions with testing, building, and deployment stages.

#### Scenario: Automated Deployment Workflow
**GIVEN** a commit pushed to main branch  
**WHEN** the commit includes deployment-ready code  
**THEN** GitHub Actions shall:
1. Run linting and type checking
2. Run unit and integration tests
3. Build Docker images for client and server
4. Tag images with commit SHA and branch name
5. Push images to GitHub Container Registry
6. SSH to Digital Ocean droplet
7. Pull latest images
8. Execute blue-green deployment
9. Run smoke tests
10. Send notification on success/failure

#### Scenario: Blue-Green Deployment Execution
**GIVEN** new Docker images are available  
**WHEN** deploying to production  
**THEN** the system shall:
- Start new containers (blue environment) on alternate ports
- Wait for health checks to pass on blue environment
- Run smoke tests against blue environment
- Switch reverse proxy to route to blue environment
- Gracefully stop old containers (green environment)
- Cleanup unused images and containers
- Rollback to green if blue health checks fail

#### Scenario: Deployment Rollback
**GIVEN** a failed deployment  
**WHEN** health checks fail or errors are detected  
**THEN** the system shall:
- Preserve previous container state
- Switch reverse proxy back to previous version
- Log rollback reason
- Notify deployment failure via email/GitHub
- Keep failed containers for debugging (24 hours)

---

### Requirement: SSL/TLS and Domain Configuration
The system SHALL provide secure HTTPS access via Cloudflare SSL termination.

#### Scenario: Cloudflare SSL Setup
**GIVEN** a domain or Digital Ocean droplet IP  
**WHEN** configuring SSL/TLS  
**THEN** the system shall:
- Configure Cloudflare as DNS provider
- Enable Cloudflare SSL/TLS (Full or Flexible mode)
- Set up A record pointing to droplet IP
- Configure SSL/TLS settings (min TLS 1.2)
- Enable automatic HTTPS rewrites
- Enable HTTP Strict Transport Security (HSTS)
- Configure Cloudflare caching rules for static assets

#### Scenario: Reverse Proxy Configuration
**GIVEN** Cloudflare SSL termination  
**WHEN** setting up reverse proxy  
**THEN** the system shall configure Caddy to:
- Listen on ports 80 and 443
- Proxy `/` to Next.js frontend (port 3000)
- Proxy `/api` to Express backend (port 5000)
- Support WebSocket connections for Socket.io
- Add security headers (X-Frame-Options, X-Content-Type-Options)
- Enable gzip compression
- Set proper CORS headers

---

### Requirement: Environment Configuration Management
The system SHALL manage environment-specific configurations securely.

#### Scenario: Production Environment Variables
**GIVEN** a production deployment  
**WHEN** configuring environment variables  
**THEN** the system shall:
- Store sensitive secrets in GitHub Secrets
- Create `.env.production` file on droplet with production values
- Set restrictive file permissions (600) on `.env` files
- Use strong, randomly generated secrets (32+ characters)
- Configure production DATABASE_URL pointing to internal container
- Set NODE_ENV to 'production'
- Configure REDIS_URL to internal container
- Set proper CLIENT_URL and API_URL for public access

#### Scenario: Secret Management
**GIVEN** sensitive credentials  
**WHEN** deploying to production  
**THEN** the system shall:
- Never commit secrets to Git repository
- Store in GitHub Secrets: JWT_SECRET, POSTGRES_PASSWORD, SSH_KEY, CLOUDINARY_API_SECRET
- Transfer secrets to droplet via SSH during deployment
- Rotate secrets every 90 days (documented procedure)
- Use environment variables instead of config files
- Encrypt backup files containing sensitive data

---

### Requirement: Database Backup and Recovery
The system SHALL implement automated database backups with tested recovery procedures.

#### Scenario: Automated Daily Backups
**GIVEN** a production database  
**WHEN** backup time is reached  
**THEN** the system shall:
- Execute `pg_dump` via cron at 2 AM daily
- Compress backup with gzip
- Store in `/mnt/volume/backups/postgres/backup_YYYYMMDD_HHMMSS.sql.gz`
- Retain last 14 daily backups
- Delete backups older than 14 days
- Verify backup file integrity (non-zero size, valid gzip)
- Log backup success/failure

#### Scenario: Manual Backup Before Deployment
**GIVEN** an upcoming deployment  
**WHEN** triggering deployment workflow  
**THEN** the system shall:
- Create a pre-deployment database backup
- Tag backup with deployment version/commit SHA
- Verify backup completion before proceeding
- Abort deployment if backup fails

#### Scenario: Database Recovery from Backup
**GIVEN** a corrupted database or data loss  
**WHEN** performing database recovery  
**THEN** the system shall:
- Stop application containers
- Drop and recreate database
- Restore from latest backup using `psql`
- Run Prisma migrations to ensure schema compatibility
- Verify data integrity with sample queries
- Restart application containers
- Complete recovery within 30 minutes (RTO target)

#### Scenario: Weekly Volume Snapshots
**GIVEN** a Digital Ocean Volume  
**WHEN** snapshot schedule is triggered  
**THEN** the system shall:
- Create Digital Ocean Volume snapshot via API
- Tag snapshot with date and type (weekly/manual)
- Retain last 4 weekly snapshots
- Delete snapshots older than 4 weeks
- Estimate cost ($0.05/GB/month)

---

### Requirement: Monitoring and Health Checks
The system SHALL provide monitoring, logging, and alerting for production environment.

#### Scenario: Application Health Endpoints
**GIVEN** deployed application  
**WHEN** implementing health checks  
**THEN** the system shall provide:
- Backend endpoint: GET `/api/health` returning service status
- Frontend endpoint: GET `/health` returning application status
- Health response includes: uptime, timestamp, service statuses (DB, Redis)
- Health checks respond within 1 second
- Return HTTP 200 for healthy, 503 for unhealthy

#### Scenario: Log Management
**GIVEN** running application  
**WHEN** generating logs  
**THEN** the system shall:
- Use Winston for structured JSON logging
- Log levels: error, warn, info, debug
- Rotate log files (max 10MB per file, keep 5 files)
- Store logs in `/mnt/volume/logs/{service}/`
- Include timestamp, level, message, metadata in each log
- Separate error logs from combined logs
- Implement log retention (30 days)

#### Scenario: Digital Ocean Monitoring Alerts
**GIVEN** a running droplet  
**WHEN** resource thresholds are exceeded  
**THEN** the system shall trigger alerts for:
- CPU usage > 80% for 10 minutes
- Memory usage > 90% for 5 minutes
- Disk usage > 85%
- Droplet unreachable for 5 minutes
- HTTP response time > 5 seconds
- HTTP 5xx error rate > 10 per minute
- Send email notifications to configured address

#### Scenario: Application Metrics Collection
**GIVEN** running application  
**WHEN** collecting metrics  
**THEN** the system shall track:
- Request count and response times
- Active WebSocket connections
- Database query execution times
- Redis cache hit/miss ratio
- Container resource usage (Docker stats)
- Error rates by endpoint
- Available via `/api/metrics` endpoint

---

### Requirement: Security Hardening
The system SHALL implement security best practices for production deployment.

#### Scenario: Firewall Configuration
**GIVEN** a Digital Ocean droplet  
**WHEN** configuring firewall  
**THEN** the system shall:
- Use UFW (Uncomplicated Firewall)
- Default policy: deny incoming, allow outgoing
- Allow port 22 (SSH) - optionally restrict to specific IPs
- Allow port 80 (HTTP) for Cloudflare IPs only
- Allow port 443 (HTTPS) for Cloudflare IPs only
- Block all other incoming ports
- Enable firewall on boot

#### Scenario: SSH Hardening
**GIVEN** SSH access to droplet  
**WHEN** configuring SSH  
**THEN** the system shall:
- Disable password authentication (key-based only)
- Disable root login
- Create deploy user with sudo access
- Use ED25519 or RSA 4096-bit SSH keys
- Change default SSH port to non-standard (optional)
- Install fail2ban to prevent brute force attacks
- Set SSH idle timeout (15 minutes)

#### Scenario: Docker Security
**GIVEN** Docker containers  
**WHEN** running in production  
**THEN** the system shall:
- Run containers as non-root users where possible
- Use official, minimal base images (Alpine)
- Scan images for vulnerabilities before deployment
- Set container capabilities drop (no unnecessary privileges)
- Use Docker secrets for sensitive data (not environment variables)
- Isolate containers in internal network
- Expose only necessary ports

#### Scenario: Application Security Headers
**GIVEN** HTTP responses  
**WHEN** serving content  
**THEN** the system shall include headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: (restrictive policy)
- Referrer-Policy: no-referrer-when-downgrade

---

### Requirement: Performance Optimization
The system SHALL optimize application performance for resource-constrained environment.

#### Scenario: Backend Performance Optimization
**GIVEN** Express backend on limited resources  
**WHEN** handling requests  
**THEN** the system shall:
- Enable gzip compression for responses
- Implement Redis caching for frequent queries
- Use database connection pooling (max 10 connections)
- Add database indexes on frequently queried columns
- Implement rate limiting (100 requests/15min per IP)
- Enable HTTP/2 support
- Optimize Prisma queries (select only needed fields)
- Use lazy loading for related data

#### Scenario: Frontend Performance Optimization
**GIVEN** Next.js frontend  
**WHEN** serving pages  
**THEN** the system shall:
- Use Static Site Generation (SSG) where possible
- Implement incremental static regeneration (ISR)
- Enable Next.js image optimization
- Lazy load images with proper sizing
- Split code by routes and components
- Minimize JavaScript bundle size
- Enable tree-shaking for unused code
- Use Cloudflare CDN for static assets

#### Scenario: Database Query Optimization
**GIVEN** PostgreSQL database  
**WHEN** executing queries  
**THEN** the system shall:
- Add indexes on foreign keys and frequently filtered columns
- Use EXPLAIN ANALYZE to identify slow queries
- Implement query result caching in Redis
- Avoid N+1 queries (use joins or includes)
- Set appropriate connection pool size
- Configure PostgreSQL shared_buffers (128MB)
- Enable query logging for queries > 1 second

---

### Requirement: Deployment Documentation
The system SHALL provide comprehensive documentation for deployment and operations.

#### Scenario: Deployment Guide Creation
**GIVEN** completed infrastructure setup  
**WHEN** documenting deployment  
**THEN** the system shall provide documentation covering:
- Prerequisites (accounts, tools, access)
- Step-by-step initial setup instructions
- Environment variable configuration
- Domain and SSL setup with Cloudflare
- GitHub Actions secrets configuration
- First deployment process
- Health check verification
- Troubleshooting common issues
- Cost breakdown and optimization tips
- Backup and recovery procedures

#### Scenario: Operations Runbook
**GIVEN** production deployment  
**WHEN** operating the system  
**THEN** the system shall provide runbook for:
- Accessing the droplet (SSH)
- Viewing logs (Docker logs, Winston logs)
- Manual deployment steps
- Rollback procedures
- Database backup and restore
- Scaling resources (vertical upgrade)
- Security incident response
- Disaster recovery procedures
- Performance troubleshooting
- Cost monitoring and optimization

#### Scenario: Cost Monitoring Documentation
**GIVEN** active Digital Ocean resources  
**WHEN** monitoring costs  
**THEN** the system shall document:
- Monthly cost breakdown by resource
- Student credit application process
- Billing alerts setup
- Resource utilization monitoring
- Optimization opportunities
- Estimated credit burn rate
- Cost reduction strategies
- Alternative configurations

---

### Requirement: Disaster Recovery Plan
The system SHALL define and implement disaster recovery procedures.

#### Scenario: Complete System Recovery
**GIVEN** a catastrophic failure (droplet destroyed)  
**WHEN** performing disaster recovery  
**THEN** the system shall:
1. Create new droplet from latest Volume snapshot
2. Attach existing Volume with all data
3. Install Docker and dependencies
4. Clone application repository
5. Restore environment variables from secure backup
6. Start Docker containers
7. Verify database integrity
8. Update DNS/Cloudflare to new IP
9. Run smoke tests
10. Complete recovery within 60 minutes

#### Scenario: Data Corruption Recovery
**GIVEN** corrupted or deleted data  
**WHEN** data loss is detected  
**THEN** the system shall:
- Identify data loss scope and cause
- Select appropriate backup (daily or pre-deployment)
- Create current state backup before restoration
- Restore from backup to staging/separate instance
- Verify restored data integrity
- Merge or replace production data
- Document incident and root cause

#### Scenario: Security Breach Response
**GIVEN** a suspected security breach  
**WHEN** breach is confirmed  
**THEN** the system shall:
- Immediately isolate affected systems
- Change all credentials (SSH keys, database passwords, JWT secrets)
- Review access logs and audit trails
- Restore from known-good backup if compromised
- Apply security patches
- Document incident and lessons learned
- Notify relevant parties (if required)

---

## Requirements Summary

**Infrastructure**: 7 scenarios covering droplet setup, volume storage, cost optimization  
**Docker**: 3 scenarios covering production config, resource limits, health checks  
**CI/CD**: 3 scenarios covering automated deployment, blue-green deployment, rollback  
**SSL**: 2 scenarios covering Cloudflare SSL and reverse proxy  
**Environment**: 2 scenarios covering production env vars and secret management  
**Backup**: 4 scenarios covering automated backups, recovery, snapshots  
**Monitoring**: 4 scenarios covering health checks, logging, alerts, metrics  
**Security**: 4 scenarios covering firewall, SSH, Docker, application security  
**Performance**: 3 scenarios covering backend, frontend, database optimization  
**Documentation**: 3 scenarios covering deployment guide, runbook, cost monitoring  
**Disaster Recovery**: 3 scenarios covering system recovery, data recovery, breach response  

**Total**: 38 scenarios across 11 requirement areas
