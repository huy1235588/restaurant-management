# Design Document: Infrastructure Cleanup and Simplified Redeployment

## Context

### Current State
The project has accumulated deployment infrastructure over time that was never completed:
- 3 Docker Compose files (base, dev, prod) with overlapping configurations
- 5 deployment documentation files totaling 2500+ lines
- 6 shell scripts for deployment operations
- Complex Makefile with 30+ commands
- Nginx and Caddy reverse proxy configs
- Incomplete DigitalOcean deployment (10/298 tasks done)

### Problem
This creates several issues for a **student graduation project**:
1. **Complexity overload**: Too many options, unclear which to use
2. **Never deployed**: Despite extensive docs, project runs only locally
3. **Maintenance burden**: Confusing to update or troubleshoot
4. **Over-engineered**: Production-grade features unnecessary for thesis demo
5. **Cost concerns**: Current plan targets $12-20/month, may be overkill

### Constraints
- **Budget**: Ideally $0-5/month (student project)
- **Scope**: Graduation thesis demo, not production business
- **Timeline**: Need working deployment in 1-2 days max
- **Skills**: Solo developer, not DevOps expert
- **Requirements**: Must demonstrate cloud deployment for thesis

## Goals

### Primary Goals
1. **Simplicity**: Single source of truth for deployment
2. **Actually works**: Real deployed application, not just docs
3. **Low cost**: Minimize or eliminate monthly fees
4. **Quick setup**: Deploy in < 30 minutes from clean state
5. **Maintainable**: Easy to understand and update

### Non-Goals
- High availability (99.99% uptime)
- Auto-scaling or load balancing
- Multi-region deployment
- Advanced monitoring/alerting
- CI/CD pipelines (GitHub Actions)
- Database clustering
- Blue-green deployments

## Technical Decisions

### Decision 1: Deployment Platform Choice

**Options Evaluated:**

| Platform | Cost/Month | Complexity | Demo-Suitable | Decision |
|----------|-----------|------------|---------------|----------|
| **Vercel (Frontend) + Railway (Backend)** | $0-5 | Low | ✅ Yes | **RECOMMENDED** |
| DigitalOcean Single Droplet | $6-12 | Medium | ✅ Yes | Alternative |
| Heroku (Full Stack) | $0-7 | Low | ✅ Yes | Deprecated |
| AWS EC2 | $8-15 | High | ⚠️ Complex | Not suitable |
| Local + ngrok | $0 | Low | ⚠️ Unreliable | Emergency only |

**Decision: Vercel + Railway (Option A)**

**Rationale:**
- **Vercel for Next.js frontend**: 
  - Free tier sufficient for demos
  - Excellent Next.js support (zero config)
  - Automatic SSL, CDN, serverless deployment
  - Custom domain support (free)
  
- **Railway for Express backend + PostgreSQL + Redis**:
  - $5 credit/month on free tier (sufficient for demo)
  - One-click PostgreSQL and Redis
  - Simple deployment from GitHub
  - Automatic SSL/HTTPS
  - Free tier includes 500 hours ($5 equivalent)

**Why not DigitalOcean Droplet?**
- More complex setup (Docker, server management)
- Higher cost ($12/month minimum)
- Requires system administration knowledge
- Overkill for a demo project

**Fallback Option B: DigitalOcean Droplet**
If Railway proves insufficient, use single $6 droplet with Docker Compose. Keep this option documented but not primary.

### Decision 2: Local Development Setup

**Decision: Simplified Docker Compose for local dev only**

**Structure:**
```
docker-compose.yml  # Single file for local development
├── postgres
├── redis
└── (client and server run via pnpm, not Docker)
```

**Rationale:**
- Services (DB, Redis) in Docker for consistency
- App code runs natively for fast hot reload
- Simpler than multi-stage Docker builds
- Matches typical Next.js + Express dev workflow

**Alternative considered**: Run everything in Docker
- **Rejected**: Slower hot reload, more complex volume mounts, Windows path issues

### Decision 3: Directory Structure

**Decision: Create dedicated `deploy/` directory**

**New Structure:**
```
deploy/
├── README.md                          # Single deployment guide
├── .env.example                       # Environment template
├── docker-compose.yml                 # Local dev (DB + Redis only)
├── railway/
│   ├── railway.json                   # Railway config (if needed)
│   └── Procfile                       # Start commands
├── digitalocean/                      # Alternative deployment
│   ├── docker-compose.production.yml  # Full stack Docker
│   └── setup.md                       # VPS setup guide
└── scripts/
    ├── setup-local.sh                 # Initialize local dev
    ├── backup-db.sh                   # Simple backup script
    └── restore-db.sh                  # Simple restore script
```

**Rationale:**
- Clear separation: deployment vs application code
- Multiple deployment options without cluttering root
- Scripts colocated with relevant configs
- Easy to understand and navigate

**What gets removed from root:**
- `docker-compose*.yml` (3 files)
- `Caddyfile`
- `Makefile`
- `docker.sh`, `docker.ps1`
- `nginx/`
- `scripts/` (old scripts)

### Decision 4: Documentation Strategy

**Decision: Single README.md in deploy/ directory**

**Content Outline:**
```markdown
# Deployment Guide

## Quick Start (Local Development)
- 3-step setup for local dev

## Option A: Deploy to Vercel + Railway (Recommended)
- Frontend to Vercel
- Backend + DB to Railway
- Step-by-step guide (< 20 steps)

## Option B: Deploy to DigitalOcean (Alternative)
- Single VPS setup
- Docker Compose deployment
- For when you need full control

## Troubleshooting
- Common issues and solutions

## Cost Breakdown
- Expected monthly costs per option
```

**Rationale:**
- Single source of truth (vs 5 fragmented docs)
- Progressive disclosure: quick start → full deployment
- Under 400 lines vs current 3000+ lines
- Easier to maintain and update

### Decision 5: Scripts Philosophy

**Decision: Minimal scripts, prefer documentation**

**Keep only:**
1. `setup-local.sh` - Initialize .env, start Docker services
2. `backup-db.sh` - Backup PostgreSQL
3. `restore-db.sh` - Restore PostgreSQL

**Remove:**
- `deploy.sh` (replaced by platform-specific guides)
- `rollback.sh` (not needed for demo)
- `generate-secrets.sh` (inline in setup-local.sh)
- `smoke-test.sh` (manual testing sufficient)

**Rationale:**
- Scripts can become outdated and confusing
- Platform UIs (Vercel, Railway) handle most deployment
- Documentation is clearer for one-time setup
- Fewer scripts = less maintenance

### Decision 6: Environment Variables

**Decision: Consolidated .env.example with clear sections**

**Structure:**
```env
# ========================================
# LOCAL DEVELOPMENT
# ========================================
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/restaurant_db
REDIS_URL=redis://localhost:6379

# ========================================
# PRODUCTION (Vercel + Railway)
# ========================================
# These are set in platform dashboards
# NEXT_PUBLIC_API_URL=https://api.yourapp.com
# DATABASE_URL=(Railway provides)
# REDIS_URL=(Railway provides)

# ========================================
# SECRETS (Generate new values!)
# ========================================
JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_CHARS
JWT_REFRESH_SECRET=CHANGE_THIS_TOO

# ========================================
# OPTIONAL: File Storage
# ========================================
STORAGE_TYPE=local  # or 'r2' or 'cloudinary'
# ... R2 config if needed
```

**Rationale:**
- Clear sections for different environments
- Comments explain what to change
- Inline documentation reduces need for separate guide

## Architecture

### Local Development Flow
```
Developer
   ↓
pnpm dev (client) ←→ pnpm dev (server)
                          ↓
              PostgreSQL (Docker) + Redis (Docker)
```

### Production Deployment Flow (Vercel + Railway)
```
GitHub Repository
   ├─→ Vercel (Next.js)
   └─→ Railway (Express + PostgreSQL + Redis)
           ↓
      Public URLs
```

### Alternative Deployment Flow (DigitalOcean)
```
GitHub Repository
   ↓
Digital Ocean Droplet
   ↓
Docker Compose
   ├─→ Client Container
   ├─→ Server Container
   ├─→ PostgreSQL Container
   └─→ Redis Container
```

## Migration Plan

### Phase 1: Archive Old Files (30 min)
1. Create `_archive/deployment-v1/` directory
2. Move all old deployment files:
   - `docker-compose*.yml` → `_archive/`
   - `Caddyfile` → `_archive/`
   - `Makefile` → `_archive/`
   - `nginx/` → `_archive/`
   - `scripts/` → `_archive/`
   - `docs/deployment/` → `_archive/`
   - `docs/technical/DOCKER.md` → `_archive/`
3. Git commit: "archive: Move old deployment infrastructure to _archive/"

### Phase 2: Create New Structure (1 hour)
1. Create `deploy/` directory
2. Create `deploy/docker-compose.yml` (local dev only)
3. Create `deploy/README.md` (deployment guide)
4. Create `deploy/.env.example`
5. Create `deploy/scripts/setup-local.sh`
6. Test local development setup
7. Git commit: "feat: Add simplified deployment structure"

### Phase 3: Implement Primary Deployment (2-4 hours)
1. Set up Vercel account and connect GitHub
2. Deploy frontend to Vercel
3. Set up Railway account and connect GitHub
4. Deploy backend to Railway
5. Provision PostgreSQL and Redis on Railway
6. Configure environment variables
7. Test deployment end-to-end
8. Document in `deploy/README.md`
9. Git commit: "feat: Deploy to Vercel + Railway"

### Phase 4: Document Alternative (1 hour)
1. Create `deploy/digitalocean/` directory
2. Write `setup.md` for VPS deployment
3. Create `docker-compose.production.yml`
4. Git commit: "docs: Add DigitalOcean deployment option"

### Phase 5: Cleanup (30 min)
1. Update root `README.md` with new deployment links
2. Remove references to old deployment in docs
3. Final testing of all workflows
4. Git commit: "docs: Update README with new deployment"

## Rollback Strategy

If new deployment fails:
1. Old files preserved in `_archive/deployment-v1/`
2. Can restore with: `git revert <commit>`
3. Original deployment docs still available
4. No data loss (database backups maintained)

## Open Questions

1. **Should we support both Vercel+Railway AND DigitalOcean?**
   - **Recommendation**: Primary = Vercel+Railway, DigitalOcean as documented alternative
   
2. **Keep old archive in Git or delete entirely?**
   - **Recommendation**: Keep in `_archive/` for reference, can delete in 6 months
   
3. **Database seeding for demo?**
   - **Recommendation**: Create simple seed script with realistic demo data
   
4. **Custom domain for thesis presentation?**
   - **Recommendation**: Optional, Vercel provides free subdomain (app-name.vercel.app)

5. **Monitoring/logging for deployed app?**
   - **Recommendation**: Use platform built-in (Vercel Analytics free, Railway logs free)

## Success Metrics

**Quantitative:**
- Deployment time: < 30 min (vs current unknown/impossible)
- Documentation: < 400 lines (vs 3000+)
- Scripts: < 200 lines (vs 1000+)
- Config files: < 150 lines (vs 600+)
- Monthly cost: $0-5 (vs planned $12-20)

**Qualitative:**
- Anyone can follow the guide and deploy
- Clear which deployment option to choose
- Easy to troubleshoot issues
- Suitable for thesis demonstration
- Demonstrates cloud deployment skills

## Risks and Mitigations

### Risk 1: Railway free tier insufficient
- **Impact**: App usage exceeds $5/month credit
- **Mitigation**: Monitor usage, optimize queries, add $5/month if needed
- **Fallback**: Switch to DigitalOcean option

### Risk 2: Vercel build size too large
- **Impact**: Next.js build exceeds free tier limits
- **Mitigation**: Optimize bundle, remove unused dependencies
- **Fallback**: Use DigitalOcean for frontend too

### Risk 3: WebSocket support on platforms
- **Impact**: Socket.io may not work on serverless
- **Mitigation**: Railway supports WebSocket, use Railway URL for sockets
- **Fallback**: Polling fallback in Socket.io config

### Risk 4: Database migrations on Railway
- **Impact**: Prisma migrations may fail
- **Mitigation**: Test migrations thoroughly, keep backup
- **Fallback**: Manual SQL via Railway dashboard

### Risk 5: Lost deployment knowledge from old docs
- **Impact**: Some useful info discarded
- **Mitigation**: Archive everything, review before deleting
- **Fallback**: Git history preserves all old docs

## References

- Vercel Documentation: https://vercel.com/docs
- Railway Documentation: https://docs.railway.app
- DigitalOcean Tutorials: https://www.digitalocean.com/community/tutorials
- Docker Compose Production: https://docs.docker.com/compose/production/
- Current deployment docs: `docs/deployment/`
- Incomplete deployment change: `openspec/changes/deploy-to-digitalocean/`
