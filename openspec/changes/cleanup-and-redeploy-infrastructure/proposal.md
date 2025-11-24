# Proposal: Cleanup and Redeploy Infrastructure from Scratch

## Change ID
`cleanup-and-redeploy-infrastructure`

## Summary
Completely remove all existing Docker configurations, DigitalOcean deployment documentation, and scripts, then redeploy the infrastructure from scratch with an optimized, simplified structure suitable for a student graduation project demo.

## Why

### Current Problems
1. **Fragmented deployment artifacts**: Multiple Docker Compose files (dev, prod, base), unclear which one to use
2. **Incomplete deployment**: The `deploy-to-digitalocean` change shows only 10/298 tasks completed, indicating deployment was never finished
3. **Over-engineered for demo**: Current setup includes production-grade features (managed DB options, multi-environment configs, CI/CD) that are unnecessary for a graduation thesis demo
4. **Confusing documentation**: 5 deployment docs with overlapping/contradictory information
5. **Unused infrastructure**: Caddyfile, nginx configs, Makefile, and 6 shell scripts that may not align with actual needs
6. **Maintenance burden**: Complex setup that's hard to understand and maintain for a solo student project
7. **Not actually deployed**: Despite extensive docs and configs, the project currently runs only locally

### Opportunity
- **Fresh start with clarity**: Rebuild with only what's actually needed for a demo deployment
- **Simplified structure**: Single source of truth for deployment configuration
- **Actually deploy it**: Create a working deployment that can be demonstrated for thesis
- **Cost-effective**: Optimize for minimal cost (~$5-10/month or free with student credits)
- **Maintainable**: Easy to understand, update, and troubleshoot

## What Changes

### 1. Cleanup (REMOVE)
- **BREAKING**: Remove `docker-compose.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml`
- **BREAKING**: Remove `Caddyfile` (replace with simpler reverse proxy if needed)
- **BREAKING**: Remove `nginx/` directory and configs
- **BREAKING**: Remove `Makefile` (too complex for simple deployment)
- **BREAKING**: Remove all shell scripts in `scripts/` directory:
  - `backup-db.sh`
  - `deploy.sh`
  - `restore-db.sh`
  - `rollback.sh`
  - `generate-secrets.sh`
  - `smoke-test.sh`
- **BREAKING**: Remove `docker.sh` and `docker.ps1` wrapper scripts
- **BREAKING**: Remove all deployment documentation in `docs/deployment/`:
  - `DEPLOYMENT.md`
  - `DEPLOYMENT_QUICK_REFERENCE.md`
  - `DEPLOYMENT_IMPLEMENTATION_SUMMARY.md`
  - `OPERATIONS.md`
  - `COST_OPTIMIZATION.md`
- **BREAKING**: Remove `docs/technical/DOCKER.md`
- **BREAKING**: Archive incomplete `deploy-to-digitalocean` change

### 2. Rebuild (ADD)
- **NEW**: Single `docker-compose.yml` for local development (simple, no profiles)
- **NEW**: Single `docker-compose.production.yml` for deployment (if using Docker in production)
- **NEW**: Consolidated `deploy/` directory structure:
  ```
  deploy/
  ├── README.md                    # Main deployment guide
  ├── docker-compose.local.yml     # Local dev setup
  ├── docker-compose.cloud.yml     # Cloud deployment (if needed)
  ├── scripts/
  │   ├── setup-env.sh             # Environment setup
  │   ├── deploy.sh                # Simple deploy script
  │   └── backup.sh                # Simple backup script
  └── examples/
      └── .env.production.example  # Production env template
  ```
- **NEW**: Simple deployment strategy document in `deploy/README.md`
- **NEW**: Choose ONE deployment approach:
  - **Option A**: Platform-as-a-Service (Vercel + Railway/Render) - Recommended for demo
  - **Option B**: Single VPS (DigitalOcean/Hetzner) with Docker if full control needed
  - **Option C**: Local deployment with ngrok/cloudflared for temporary demos

### 3. Simplify
- **Focus on demo needs**: Remove production-grade complexity (CI/CD, blue-green deployment, managed databases)
- **Single environment**: Development + one simple production/demo deployment
- **Minimal cost**: Target $0-5/month using free tiers or student credits
- **Easy to understand**: One README that anyone can follow
- **Quick to deploy**: Under 30 minutes from zero to deployed

## Impact

### Affected Files (DELETE)
- `docker-compose.yml` (259 lines)
- `docker-compose.dev.yml` (112 lines)
- `docker-compose.prod.yml` (186 lines)
- `Caddyfile` (53 lines)
- `Makefile` (235 lines)
- `docker.sh` (~100 lines)
- `docker.ps1` (~100 lines)
- `nginx/nginx.conf`
- `scripts/*.sh` (6 files, ~400 lines total)
- `docs/deployment/*.md` (5 files, ~2500 lines)
- `docs/technical/DOCKER.md` (~1050 lines)
- **Total removed**: ~5000+ lines of configuration and documentation

### Affected Files (CREATE/MODIFY)
- `deploy/README.md` (new, single source of truth)
- `deploy/docker-compose.local.yml` (new, simplified local dev)
- `deploy/scripts/setup-env.sh` (new, simple)
- `deploy/scripts/deploy.sh` (new, simple)
- `deploy/scripts/backup.sh` (new, simple)
- `.env.example` (update with clearer comments)
- `README.md` (update deployment section)
- **Total added**: ~500-800 lines (much simpler)

### Affected Capabilities
- **REMOVED**: `digitalocean-deployment` (incomplete, over-engineered)
- **NEW**: `simple-deployment` - Straightforward deployment suitable for graduation demo

### Migration Path
1. Archive all existing deployment files to `_archived/deployment-v1/` for reference
2. Create new simplified structure in `deploy/`
3. Test local development setup
4. Choose and implement ONE deployment approach
5. Deploy and verify
6. Update main README.md with new deployment instructions

## Dependencies
- None (this is a cleanup and fresh start)
- Existing application code remains unchanged
- Only deployment infrastructure changes

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Lose existing deployment knowledge | Medium | Low | Archive all existing files, document lessons learned |
| New deployment doesn't work | High | Medium | Test thoroughly before deleting old configs, keep archive |
| Cost overrun with new approach | Low | Low | Choose free/cheap option first, document costs clearly |
| Too simple for thesis requirements | Medium | Low | Ensure chosen approach demonstrates cloud deployment skills |
| Time to redeploy | Medium | Medium | Follow step-by-step guide, allocate proper time |

## Success Criteria
1. ✅ All old deployment files archived or deleted
2. ✅ New `deploy/` directory structure created
3. ✅ Local development works with simplified docker-compose
4. ✅ ONE deployment approach chosen and documented
5. ✅ Application successfully deployed to chosen platform
6. ✅ Deployment documented in single README.md (< 300 lines)
7. ✅ Total deployment scripts < 500 lines (vs current 5000+)
8. ✅ Can deploy from scratch in < 30 minutes
9. ✅ Monthly cost < $10 or $0 with free tiers
10. ✅ Demo-ready with public URL

## Alternatives Considered

### Alternative 1: Keep and Fix Current Setup
- **Pros**: Preserve existing work, comprehensive documentation
- **Cons**: Too complex, never finished, hard to maintain
- **Decision**: NOT chosen - starting fresh is cleaner

### Alternative 2: Minimal Cleanup Only
- **Pros**: Less work, keep some existing docs
- **Cons**: Still confusing, doesn't solve core problems
- **Decision**: NOT chosen - half-measures won't help

### Alternative 3: Complete Cleanup + Redeploy (CHOSEN)
- **Pros**: Clean slate, simple, maintainable, actually works
- **Cons**: Need to rebuild, lose some existing work
- **Decision**: CHOSEN - best for long-term clarity

## Timeline
- **Phase 1**: Cleanup (archive old files) - 1 hour
- **Phase 2**: Create new structure - 2 hours
- **Phase 3**: Choose and implement deployment - 4-6 hours
- **Phase 4**: Test and document - 2 hours
- **Total**: 1 day of focused work

## Questions for Review
1. Which deployment approach should we prioritize? (PaaS vs VPS vs Local+tunnel)
2. Should we keep docker-compose for local dev, or switch to direct `pnpm dev`?
3. Do we need any deployment scripts, or just manual steps documented?
4. Should we keep database backups automated or manual for demo project?
5. Is there any part of the old deployment we should preserve?

## References
- Current deployment docs: `docs/deployment/`
- Current Docker configs: `docker-compose*.yml`
- Incomplete deployment change: `openspec/changes/deploy-to-digitalocean/`
- Project constraints: `openspec/project.md` (student graduation project, demo-focused)
