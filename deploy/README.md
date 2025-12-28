# Restaurant Management System - Deployment Guide

Complete guide for deploying and running the Restaurant Management System locally and in production.

## Table of Contents

- [Quick Start (Local Development)](#quick-start-local-development)
- [Deployment Options](#deployment-options)
- [Option A: Vercel + Railway (Recommended)](#option-a-vercel--railway-recommended)
- [Option B: DigitalOcean VPS](#option-b-digitalocean-vps-alternative)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Cost Breakdown](#cost-breakdown)

---

## Quick Start (Local Development)

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** ([Install](https://pnpm.io/installation))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git**

### Setup Steps

**1. Clone the repository**
```bash
git clone <repository-url>
cd restaurant-management
```

**2. Run setup script**

**Windows (PowerShell):**
```powershell
.\deploy\scripts\setup-local.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy/scripts/setup-local.sh
./deploy/scripts/setup-local.sh
```

The script will:
- ✅ Create `.env` from `.env.example`
- ✅ Generate secure JWT secrets
- ✅ Start PostgreSQL and Redis containers
- ✅ Run database migrations
- ✅ Optionally seed demo data

**3. Start the application**

**Backend:**
```bash
cd app/server
pnpm install
pnpm dev
```

**Frontend (in another terminal):**
```bash
cd app/client
pnpm install
pnpm dev
```

**4. Access the application**

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **API Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### Manual Setup (if script fails)

<details>
<summary>Click to expand manual setup instructions</summary>

1. **Start Docker services:**
```bash
docker-compose -f deploy/docker-compose.yml up -d
```

2. **Create .env file:**
```bash
cd deploy
cp .env.example .env
# Edit .env and set JWT_SECRET and JWT_REFRESH_SECRET
```

3. **Run migrations:**
```bash
cd app/server
pnpm prisma migrate deploy
pnpm prisma db seed  # Optional: add demo data
```

4. **Start servers:**
```bash
# Terminal 1
cd app/server && pnpm dev

# Terminal 2
cd app/client && pnpm dev
```

</details>

---

## Deployment Options

| Option | Cost/Month | Complexity | Setup Time | Best For |
|--------|-----------|------------|------------|----------|
| **Vercel + Railway** | $0-5 | Low | 20-30 min | Demos, quick deployments |
| **DigitalOcean VPS** | $0-8* | Medium | 60-90 min | Learning, full control, production |

**\*$0 with GitHub Education Pack ($200 credit = 33 months free)**

### Recommendation

**For graduation thesis / demo**: Use **Vercel + Railway** (Option A)
- ✅ Free tiers sufficient
- ✅ Zero server management
- ✅ Automatic HTTPS/SSL
- ✅ Deploy in < 30 minutes

**For learning / full control / production**: Use **DigitalOcean VPS** (Option B)
- ✅ Complete infrastructure control
- ✅ Learn server administration (Docker, Linux, security)
- ✅ More configuration flexibility
- ✅ Production-ready with proper hardening
- ✅ **Free with GitHub Education Pack**

---

## Option A: Vercel + Railway (Recommended)

Deploy frontend to Vercel and backend + databases to Railway with minimal configuration.

### Prerequisites

- GitHub account
- [Vercel account](https://vercel.com/signup) (free)
- [Railway account](https://railway.app/) (free $5 credit/month)

### Total Time: ~20-30 minutes

---

### Part 1: Deploy Frontend to Vercel

**1. Push code to GitHub**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

**2. Import project to Vercel**
- Go to [vercel.com/new](https://vercel.com/new)
- Click **Import Git Repository**
- Select your repository
- Configure:
  - **Framework Preset**: Next.js
  - **Root Directory**: `app/client`
  - **Build Command**: `pnpm build`
  - **Install Command**: `pnpm install`

**3. Set environment variables** (Vercel dashboard)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```
*(You'll get the Railway URL in Part 2)*

**4. Deploy**
- Click **Deploy**
- Wait 2-3 minutes for build
- Note your Vercel URL: `https://your-app.vercel.app`

---

### Part 2: Deploy Backend to Railway

**1. Create new Railway project**
- Go to [railway.app/new](https://railway.app/new)
- Click **Deploy from GitHub repo**
- Select your repository

**2. Add PostgreSQL database**
- In Railway dashboard, click **+ New**
- Select **Database** → **PostgreSQL**
- Wait for provisioning (~1 minute)
- Note the `DATABASE_URL` (auto-provided)

**3. Add Redis cache**
- Click **+ New** → **Database** → **Redis**
- Wait for provisioning
- Note the `REDIS_URL` (auto-provided)

**4. Configure backend service**
- Click **+ New** → **GitHub Repo**
- Select repository
- Configure:
  - **Root Directory**: `app/server`
  - **Start Command**: `pnpm start` or `node dist/index.js`
  - **Build Command**: `pnpm build`

**5. Set environment variables** (Railway backend service)

Click **Variables** tab and add:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=<generate-random-32-chars>
JWT_REFRESH_SECRET=<generate-random-32-chars>
CLIENT_URL=https://your-app.vercel.app
API_VERSION=v1
API_BASE_URL=https://your-backend.railway.app
STORAGE_TYPE=local

# Optional: Cloudflare R2 or Cloudinary
R2_ACCOUNT_ID=
R2_BUCKET_NAME=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_URL=
```

**Generate secrets:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**6. Deploy backend**
- Click **Deploy**
- Wait for build (~3-5 minutes)
- Check **Deployments** tab for success
- Note Railway URL: `https://your-app.railway.app`

**7. Run database migrations**

**Option 1: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migrations
railway run pnpm prisma migrate deploy
```

**Option 2: Local connection**
```bash
# Get DATABASE_URL from Railway dashboard
# Copy the PostgreSQL connection string

# Run locally
cd app/server
DATABASE_URL="<railway-database-url>" pnpm prisma migrate deploy

# Optional: Seed demo data
DATABASE_URL="<railway-database-url>" pnpm prisma db seed
```

---

### Part 3: Connect Frontend and Backend

**1. Update Vercel environment variables**
- Go to Vercel dashboard → Settings → Environment Variables
- Update:
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

**2. Redeploy Vercel**
- Go to Deployments tab
- Click **...** → **Redeploy**

**3. Update Railway CLIENT_URL**
- Go to Railway backend service → Variables
- Update:
```env
CLIENT_URL=https://your-app.vercel.app
```

**4. Redeploy Railway**
- Will auto-redeploy on variable change

---

### Part 4: Test Deployment

**1. Visit frontend**
```
https://your-app.vercel.app
```

**2. Test features:**
- ✅ Login/Register
- ✅ Menu browsing
- ✅ Order creation
- ✅ Real-time updates (WebSocket)
- ✅ File uploads (if configured)

**3. Check logs:**
- **Vercel**: Dashboard → Functions → Logs
- **Railway**: Service → Deployments → View Logs

---

### Troubleshooting Vercel + Railway

<details>
<summary>Build fails on Vercel</summary>

**Check:**
- Build command is `pnpm build`
- Install command is `pnpm install`
- Root directory is `app/client`
- Node version (check `package.json` engines)

**Fix:**
- Add `engines` to `app/client/package.json`:
```json
"engines": {
  "node": ">=20.0.0",
  "pnpm": ">=9.0.0"
}
```
</details>

<details>
<summary>Railway backend fails to start</summary>

**Check logs:**
```bash
railway logs
```

**Common issues:**
- Missing environment variables
- Port mismatch (use `PORT=3000`)
- Database connection string format
- Build command failures

**Fix:**
- Verify all environment variables set
- Check `DATABASE_URL` format
- Ensure `pnpm build` succeeds locally
</details>

<details>
<summary>API calls fail (CORS errors)</summary>

**Check:**
- `CLIENT_URL` in Railway matches Vercel URL exactly
- CORS configuration in backend
- Network tab in browser DevTools

**Fix:**
- Update `CLIENT_URL` environment variable
- Check CORS middleware in `app/server/src/app.ts`
</details>

<details>
<summary>WebSocket connection fails</summary>

**Check:**
- Railway supports WebSocket (it does)
- `NEXT_PUBLIC_SOCKET_URL` correct
- Socket.io configuration

**Fix:**
- Ensure `NEXT_PUBLIC_SOCKET_URL` points to Railway backend
- Check Socket.io client connection in browser console
- Verify backend Socket.io server running
</details>

---

## Option B: DigitalOcean VPS (Alternative)

Deploy entire stack on a single VPS using Docker Compose.

### 📚 Complete Documentation

- **🇻🇳 [Hướng Dẫn Triển Khai (Tiếng Việt)](./digitalocean/DEPLOYMENT_GUIDE_VI.md)** - Chi tiết từng bước cho sinh viên
- **📋 [Quick Reference](./digitalocean/QUICK_REFERENCE.md)** - Essential commands cheatsheet
- **💰 [Cost Optimization](./digitalocean/COST_OPTIMIZATION.md)** - Budget tips & GitHub Education credits
- **🔒 [Security Checklist](./digitalocean/SECURITY_CHECKLIST.md)** - Production security verification

### 🚀 Quick Start Summary

**1. Create Droplet** ($6/month, 1GB RAM, Ubuntu 22.04)
```bash
# Get $200 free credit with GitHub Education Pack
# See COST_OPTIMIZATION.md for details
```

**2. Run automated setup**
```bash
# Copy setup script to VPS
scp deploy/digitalocean/scripts/setup-vps.sh root@your-vps-ip:/root/

# SSH and run setup
ssh root@your-vps-ip
bash setup-vps.sh
```

**3. Deploy application**
```bash
# Clone repository
git clone <repository-url> /var/www/restaurant-management
cd /var/www/restaurant-management

# Configure environment
cp deploy/digitalocean/.env.example .env
nano .env  # Edit with your values

# Deploy with automation script
bash deploy/digitalocean/scripts/deploy.sh
```

**4. Configure SSL (Optional)**
```bash
# Option A: Automatic SSL with Caddy (Recommended)
docker-compose -f deploy/docker-compose.prod.yml --profile caddy up -d

# Option B: Manual SSL with Nginx
# See DEPLOYMENT_GUIDE_VI.md for details
```

### ✨ Features

- ✅ **Automated scripts** for setup, deployment, backup/restore, health checks
- ✅ **Vietnamese documentation** for easy understanding
- ✅ **Cost optimization** guide with student discounts
- ✅ **Security hardening** with UFW firewall, SSH keys, HTTPS
- ✅ **Docker Compose** for easy orchestration
- ✅ **Automatic SSL** with Caddy or manual with Nginx/Certbot
- ✅ **Resource optimization** for 1GB RAM Droplets
- ✅ **Backup automation** with retention policies
- ✅ **Health monitoring** and logging

**Best for:** Learning server administration, full infrastructure control, production-ready deployments

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://host:6379` |
| `JWT_SECRET` | Secret for JWT signing | Random 32+ chars |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Random 32+ chars |
| `CLIENT_URL` | Frontend URL | `https://app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.railway.app/api/v1` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STORAGE_TYPE` | File storage (`local`, `r2`, `cloudinary`) | `local` |
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `LOG_LEVEL` | Logging level | `info` |

See [deploy/.env.example](./. env.example) for complete list.

---

## Troubleshooting

### General Issues

**🔧 [Migration Issues & Fixes](./MIGRATION_TROUBLESHOOTING.md)** - Complete guide for Prisma migration errors
- P3015 error (empty migration folders)
- Column does not exist errors
- Schema drift issues
- Migration workflow best practices

### Local Development

**Docker services won't start:**
```bash
# Check Docker is running
docker ps

# View logs
docker-compose -f deploy/docker-compose.yml logs

# Restart services
docker-compose -f deploy/docker-compose.yml restart
```

**Port already in use:**
```bash
# Check what's using the port
# Windows PowerShell:
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# Linux/Mac:
lsof -i :5432
lsof -i :6379

# Change port in .env
POSTGRES_PORT=5433
REDIS_PORT=6380
```

**Database connection fails:**
```bash
# Check PostgreSQL is healthy
docker inspect restaurant_postgres_dev

# Test connection
docker exec -it restaurant_postgres_dev psql -U restaurant_admin -d restaurant_db

# Verify DATABASE_URL in .env
```

**Migration errors (P3015, column not found):**
See [MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md) for detailed solutions.

---

## Cost Breakdown

### Vercel + Railway (Recommended)

| Service | Tier | Cost/Month |
|---------|------|-----------|
| Vercel (Frontend) | Hobby | $0 |
| Railway (Backend) | Starter | $0 ($5 credit) |
| PostgreSQL | Included | $0 |
| Redis | Included | $0 |
| **Total** | | **$0-5** |

**Notes:**
- Vercel free tier: Unlimited projects, 100GB bandwidth
- Railway: $5/month credit, ~500 hours runtime
- Sufficient for demos and moderate traffic

### DigitalOcean VPS

| Service | Tier | Cost/Month |
|---------|------|-----------|
| Droplet | 1GB RAM, 25GB SSD | $6 |
| Volume (optional) | 10GB | $1 |
| Backup (optional) | 20% of droplet | +$1.20 |
| **Total** | | **$6-8** |

**💡 Student Benefits:**
- **$200 free credit** via [GitHub Education Pack](https://education.github.com/pack)
- Covers **33 months** of basic Droplet
- See [COST_OPTIMIZATION.md](./digitalocean/COST_OPTIMIZATION.md) for details

**Notes:**
- Single server, all services in Docker
- Full control over infrastructure
- Production-ready with proper security

---

## Backup and Restore

### Create Backup

```bash
# Local development
chmod +x deploy/scripts/backup-db.sh
./deploy/scripts/backup-db.sh
```

Backups saved to: `backups/backup_restaurant_db_YYYYMMDD_HHMMSS.sql.gz`

### Restore Backup

```bash
chmod +x deploy/scripts/restore-db.sh
./deploy/scripts/restore-db.sh backups/backup_restaurant_db_20231125_120000.sql.gz
```

---

## Next Steps

- ✅ Deploy successfully
- ✅ Test all features
- 📖 Review [MIGRATION.md](./MIGRATION.md) for changes from old setup
- 🔒 Enable additional security features
- 📊 Set up monitoring (Vercel Analytics, Railway logs)
- 🌐 Configure custom domain (optional)

---

## Support

- 📖 **Documentation**: See `/docs` directory
- 🐛 **Issues**: GitHub Issues
- 💬 **Questions**: README or project documentation

---

**Last Updated**: November 25, 2025  
**Version**: 2.0 (Simplified Deployment Infrastructure)
