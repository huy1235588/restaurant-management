# DigitalOcean Deployment

Hướng dẫn triển khai Restaurant Management System lên DigitalOcean VPS.

## 📚 Tài Liệu Chính

➡️ **[DEPLOYMENT_GUIDE_VI.md](./DEPLOYMENT_GUIDE_VI.md)** - Hướng dẫn chi tiết bằng Tiếng Việt

## 🚀 Quick Start

### Lần Đầu Setup VPS

```bash
# SSH vào VPS
ssh root@YOUR_DROPLET_IP

# Clone repo
git clone https://github.com/huy1235588/restaurant-management.git /opt/restaurant-management
cd /opt/restaurant-management

# Setup môi trường
bash deploy/digitalocean/scripts/setup-vps.sh

# Cấu hình env
cp deploy/digitalocean/.env.example deploy/.env
nano deploy/.env

# Deploy
bash deploy/digitalocean/scripts/deploy.sh
```

### Auto Deploy với GitHub Actions

**Setup (1 lần):**
1. Cấu hình GitHub Secrets (xem [DEPLOYMENT_GUIDE_VI.md](./DEPLOYMENT_GUIDE_VI.md#71-cấu-hình-github-repository))
2. Tạo GitHub PAT với scope `read:packages`
3. VPS login vào GHCR:
   ```bash
   echo "YOUR_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin
   ```

**Deploy:**
```bash
git push origin main
# → GitHub Actions tự động build & deploy!
```

## 📁 Cấu Trúc Thư Mục

```
digitalocean/
├── DEPLOYMENT_GUIDE_VI.md    # 📖 Hướng dẫn chi tiết
├── .env.example               # ⚙️  Template environment variables
├── Caddyfile                  # 🔒 Reverse proxy + SSL config
├── nginx.conf                 # 🔄 Alternative: Nginx config
├── docker-compose.override.yml # 🐳 Resource limits cho VPS
└── scripts/
    ├── setup-vps.sh          # 🔧 Setup môi trường lần đầu
    ├── deploy.sh             # 🚀 Deploy ứng dụng
    ├── backup.sh             # 💾 Backup database
    ├── restore.sh            # ♻️  Restore từ backup
    ├── migrate.sh            # 📊 Run database migrations
    └── health-check.sh       # ✅ Health check services
```

## 🛠️ Scripts Chính

| Script | Mô Tả |
|--------|-------|
| `setup-vps.sh` | Setup Docker, clone repo, tạo directories |
| `deploy.sh` | Build images, start services, run migrations |
| `backup.sh` | Backup PostgreSQL database |
| `restore.sh` | Restore database từ backup file |
| `migrate.sh` | Run Prisma migrations |
| `health-check.sh` | Kiểm tra health của tất cả services |

## 📊 Resource Requirements

**Minimum (1GB RAM Droplet - $6/tháng):**
- PostgreSQL: 256MB RAM, 0.5 CPU
- Redis: 128MB RAM, 0.25 CPU
- Backend: 512MB RAM, 0.5 CPU
- Frontend: 384MB RAM, 0.5 CPU

**Recommended (2GB RAM Droplet - $12/tháng):**
- Thoải mái hơn cho production
- Có thể chạy thêm services khác

## 🔗 Liên Kết Hữu Ích

- [Hướng Dẫn Chi Tiết (Tiếng Việt)](./DEPLOYMENT_GUIDE_VI.md)
- [GitHub Actions Workflow](../../.github/workflows/deploy-digitalocean.yml)
- [Docker Compose Production](../docker-compose.prod.yml)
- [Main Deployment README](../README.md)

## 💡 Tips

- **Lần đầu deploy:** Đọc kỹ [DEPLOYMENT_GUIDE_VI.md](./DEPLOYMENT_GUIDE_VI.md)
- **Update thường xuyên:** Dùng GitHub Actions (tự động)
- **Backup định kỳ:** Setup cron job cho `backup.sh`
- **Monitor resources:** `docker stats` và `htop`

## 🆘 Troubleshooting

Xem phần [Troubleshooting](./DEPLOYMENT_GUIDE_VI.md#troubleshooting) trong hướng dẫn chi tiết.

## 📞 Support

- GitHub Issues: [restaurant-management/issues](https://github.com/huy1235588/restaurant-management/issues)
- Email: huy1235588@gmail.com
