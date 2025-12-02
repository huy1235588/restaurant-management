# GitHub Actions - Auto Deploy to DigitalOcean

Hướng dẫn cấu hình GitHub Actions để tự động deploy lên DigitalOcean VPS.

## Mục Lục

- [Tổng Quan](#tổng-quan)
- [Cấu Hình GitHub Secrets](#cấu-hình-github-secrets)
- [Cách Sử Dụng](#cách-sử-dụng)
- [Workflow Chi Tiết](#workflow-chi-tiết)
- [Troubleshooting](#troubleshooting)

---

## Tổng Quan

### Workflow hoạt động như thế nào?

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Push to main   │────▶│  Build & Test    │────▶│  Deploy to VPS  │
│  or Manual      │     │  (GitHub Runner) │     │  (SSH)          │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │  Health Check   │
                                               └─────────────────┘
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    ▼                                         ▼
                           ┌─────────────────┐                      ┌─────────────────┐
                           │  ✅ Success     │                      │  ❌ Rollback    │
                           └─────────────────┘                      └─────────────────┘
```

### Khi nào workflow chạy?

1. **Tự động**: Khi push code vào branch `main` và có thay đổi trong:
   - `app/**` (client hoặc server)
   - `deploy/**` (deployment scripts)
   - `.github/workflows/deploy-digitalocean.yml`

2. **Thủ công**: Chạy từ tab Actions với các options:
   - `skip_backup`: Bỏ qua backup trước khi deploy
   - `no_build`: Bỏ qua rebuild Docker images
   - `environment`: Chọn production hoặc staging

---

## Cấu Hình GitHub Secrets

### Bước 1: Tạo SSH Key cho GitHub Actions

Trên **máy local** của bạn:

```bash
# Tạo SSH key mới
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Key files sẽ được tạo:
# - ~/.ssh/github_actions_deploy (private key - KHÔNG CHIA SẺ)
# - ~/.ssh/github_actions_deploy.pub (public key)
```

### Bước 2: Thêm Public Key vào VPS

SSH vào VPS và thêm public key:

```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Thêm public key vào authorized_keys
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys

# Hoặc copy trực tiếp từ máy local
# ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@YOUR_VPS_IP
```

### Bước 3: Cấu Hình GitHub Secrets

Vào GitHub Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Thêm các secrets sau:

| Secret Name | Giá Trị | Mô Tả |
|-------------|---------|-------|
| `DIGITALOCEAN_SSH_KEY` | Nội dung file private key | SSH private key để kết nối VPS |
| `DIGITALOCEAN_HOST` | `YOUR_VPS_IP` (VD: `165.232.123.45`) | IP address của VPS |
| `APP_URL` | `https://yourdomain.com` hoặc `http://YOUR_VPS_IP` | URL của ứng dụng |

#### Cách lấy private key:

**Windows (PowerShell):**
```powershell
type $env:USERPROFILE\.ssh\github_actions_deploy
```

**Mac/Linux:**
```bash
cat ~/.ssh/github_actions_deploy
```

Copy **toàn bộ** nội dung bao gồm:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### Bước 4: Cấu Hình Environment (Tùy chọn)

Nếu muốn thêm protection rules:

1. Vào **Settings** → **Environments**
2. Tạo environment `production`
3. Thêm protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches

---

## Cách Sử Dụng

### Deploy Tự Động

Chỉ cần push code vào branch `main`:

```bash
git add .
git commit -m "feat: thêm tính năng mới"
git push origin main
```

Workflow sẽ tự động chạy.

### Deploy Thủ Công

1. Vào tab **Actions** trên GitHub
2. Chọn workflow **Deploy to DigitalOcean VPS**
3. Click **Run workflow**
4. Chọn options:
   - `skip_backup`: `true` nếu muốn bỏ qua backup
   - `no_build`: `true` nếu chỉ muốn restart (không rebuild)
   - `environment`: `production` hoặc `staging`
5. Click **Run workflow**

### Xem Logs

1. Vào tab **Actions**
2. Click vào workflow run mới nhất
3. Click vào từng job để xem chi tiết logs

---

## Workflow Chi Tiết

### Job 1: Build and Test

- Checkout code
- Setup Docker Buildx
- Build Client image (không push)
- Build Server image (không push)

**Mục đích**: Đảm bảo code build được trước khi deploy.

### Job 2: Deploy

- Setup SSH connection
- SSH vào VPS
- Pull latest code
- Chạy `deploy.sh` script
- Health check

### Job 3: Rollback (tự động nếu deploy fail)

- Reset về commit trước
- Restart containers

---

## Troubleshooting

### Lỗi: Permission denied (publickey)

**Nguyên nhân**: SSH key không đúng hoặc chưa được thêm vào VPS.

**Giải pháp**:
```bash
# Kiểm tra key trên VPS
cat ~/.ssh/authorized_keys

# Đảm bảo có public key của GitHub Actions
# Nếu không có, thêm lại

# Kiểm tra permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Lỗi: Host key verification failed

**Nguyên nhân**: VPS IP thay đổi hoặc chưa được thêm vào known_hosts.

**Giải pháp**: Workflow tự động thêm host vào known_hosts. Nếu vẫn lỗi, kiểm tra `DIGITALOCEAN_HOST` secret.

### Lỗi: Health check failed

**Nguyên nhân**: Ứng dụng chưa start xong hoặc có lỗi.

**Giải pháp**:
```bash
# SSH vào VPS và kiểm tra
ssh root@YOUR_VPS_IP

# Xem logs
cd /opt/restaurant-management/deploy
docker compose -f docker-compose.prod.yml logs -f

# Kiểm tra containers
docker ps
```

### Lỗi: Deploy script failed

**Nguyên nhân**: Có lỗi trong quá trình deploy.

**Giải pháp**:
```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Xem deployment logs
cat /opt/restaurant-management/logs/deploy_*.log | tail -100

# Chạy manual deploy để debug
cd /opt/restaurant-management
bash deploy/digitalocean/scripts/deploy.sh
```

---

## Best Practices

### 1. Test trước khi merge vào main

```bash
# Tạo feature branch
git checkout -b feature/new-feature

# Test locally
docker compose up -d

# Tạo PR và review
# Merge khi đã test xong
```

### 2. Sử dụng staging environment

Tạo branch `staging` và cấu hình workflow để deploy vào staging server trước.

### 3. Monitor sau khi deploy

- Kiểm tra logs: `docker compose logs -f`
- Kiểm tra metrics: CPU, RAM, disk
- Test các tính năng chính

### 4. Backup định kỳ

Đảm bảo có cron job backup chạy hàng ngày:
```bash
0 3 * * * /opt/restaurant-management/deploy/digitalocean/scripts/backup.sh
```

---

## Security Notes

⚠️ **QUAN TRỌNG**:

1. **KHÔNG** commit SSH private key vào repository
2. Sử dụng GitHub Secrets để lưu trữ sensitive data
3. Giới hạn quyền truy cập repository
4. Review PRs trước khi merge vào main
5. Sử dụng Environment protection rules cho production

---

**Phiên bản**: 1.0  
**Cập nhật**: 02/12/2025
