# Tasks: Infrastructure Cleanup and Simplified Redeployment

## Overview
This task list implements the complete cleanup of existing deployment infrastructure and rebuilds it with an optimized, simplified structure suitable for a student graduation project.

**Estimated Total Time**: 8-12 hours
**Complexity**: Medium
**Priority**: High

---

## Phase 1: Preparation and Backup (30 minutes)

### 1.1 Document Current State
- [ ] Create list of all deployment-related files
- [ ] Document current local dev setup (what works, what doesn't)
- [ ] Screenshot current folder structure
- [ ] Note any deployment-related environment variables in use
- [ ] Commit any uncommitted changes to git

### 1.2 Create Archive Directory
- [ ] Create `_archive/deployment-v1/` directory in project root
- [ ] Document reason for archival in `_archive/deployment-v1/README.md`
- [ ] Ensure git is clean before proceeding

---

## Phase 2: Cleanup - Remove Old Infrastructure (1 hour)

### 2.1 Move Docker Files to Archive
- [ ] Move `docker-compose.yml` → `_archive/deployment-v1/`
- [ ] Move `docker-compose.dev.yml` → `_archive/deployment-v1/`
- [ ] Move `docker-compose.prod.yml` → `_archive/deployment-v1/`
- [ ] Move `Caddyfile` → `_archive/deployment-v1/`
- [ ] Move `Makefile` → `_archive/deployment-v1/`
- [ ] Move `docker.sh` → `_archive/deployment-v1/`
- [ ] Move `docker.ps1` → `_archive/deployment-v1/`
- [ ] Git commit: "archive: Move Docker configs to archive"

### 2.2 Move Scripts to Archive
- [ ] Move entire `scripts/` directory → `_archive/deployment-v1/scripts/`
  - `backup-db.sh`
  - `deploy.sh`
  - `restore-db.sh`
  - `rollback.sh`
  - `generate-secrets.sh`
  - `smoke-test.sh`
- [ ] Git commit: "archive: Move deployment scripts to archive"

### 2.3 Move Nginx and Reverse Proxy Configs
- [ ] Move `nginx/` directory → `_archive/deployment-v1/nginx/`
- [ ] Git commit: "archive: Move nginx configs to archive"

### 2.4 Move Deployment Documentation
- [ ] Move `docs/deployment/` → `_archive/deployment-v1/docs/deployment/`
  - `DEPLOYMENT.md`
  - `DEPLOYMENT_QUICK_REFERENCE.md`
  - `DEPLOYMENT_IMPLEMENTATION_SUMMARY.md`
  - `OPERATIONS.md`
  - `COST_OPTIMIZATION.md`
- [ ] Move `docs/technical/DOCKER.md` → `_archive/deployment-v1/docs/DOCKER.md`
- [ ] Git commit: "archive: Move deployment docs to archive"

### 2.5 Archive Incomplete Deployment Change
- [ ] Run `openspec archive deploy-to-digitalocean --skip-specs --yes` (or manual move)
- [ ] Verify change is moved to `openspec/changes/archive/`
- [ ] Git commit: "archive: Move incomplete deploy-to-digitalocean change"

### 2.6 Cleanup References in Code
- [ ] Search for references to old Docker files in README.md
- [ ] Search for references to old scripts in documentation
- [ ] Update any broken links in remaining docs
- [ ] Remove obsolete sections from main README.md
- [ ] Git commit: "docs: Remove references to archived deployment"

---

## Phase 3: Build New Structure (2 hours)

### 3.1 Create Deploy Directory Structure
- [ ] Create `deploy/` directory in project root
- [ ] Create `deploy/scripts/` subdirectory
- [ ] Create `deploy/railway/` subdirectory
- [ ] Create `deploy/digitalocean/` subdirectory
- [ ] Git commit: "feat: Create new deploy directory structure"

### 3.2 Create Docker Compose for Local Development
- [ ] Create `deploy/docker-compose.yml` with:
  - PostgreSQL 16 service
  - Redis 7 service
  - Proper health checks
  - Volume mounts for data persistence
  - Network configuration
  - Only services, NOT client/server (run natively)
- [ ] Test: `docker-compose -f deploy/docker-compose.yml up -d`
- [ ] Verify PostgreSQL accessible on localhost:5432
- [ ] Verify Redis accessible on localhost:6379
- [ ] Git commit: "feat: Add simplified Docker Compose for local dev"

### 3.3 Create Environment Template
- [ ] Create `deploy/.env.example` with sections:
  - Local development variables
  - Production variables (commented)
  - Required secrets (with generation instructions)
  - Optional features (file storage, etc.)
  - Clear comments for each variable
- [ ] Document how to generate JWT secrets
- [ ] Git commit: "feat: Add comprehensive .env.example"

### 3.4 Create Local Setup Script
- [ ] Create `deploy/scripts/setup-local.sh` (Linux/Mac) that:
  - Checks for Docker installation
  - Copies .env.example to .env if not exists
  - Generates random JWT secrets
  - Starts Docker Compose services
  - Runs Prisma migrations
  - Seeds database with demo data
  - Prints success message with URLs
- [ ] Create `deploy/scripts/setup-local.ps1` (Windows PowerShell version)
- [ ] Test script on clean setup
- [ ] Git commit: "feat: Add local setup scripts"

### 3.5 Create Database Backup Scripts
- [ ] Create `deploy/scripts/backup-db.sh`:
  - Exports PostgreSQL dump
  - Saves with timestamp
  - Compresses output
  - Validates backup
- [ ] Create `deploy/scripts/restore-db.sh`:
  - Accepts backup file path
  - Prompts for confirmation
  - Restores database
  - Runs migrations if needed
- [ ] Test backup and restore flow
- [ ] Git commit: "feat: Add database backup/restore scripts"

---

## Phase 4: Primary Deployment - Vercel + Railway (4-6 hours)

### 4.1 Prepare Application for Platform Deployment
- [ ] Review `app/client/next.config.ts` for Vercel compatibility
- [ ] Ensure all API URLs use environment variables
- [ ] Add `app/server/Procfile` for Railway (if needed)
- [ ] Test build locally: `cd app/client && pnpm build`
- [ ] Test server build: `cd app/server && pnpm build`
- [ ] Git commit: "chore: Prepare app for platform deployment"

### 4.2 Deploy Frontend to Vercel
- [ ] Sign up/login to Vercel account
- [ ] Connect GitHub repository to Vercel
- [ ] Configure project:
  - Root Directory: `app/client`
  - Framework Preset: Next.js
  - Build Command: `pnpm build`
  - Install Command: `pnpm install`
- [ ] Set environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_API_URL` (Railway backend URL - will add later)
  - `NEXT_PUBLIC_SOCKET_URL` (Railway backend URL)
- [ ] Deploy and verify frontend loads
- [ ] Note Vercel deployment URL
- [ ] Test: Visit deployed URL, should show UI (API won't work yet)

### 4.3 Deploy Backend to Railway
- [ ] Sign up/login to Railway account
- [ ] Create new project
- [ ] Add PostgreSQL service:
  - Select PostgreSQL from catalog
  - Note provided `DATABASE_URL`
- [ ] Add Redis service:
  - Select Redis from catalog
  - Note provided `REDIS_URL`
- [ ] Deploy Express backend:
  - Connect GitHub repository
  - Root Directory: `app/server`
  - Start Command: `pnpm start` or `node dist/index.js`
  - Build Command: `pnpm build` (if needed)
- [ ] Configure environment variables in Railway:
  - `NODE_ENV=production`
  - `PORT=3000` (Railway default)
  - `DATABASE_URL=${DATABASE_URL}` (reference PostgreSQL)
  - `REDIS_URL=${REDIS_URL}` (reference Redis)
  - `JWT_SECRET` (generate secure random)
  - `JWT_REFRESH_SECRET` (generate secure random)
  - `CLIENT_URL` (Vercel URL from step 4.2)
  - `API_VERSION=v1`
  - `STORAGE_TYPE=r2` or `cloudinary` (if using)
  - Cloudflare R2 or Cloudinary credentials
- [ ] Deploy backend
- [ ] Check Railway logs for successful startup
- [ ] Note Railway deployment URL

### 4.4 Run Database Migrations on Railway
- [ ] Open Railway PostgreSQL shell or use local connection
- [ ] Run Prisma migrations:
  ```bash
  # Local with Railway DB URL
  DATABASE_URL="railway-postgres-url" pnpm prisma migrate deploy
  ```
- [ ] Optionally seed database with demo data
- [ ] Verify tables created in Railway PostgreSQL dashboard

### 4.5 Connect Frontend and Backend
- [ ] Update Vercel environment variables:
  - `NEXT_PUBLIC_API_URL=https://your-app.railway.app/api/v1`
  - `NEXT_PUBLIC_SOCKET_URL=https://your-app.railway.app`
- [ ] Redeploy frontend on Vercel (auto-triggers)
- [ ] Update Railway backend:
  - `CLIENT_URL=https://your-app.vercel.app`
- [ ] Redeploy backend on Railway

### 4.6 End-to-End Testing
- [ ] Visit Vercel frontend URL
- [ ] Test authentication (login/register)
- [ ] Test API calls (menu, orders, etc.)
- [ ] Test WebSocket connection (real-time updates)
- [ ] Test file uploads (if applicable)
- [ ] Test all major features:
  - Menu management
  - Order creation
  - Table management
  - Kitchen display
  - Billing
- [ ] Verify HTTPS (should be automatic)
- [ ] Test on mobile device
- [ ] Check browser console for errors
- [ ] Check Railway logs for backend errors

### 4.7 Document Deployment Process
- [ ] Create `deploy/railway/README.md` with:
  - Step-by-step deployment guide
  - Environment variable reference
  - Troubleshooting tips
  - Cost breakdown
  - Screenshots of key steps
- [ ] Update main `deploy/README.md` with Railway quick start
- [ ] Git commit: "docs: Document Vercel + Railway deployment"

---

## Phase 5: Alternative Deployment - DigitalOcean (Optional, 2-3 hours)

### 5.1 Create Production Docker Compose
- [ ] Create `deploy/digitalocean/docker-compose.production.yml` with:
  - Client service (Next.js production build)
  - Server service (Express production)
  - PostgreSQL service
  - Redis service
  - Proper resource limits
  - Health checks
  - Logging configuration
  - Volume mounts to `/mnt/volume`
- [ ] Create `deploy/digitalocean/.env.production.example`
- [ ] Test locally (if possible)
- [ ] Git commit: "feat: Add DigitalOcean Docker Compose config"

### 5.2 Document DigitalOcean Setup
- [ ] Create `deploy/digitalocean/README.md` with:
  - Droplet creation guide (Ubuntu 22.04, 2GB RAM)
  - Block storage setup
  - Docker installation
  - Security configuration (UFW, fail2ban)
  - Deployment steps
  - Domain and SSL with Caddy/Nginx (optional)
  - Backup strategy
  - Monitoring basics
  - Cost estimation
- [ ] Include simplified Caddyfile if using Caddy
- [ ] Git commit: "docs: Document DigitalOcean deployment option"

### 5.3 Test DigitalOcean Deployment (Optional)
- [ ] If budget/time allows, test actual deployment
- [ ] Create Droplet and follow own guide
- [ ] Document any issues found
- [ ] Update guide with corrections
- [ ] Git commit: "docs: Update DigitalOcean guide with test learnings"

---

## Phase 6: Documentation and Polish (1-2 hours)

### 6.1 Create Main Deployment README
- [ ] Create comprehensive `deploy/README.md` with:
  - Quick start for local development
  - Deployment option comparison table
  - Link to Vercel + Railway guide (primary)
  - Link to DigitalOcean guide (alternative)
  - Troubleshooting section
  - Cost comparison
  - FAQ
  - Contact/support info
- [ ] Ensure < 500 lines total
- [ ] Test all links work
- [ ] Git commit: "docs: Create main deployment README"

### 6.2 Update Root README
- [ ] Update main `README.md` with:
  - New deployment section pointing to `deploy/README.md`
  - Simplified quick start for local dev
  - Remove references to old deployment
  - Update architecture diagram if exists
- [ ] Verify all links work
- [ ] Git commit: "docs: Update root README with new deployment"

### 6.3 Update Project Documentation
- [ ] Update `docs/README.md` to remove old deployment references
- [ ] Update `openspec/project.md` constraints section (no production deployment → has deployment)
- [ ] Check for broken links across all docs
- [ ] Git commit: "docs: Update project docs for new deployment"

### 6.4 Create Migration Guide
- [ ] Create `deploy/MIGRATION.md` documenting:
  - What was removed and why
  - Where to find archived files
  - How to migrate from old setup to new
  - Key differences
  - Breaking changes
- [ ] Git commit: "docs: Add migration guide from old deployment"

---

## Phase 7: Testing and Validation (1 hour)

### 7.1 Test Local Development Setup
- [ ] Fresh clone repository
- [ ] Follow `deploy/README.md` quick start
- [ ] Verify can start local dev in < 5 minutes
- [ ] Verify all features work locally
- [ ] Document any issues

### 7.2 Verify Deployment Documentation
- [ ] Review all deployment docs for clarity
- [ ] Check for typos and broken links
- [ ] Ensure all steps are actionable
- [ ] Verify code blocks have correct syntax
- [ ] Test all commands mentioned

### 7.3 Performance Check
- [ ] Test deployed app load time
- [ ] Check Vercel analytics (if enabled)
- [ ] Check Railway resource usage
- [ ] Verify within free tier limits
- [ ] Document any optimization needed

### 7.4 Security Review
- [ ] Verify all secrets are environment variables (not hardcoded)
- [ ] Check CORS configuration is restrictive
- [ ] Verify HTTPS is working
- [ ] Review exposed ports
- [ ] Check for sensitive data in logs

---

## Phase 8: Finalization (30 minutes)

### 8.1 Create Summary
- [ ] Document total lines of code removed
- [ ] Document total lines of code added
- [ ] Calculate complexity reduction
- [ ] Measure deployment time improvement
- [ ] Document cost savings
- [ ] Update proposal.md with actual results

### 8.2 Final Commits
- [ ] Review all git commits for clarity
- [ ] Squash or reorder commits if needed
- [ ] Tag release: `git tag -a v2.0-deployment -m "Simplified deployment infrastructure"`
- [ ] Push to GitHub
- [ ] Create PR if using feature branch

### 8.3 Celebrate
- [ ] Test deployed app one final time
- [ ] Share deployment URL with advisor/committee
- [ ] Document in thesis if needed
- [ ] Take screenshots for presentation
- [ ] Mark all tasks complete! 🎉

---

## Rollback Plan

If anything goes wrong:
1. All old files preserved in `_archive/deployment-v1/`
2. Revert git commits: `git revert HEAD~N` (N = number of commits)
3. Restore archived files: `git checkout _archive/deployment-v1/`
4. Database backups maintained separately

---

## Success Criteria Checklist

- [ ] All old deployment files archived or removed from root
- [ ] New `deploy/` directory structure created
- [ ] Local development works with simplified docker-compose
- [ ] Application deployed to Vercel + Railway successfully
- [ ] Public URL accessible and working
- [ ] All major features functional on deployed app
- [ ] Deployment documented in single comprehensive README (< 500 lines)
- [ ] Can deploy from scratch in < 30 minutes
- [ ] Monthly cost $0-5 (Vercel free + Railway $5 credit)
- [ ] No breaking changes to application code
- [ ] Git history clean and meaningful
- [ ] Ready for thesis demonstration

---

## Notes

- **Estimated Total Time**: 8-12 hours depending on experience
- **Can be split**: Each phase can be done separately
- **Flexibility**: Can skip DigitalOcean (Phase 5) if Vercel+Railway works well
- **Testing**: Test each phase before proceeding to next
- **Documentation**: Keep notes of issues encountered for updating guides

---

## Dependencies Between Tasks

- Phase 2 (Cleanup) must complete before Phase 3 (Build)
- Phase 3.2 (Docker Compose) must complete before 3.4 (Setup Script)
- Phase 4.2 (Vercel) and 4.3 (Railway) can be done in parallel
- Phase 4.4 (Migrations) depends on 4.3 (Railway backend)
- Phase 4.5 (Connect) depends on 4.2 and 4.3
- Phase 5 (DigitalOcean) is independent and optional
- Phase 6 (Docs) should be done after successful Phase 4 deployment
- Phase 7 (Testing) should be last before Phase 8 (Finalization)
