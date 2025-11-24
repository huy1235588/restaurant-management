# Hướng Dẫn Triển Khai Lên DigitalOcean VPS

Hướng dẫn chi tiết từng bước để deploy Restaurant Management System lên DigitalOcean VPS sử dụng Docker Compose.

---

## Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Điều Kiện Tiên Quyết](#điều-kiện-tiên-quyết)
- [Quick Start - Triển Khai Nhanh](#quick-start---triển-khai-nhanh)
- [Hướng Dẫn Chi Tiết](#hướng-dẫn-chi-tiết)
  - [Bước 1: Tạo Tài Khoản DigitalOcean](#bước-1-tạo-tài-khoản-digitalocean)
  - [Bước 2: Tạo Droplet (VPS)](#bước-2-tạo-droplet-vps)
  - [Bước 3: Cấu Hình SSH](#bước-3-cấu-hình-ssh)
  - [Bước 4: Cài Đặt Môi Trường](#bước-4-cài-đặt-môi-trường)
  - [Bước 5: Deploy Ứng Dụng](#bước-5-deploy-ứng-dụng)
    - [5.1 Cấu Hình Environment Variables](#51-cấu-hình-environment-variables)
    - [5.2 Chạy Deploy Script](#52-chạy-deploy-script)
    - [5.3 Database Migrations](#53-database-migrations---hướng-dẫn-chi-tiết)
    - [5.4 Seed Dữ Liệu](#54-seed-dữ-liệu-demo-tùy-chọn)
    - [5.5 Xác Minh Deployment](#55-xác-minh-deployment-thành-công)
  - [Bước 6: Cấu Hình SSL/HTTPS](#bước-6-cấu-hình-sslhttps)
- [Sau Khi Deploy](#sau-khi-deploy)
- [Troubleshooting](#troubleshooting)
- [Bảo Trì và Quản Lý](#bảo-trì-và-quản-lý)

---

## Giới Thiệu

### VPS là gì?

**VPS (Virtual Private Server)** là một máy chủ ảo riêng biệt chạy trên hạ tầng cloud. Bạn có toàn quyền kiểm soát server như một máy chủ vật lý, nhưng với chi phí thấp hơn nhiều.

**DigitalOcean Droplet** là tên gọi của VPS trên nền tảng DigitalOcean.

### So Sánh: VPS vs PaaS

| Đặc Điểm | VPS (DigitalOcean) | PaaS (Vercel + Railway) |
|----------|-------------------|------------------------|
| **Chi phí** | $6-12/tháng | $0-5/tháng |
| **Quyền kiểm soát** | ✅ Toàn quyền | ⚠️ Hạn chế |
| **Độ phức tạp** | ⚠️ Cao (cần Linux) | ✅ Thấp |
| **Thời gian setup** | 1-2 giờ | 20-30 phút |
| **Giá trị học tập** | ✅ Cao (DevOps, Linux) | ⚠️ Thấp |
| **Phù hợp** | Học infrastructure | Demo nhanh |

### Tại Sao Chọn VPS?

✅ **Học tập**: Hiểu về Linux, Docker, Nginx/Caddy, firewall, SSL  
✅ **Kiểm soát**: Tùy chỉnh mọi thứ theo ý muốn  
✅ **Thực tế**: Nhiều công ty sử dụng VPS cho production  
✅ **Tiết kiệm**: 1 VPS chạy tất cả services ($6/tháng)  
✅ **Portfolio**: Ấn tượng hơn trong CV so với managed services  

### Kiến Trúc Hệ Thống

```
┌────────────────────────────────────────┐
│  DigitalOcean Droplet ($6/month)      │
│  Ubuntu 22.04, 1GB RAM, 25GB SSD      │
├────────────────────────────────────────┤
│                                        │
│  Caddy (Reverse Proxy + Auto SSL)     │
│         ↓                              │
│  ┌──────────────┐  ┌───────────────┐  │
│  │ Next.js      │  │ NestJS        │  │
│  │ Frontend     │  │ Backend       │  │
│  └──────────────┘  └───────┬───────┘  │
│                            │           │
│  ┌─────────────────────────┴────────┐ │
│  │ PostgreSQL  │  Redis             │ │
│  └─────────────────────────────────┘  │
│                                        │
│  Tất cả chạy trong Docker containers  │
└────────────────────────────────────────┘
```

---

## Điều Kiện Tiên Quyết

### 1. Tài Khoản và Dịch Vụ

- [ ] **Tài khoản GitHub** (để lấy credit miễn phí)
- [ ] **Tài khoản DigitalOcean** ([đăng ký tại đây](https://www.digitalocean.com/))
- [ ] **GitHub Education Pack** (tùy chọn - $200 credit miễn phí)

### 2. Kiến Thức Cơ Bản

- [ ] Biết sử dụng terminal/command line cơ bản
- [ ] Hiểu về Git (clone, pull, push)
- [ ] Đọc hiểu file cấu hình (YAML, JSON)
- [ ] Không cần: Chuyên gia Linux/DevOps (guide sẽ hướng dẫn chi tiết)

### 3. Tools Cần Thiết

**Trên máy tính của bạn:**
- [ ] **Git** - [Download](https://git-scm.com/)
- [ ] **SSH Client** (terminal có sẵn trên Mac/Linux, Windows dùng PowerShell hoặc Git Bash)
- [ ] **Text Editor** (VS Code, Sublime, Notepad++, v.v.)

**Tùy chọn:**
- [ ] **Domain name** (tên miền) - ~$10/năm hoặc miễn phí từ Freenom (.tk, .ml - không khuyến khích)
  - Nếu không có domain: Dùng IP address của VPS (không có SSL)
  - Nếu có domain: HTTPS tự động với Let's Encrypt

### 4. Budget

| Mục | Chi Phí | Ghi Chú |
|-----|---------|---------|
| **Droplet (1GB RAM)** | $6/tháng | Đủ cho demo/thesis |
| **Domain** | ~$10/năm | Tùy chọn (dùng IP cũng được) |
| **Backup** | $1.20/tháng | Tùy chọn |
| **Total** | **$7-8/tháng** | **$0 nếu có Education credit** |

**Lấy $200 credit miễn phí:**
1. Đăng ký [GitHub Education Pack](https://education.github.com/pack)
2. Kết nối DigitalOcean trong Education Pack
3. Nhận $200 credit (dùng được ~30 tháng với $6/month droplet)

---

## Quick Start - Triển Khai Nhanh

**Thời gian:** ~1-2 giờ cho lần đầu

### Tóm Tắt Các Bước

```bash
# 1. Tạo Droplet trên DigitalOcean (Ubuntu 22.04, 1GB RAM)
# 2. SSH vào server
ssh root@YOUR_DROPLET_IP

# 3. Clone repository
git clone https://github.com/YOUR_USERNAME/restaurant-management.git
cd restaurant-management

# 4. Chạy script setup tự động
bash deploy/digitalocean/scripts/setup-vps.sh

# 5. Cấu hình environment variables
cd /opt/restaurant-management
cp deploy/digitalocean/.env.example .env
nano .env  # Chỉnh sửa các giá trị

# 6. Deploy ứng dụng
bash deploy/digitalocean/scripts/deploy.sh

# 7. Cấu hình domain (nếu có) và SSL
# Chỉnh sửa Caddyfile với domain của bạn
nano deploy/digitalocean/Caddyfile
docker-compose restart caddy

# ✅ Xong! Truy cập https://yourdomain.com
```

**Nếu gặp lỗi hoặc cần hiểu rõ hơn:** Đọc [Hướng Dẫn Chi Tiết](#hướng-dẫn-chi-tiết) bên dưới.

---

## Hướng Dẫn Chi Tiết

### Bước 1: Tạo Tài Khoản DigitalOcean

#### 1.1 Đăng Ký Tài Khoản

1. Truy cập [digitalocean.com](https://www.digitalocean.com/)
2. Click **Sign Up** ở góc trên bên phải
3. Đăng ký bằng:
   - Email + password, hoặc
   - GitHub account (khuyến khích - dễ lấy Education credit)
4. Xác thực email

#### 1.2 Thêm Payment Method

⚠️ **Lưu ý:** DigitalOcean yêu cầu thẻ tín dụng hoặc PayPal để xác thực, ngay cả khi dùng credit miễn phí.

**Nếu không có thẻ tín dụng:**
- Dùng thẻ ATM có chức năng thanh toán quốc tế
- Dùng ví điện tử (MoMo, ZaloPay có thể tạo thẻ ảo)
- Nhờ người lớn/bạn bè cho mượn thẻ

**Thêm payment:**
1. Vào **Account Settings** → **Billing**
2. Click **Add Payment Method**
3. Nhập thông tin thẻ
4. Xác thực (có thể bị charge $1 để verify, sẽ hoàn lại)

#### 1.3 Apply GitHub Education Credit (Tùy Chọn)

**Lấy $200 credit miễn phí:**

1. Truy cập [education.github.com/pack](https://education.github.com/pack)
2. Click **Get your pack**
3. Điền thông tin:
   - Tên trường
   - Email sinh viên (.edu hoặc email trường)
   - Ảnh thẻ sinh viên/giấy tờ chứng minh
4. Chờ duyệt (1-7 ngày)
5. Sau khi được duyệt:
   - Vào [education.github.com/pack](https://education.github.com/pack)
   - Tìm **DigitalOcean**
   - Click **Get access** → Kết nối tài khoản
   - Nhận $200 credit vào account

**Kiểm tra credit:**
- Vào **Account Settings** → **Billing**
- Xem phần **Account Balance**

---

### Bước 2: Tạo Droplet (VPS)

#### 2.1 Tạo Droplet Mới

1. Đăng nhập DigitalOcean
2. Click **Create** (nút xanh ở góc trên) → **Droplets**
3. Hoặc truy cập: [cloud.digitalocean.com/droplets/new](https://cloud.digitalocean.com/droplets/new)

#### 2.2 Cấu Hình Droplet

**Choose an image (Chọn hệ điều hành):**
- Tab **OS** → Chọn **Ubuntu**
- Version: **22.04 (LTS) x64** ← **Quan trọng!**

**Choose a plan (Chọn gói):**
- **Basic** plan
- **Regular** CPU
- **$6/mo** - 1 GB RAM / 25 GB SSD / 1 CPU

💡 **Tip:** Đủ cho demo và thesis. Nâng cấp sau nếu cần.

**Choose a datacenter region (Chọn vị trí):**
- Gần Việt Nam: **Singapore** (khuyến khích)
- Hoặc: **San Francisco**, **Frankfurt**, **Bangalore**

**Authentication (Xác thực):**

**Option 1: SSH Key (Khuyến khích - An toàn hơn)**

Tạo SSH key trên máy tính:

```bash
# Windows PowerShell, Mac, Linux
ssh-keygen -t ed25519 -C "your_email@example.com"

# Nhấn Enter cho tất cả prompts (dùng default path)
# Key được tạo tại: ~/.ssh/id_ed25519.pub
```

Xem nội dung public key:

```bash
# Mac/Linux
cat ~/.ssh/id_ed25519.pub

# Windows PowerShell
type $env:USERPROFILE\.ssh\id_ed25519.pub

# Windows Git Bash
cat ~/.ssh/id_ed25519.pub
```

Copy toàn bộ nội dung (bắt đầu `ssh-ed25519 AAAA...`).

Trong DigitalOcean:
- Click **New SSH Key**
- Paste nội dung vừa copy
- Đặt tên: `My Laptop` hoặc `Development Machine`
- Click **Add SSH Key**
- ✅ Chọn key vừa tạo

**Option 2: Password (Đơn giản hơn nhưng kém an toàn)**
- Chọn **Password**
- DigitalOcean sẽ gửi password qua email

**Finalize details:**
- **Hostname:** `restaurant-vps` (hoặc tên bạn thích)
- **Tags:** `production`, `restaurant` (tùy chọn)
- **Project:** Default (hoặc tạo project mới)

#### 2.3 Tạo Droplet

1. Click **Create Droplet** ở cuối trang
2. Chờ ~1 phút để droplet được tạo
3. Note lại **IP address** của droplet (VD: `165.232.123.45`)

---

### Bước 3: Cấu Hình SSH

#### 3.1 Kết Nối SSH Lần Đầu

**Nếu dùng SSH Key:**
```bash
ssh root@YOUR_DROPLET_IP
```

**Nếu dùng Password:**
```bash
ssh root@YOUR_DROPLET_IP
# Nhập password từ email DigitalOcean
# Sẽ bị yêu cầu đổi password ngay lập tức
```

**Lần đầu kết nối sẽ hỏi:**
```
The authenticity of host '165.232.123.45' can't be established.
Are you sure you want to continue connecting (yes/no)?
```
→ Gõ `yes` và Enter

✅ **Thành công** nếu thấy prompt: `root@restaurant-vps:~#`

#### 3.2 Cấu Hình Timezone (Tùy Chọn)

Đặt timezone về Việt Nam:

```bash
timedatectl set-timezone Asia/Ho_Chi_Minh
date  # Kiểm tra
```

#### 3.3 Update Hệ Thống

```bash
apt update && apt upgrade -y
```

⏱️ Mất ~2-5 phút. Đợi hoàn tất.

---

### Bước 4: Cài Đặt Môi Trường

Có 2 cách: Tự động (khuyến khích) hoặc thủ công.

#### Option A: Tự Động (Khuyến Khích)

**Clone repository:**
```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/restaurant-management.git
cd restaurant-management
```

**Chạy script setup:**
```bash
bash deploy/digitalocean/scripts/setup-vps.sh
```

Script sẽ tự động:
- ✅ Cài Docker và Docker Compose
- ✅ Cấu hình UFW firewall
- ✅ Tạo swap memory (1GB)
- ✅ Tạo thư mục cho ứng dụng

⏱️ Mất ~5-10 phút.

**Kiểm tra kết quả:**
```bash
docker --version          # Docker version 24.x.x
docker compose version    # Docker Compose version v2.x.x
ufw status               # Status: active
free -h                  # Swap: 1.0Gi
```

✅ Nếu tất cả commands chạy OK → Tiếp tục Bước 5

#### Option B: Cài Đặt Thủ Công

<details>
<summary>Click để xem hướng dẫn chi tiết</summary>

**1. Cài Docker:**
```bash
# Remove old versions
apt remove docker docker-engine docker.io containerd runc -y

# Install dependencies
apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify
docker --version
```

**2. Cấu hình Firewall (UFW):**
```bash
# Enable UFW
ufw --force enable

# Allow SSH (quan trọng!)
ufw allow 22/tcp

# Allow HTTP và HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Verify
ufw status
```

**3. Tạo Swap Memory:**
```bash
# Tạo swap file 1GB
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Verify
free -h
```

**4. Clone Repository:**
```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/restaurant-management.git
cd restaurant-management
```

</details>

---

### Bước 5: Deploy Ứng Dụng

#### 5.1 Cấu Hình Environment Variables

**Copy template:**
```bash
cd /opt/restaurant-management
cp deploy/digitalocean/.env.example .env
```

**Chỉnh sửa .env:**
```bash
nano .env
```

**Các giá trị cần thay đổi:**

```bash
# ========================================
# DATABASE
# ========================================
POSTGRES_USER=restaurant_admin          # Giữ nguyên hoặc đổi
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD  # ← ĐỔI!
POSTGRES_DB=restaurant_db               # Giữ nguyên

# ========================================
# JWT SECRETS (QUAN TRỌNG!)
# ========================================
JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_CHARS  # ← ĐỔI!
JWT_REFRESH_SECRET=DIFFERENT_RANDOM_32_CHARS  # ← ĐỔI!
```

**Tạo secret ngẫu nhiên:**

```bash
# Cách 1: OpenSSL
openssl rand -base64 32

# Cách 2: /dev/urandom
tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32 && echo

# Copy output và paste vào .env
```

**Cấu hình domain (nếu có):**

```bash
# Nếu có domain
CLIENT_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com

# Nếu dùng IP (không có SSL)
CLIENT_URL=http://YOUR_DROPLET_IP:3000
NEXT_PUBLIC_API_URL=http://YOUR_DROPLET_IP:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://YOUR_DROPLET_IP:5000
```

**Lưu file:**
- Nhấn `Ctrl + X`
- Nhấn `Y` (Yes)
- Nhấn `Enter`

#### 5.2 Chạy Deploy Script

```bash
bash deploy/digitalocean/scripts/deploy.sh
```

Script sẽ:
- ✅ Build Docker images (~5-10 phút lần đầu)
- ✅ Start tất cả services (PostgreSQL, Redis, Backend, Frontend, Caddy)
- ✅ Chạy database migrations tự động
- ✅ Verify health checks

⏱️ **Lần đầu:** 10-15 phút  
⏱️ **Lần sau:** 3-5 phút

**Kiểm tra services:**
```bash
docker ps
```

Bạn sẽ thấy 5 containers:
- `restaurant_postgres_prod`
- `restaurant_redis_prod`
- `restaurant_server_prod`
- `restaurant_client_prod`
- `restaurant_caddy_prod`

**Kiểm tra logs:**
```bash
# Backend
docker logs restaurant_server_prod

# Database (để xem migrations)
docker logs restaurant_postgres_prod
```

#### 5.3 Database Migrations - Hướng Dẫn Chi Tiết

Migrations chạy tự động trong deploy script. Tuy nhiên, nếu gặp lỗi, làm theo các bước sau:

**Nếu migrations bị fail:**

```bash
# 1. Chạy troubleshoot script (khuyến nghị)
bash deploy/digitalocean/scripts/troubleshoot-migration.sh

# Script sẽ kiểm tra:
# ✓ Cấu hình environment
# ✓ Docker containers status
# ✓ Database connectivity
# ✓ Prisma configuration
# ✓ Test migration status
```

**Nếu troubleshoot script báo OK:**

```bash
# 2. Chạy migration script
bash deploy/digitalocean/scripts/migrate.sh

# Script sẽ:
# ✓ Load environment từ .env
# ✓ Validate database connection
# ✓ Build DATABASE_URL
# ✓ Run Prisma migrations
# ✓ Detailed logging
```

**Manual commands (nếu scripts fail):**

```bash
# 3. Nếu vẫn lỗi, chạy manual
cd /opt/restaurant-management/deploy

# Load environment
export $(cat .env | grep -v '^#' | xargs)

# Build DATABASE_URL
export DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"

# Check migration status
docker exec \
  -e DATABASE_URL="$DB_URL" \
  restaurant_server_prod \
  npx prisma migrate status --schema prisma/schema.prisma

# Run migrations
docker exec \
  -e DATABASE_URL="$DB_URL" \
  restaurant_server_prod \
  npx prisma migrate deploy --schema prisma/schema.prisma
```

**Xem migration logs:**
```bash
# Xem chi tiết migrations đã chạy
docker logs restaurant_server_prod | grep -i "migration\|prisma"

# Hoặc xem database logs
docker logs restaurant_postgres_prod | tail -50
```

---

#### 5.4 Seed Dữ Liệu Demo (Tùy Chọn)

Thêm dữ liệu mẫu (users, menu items, tables):

```bash
docker exec -it restaurant_server_prod npm run seed
```

---

#### 5.5 Xác Minh Deployment Thành Công

```bash
# 1. Kiểm tra tất cả containers
docker ps

# 2. Kiểm tra health của services
bash deploy/digitalocean/scripts/health-check.sh

# 3. Test frontend
curl http://localhost:3000

# 4. Test backend
curl http://localhost:5000/api/v1/health

# 5. Test với domain (nếu có)
curl https://yourdomain.com
```

# Frontend
docker logs restaurant_client_prod

# Database
docker logs restaurant_postgres_prod
```

#### 5.3 Seed Dữ Liệu Demo (Tùy Chọn)

Thêm dữ liệu mẫu (users, menu items, tables):

```bash
docker exec -it restaurant_server_prod npm run seed
```

---

### Bước 6: Cấu Hình SSL/HTTPS

#### Option A: Với Domain (Automatic SSL)

**1. Trỏ domain về Droplet:**

Vào dashboard của nhà cung cấp domain (Namecheap, Cloudflare, GoDaddy, v.v.) và tạo DNS record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_DROPLET_IP | 300 |
| A | www | YOUR_DROPLET_IP | 300 |

⏱️ Đợi 5-30 phút để DNS propagate.

**Kiểm tra DNS:**
```bash
# Trên máy tính của bạn
ping yourdomain.com

# Hoặc
nslookup yourdomain.com
```

→ Nếu trả về IP của droplet = OK

**2. Cấu hình Caddyfile:**

```bash
nano deploy/digitalocean/Caddyfile
```

**Thay đổi:**
```caddyfile
# Thay YOUR_DOMAIN.COM bằng domain thật của bạn
yourdomain.com, www.yourdomain.com {
    # Frontend
    reverse_proxy frontend:3000
    
    # Backend API
    reverse_proxy /api/* backend:5000
    reverse_proxy /socket.io/* backend:5000
}
```

**3. Restart Caddy:**
```bash
docker-compose restart caddy

# Xem logs để check SSL
docker logs -f restaurant_caddy_prod
```

Bạn sẽ thấy:
```
[INFO] Obtaining certificate for yourdomain.com
[INFO] Certificate obtained successfully
```

✅ **Thành công!** Truy cập `https://yourdomain.com`

#### Option B: Không Có Domain (HTTP Only)

**Cấu hình Caddyfile:**
```caddyfile
:80 {
    reverse_proxy frontend:3000
    reverse_proxy /api/* backend:5000
    reverse_proxy /socket.io/* backend:5000
}
```

**Restart:**
```bash
docker-compose restart caddy
```

✅ Truy cập: `http://YOUR_DROPLET_IP`

⚠️ **Lưu ý:** Không có HTTPS, không an toàn cho production thực sự.

#### Option C: Nginx với Let's Encrypt (Alternative)

<details>
<summary>Click để xem hướng dẫn Nginx</summary>

**1. Stop Caddy:**
```bash
docker-compose stop caddy
```

**2. Cài Certbot:**
```bash
apt install -y certbot python3-certbot-nginx
```

**3. Lấy certificate:**
```bash
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

Làm theo prompts:
- Nhập email
- Agree to terms
- Certificate sẽ được lưu tại `/etc/letsencrypt/live/yourdomain.com/`

**4. Cấu hình Nginx:**
```bash
nano deploy/digitalocean/nginx.conf
```

(Xem file mẫu trong repository)

**5. Start Nginx:**
```bash
docker-compose -f deploy/digitalocean/docker-compose.nginx.yml up -d
```

</details>

---

## Sau Khi Deploy

### Kiểm Tra Ứng Dụng

**1. Truy cập frontend:**
```
https://yourdomain.com  (hoặc http://YOUR_IP)
```

**2. Test các tính năng:**
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập
- ✅ Xem menu
- ✅ Tạo order
- ✅ Xem real-time updates (WebSocket)

**3. Kiểm tra backend API:**
```
https://yourdomain.com/api/v1/health
```

→ Nên trả về: `{"status":"ok"}`

**4. Kiểm tra API docs:**
```
https://yourdomain.com/api/v1/api-docs
```

→ Swagger UI

### Cấu Hình Backup Tự Động

**Tạo cron job:**
```bash
crontab -e
```

**Thêm dòng này (chạy backup lúc 3 AM mỗi ngày):**
```bash
0 3 * * * /opt/restaurant-management/deploy/digitalocean/scripts/backup.sh >> /var/log/restaurant-backup.log 2>&1
```

**Test backup ngay:**
```bash
bash deploy/digitalocean/scripts/backup.sh
```

Backup file sẽ được lưu tại: `/opt/restaurant-management/backups/`

### Monitoring và Logs

**Xem logs real-time:**
```bash
# All services
docker-compose logs -f

# Chỉ backend
docker-compose logs -f server

# Chỉ frontend
docker-compose logs -f client

# Last 100 lines
docker-compose logs --tail=100 server
```

**Kiểm tra resource usage:**
```bash
# Disk space
df -h

# Memory
free -h

# Docker stats
docker stats
```

**Health check script:**
```bash
bash deploy/digitalocean/scripts/health-check.sh
```

---

## Troubleshooting

### Lỗi Thường Gặp

#### 1. Port Already in Use

**Lỗi:**
```
Error starting userland proxy: listen tcp 0.0.0.0:80: bind: address already in use
```

**Nguyên nhân:** Có service khác đang dùng port 80/443 (thường là Apache/Nginx cài sẵn)

**Giải pháp:**
```bash
# Tìm process đang dùng port 80
lsof -i :80

# Stop Apache nếu có
systemctl stop apache2
systemctl disable apache2

# Hoặc Nginx
systemctl stop nginx
systemctl disable nginx

# Restart Docker containers
docker-compose restart
```

#### 2. Cannot Connect to Database

**Lỗi trong logs:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Kiểm tra:**
```bash
# Database container có chạy không?
docker ps | grep postgres

# Xem logs
docker logs restaurant_postgres_prod

# Kiểm tra DATABASE_URL trong .env
cat .env | grep DATABASE_URL
```

**Giải pháp:**
```bash
# Restart database
docker-compose restart postgres

# Nếu vẫn lỗi, xóa và tạo lại
docker-compose down
docker volume rm restaurant_postgres_data_prod
docker-compose up -d
```

⚠️ **Cảnh báo:** Xóa volume sẽ mất dữ liệu. Restore từ backup nếu cần.

#### 3. SSL Certificate Failed

**Lỗi:**
```
[ERROR] Failed to obtain certificate
```

**Nguyên nhân:**
- DNS chưa trỏ đúng
- Port 80/443 bị block
- Domain không valid

**Kiểm tra:**
```bash
# DNS đã trỏ đúng chưa?
nslookup yourdomain.com

# Firewall có mở port 80, 443?
ufw status

# Caddy có chạy không?
docker ps | grep caddy
```

**Giải pháp:**
```bash
# Chắc chắn DNS đã trỏ đúng (đợi 30 phút)
# Mở firewall
ufw allow 80/tcp
ufw allow 443/tcp

# Restart Caddy
docker-compose restart caddy

# Xem logs chi tiết
docker logs -f restaurant_caddy_prod
```

#### 4. Out of Memory

**Triệu chứng:**
- Services bị kill ngẫu nhiên
- `docker ps` shows containers exiting
- Logs: `OOMKilled`

**Kiểm tra:**
```bash
free -h
docker stats
```

**Giải pháp:**
```bash
# Tăng swap nếu chưa có
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Giảm số lượng workers
# Edit .env
WORKERS=1  # Thay vì 2 hoặc 4

# Restart
docker-compose restart
```

#### 5. 502 Bad Gateway

**Nguyên nhân:**
- Backend chưa start xong
- Backend đang crash
- Sai port trong Caddyfile

**Kiểm tra:**
```bash
# Backend có chạy không?
docker ps | grep server

# Health check
curl http://localhost:5000/api/v1/health

# Logs
docker logs restaurant_server_prod
```

**Giải pháp:**
```bash
# Đợi backend start (có thể mất 30-60s)
# Hoặc restart
docker-compose restart server

# Kiểm tra Caddyfile có đúng port không
cat deploy/digitalocean/Caddyfile
```

#### 6. Cannot SSH After Firewall Setup

**Triệu chứng:** Mất kết nối SSH, không thể SSH lại

**Nguyên nhân:** Firewall block port 22

**Giải pháp:**
- Dùng **DigitalOcean Console** (trên web):
  1. Vào Droplet dashboard
  2. Click **Console** (góc trên phải)
  3. Login với `root` và password
  4. Sửa firewall:
     ```bash
     ufw allow 22/tcp
     ufw reload
     ```

⚠️ **Phòng tránh:** Luôn allow SSH trước khi enable firewall:
```bash
ufw allow 22/tcp
ufw --force enable
```

#### 7. Database Migrations Failed

**Lỗi:**
```
Error: The datasource property is required in your Prisma config file
```

**Nguyên nhân:**
- `DATABASE_URL` chưa được pass đúng vào Docker container
- Database container chưa ready
- Network connectivity issues

**Kiểm tra & Giải pháp:**

```bash
# 1. Chạy troubleshooter (dễ nhất)
bash deploy/digitalocean/scripts/troubleshoot-migration.sh

# Script sẽ tự động kiểm tra:
# ✓ Environment configuration
# ✓ Docker containers
# ✓ Database connectivity
# ✓ Prisma setup
# ✓ Recommend next steps
```

**Nếu troubleshooter báo lỗi:**

```bash
# 2. Chạy migration script
bash deploy/digitalocean/scripts/migrate.sh

# Hoặc manual commands:
cd /opt/restaurant-management/deploy

# Load .env
export $(cat .env | grep -v '^#' | xargs)

# Build DATABASE_URL
export DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"

# Test database
docker exec restaurant_postgres_prod psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT 1;"

# Check migration status
docker exec -e DATABASE_URL="$DB_URL" \
  restaurant_server_prod \
  npx prisma migrate status --schema prisma/schema.prisma

# Run migrations
docker exec -e DATABASE_URL="$DB_URL" \
  restaurant_server_prod \
  npx prisma migrate deploy --schema prisma/schema.prisma
```

**Nếu vẫn lỗi:**

```bash
# 3. Xem detailed logs
docker logs -f restaurant_server_prod

# 4. Kiểm tra .env có đúng không
cat .env | grep -i postgres

# 5. Restart containers
docker-compose down
docker-compose up -d

# 6. Retry migrations
bash deploy/digitalocean/scripts/migrate.sh
```

#### 8. Prisma Runtime Error - Cannot find module '@prisma/client-runtime-utils'

**Lỗi:**
```
Error: Cannot find module '@prisma/client-runtime-utils'
```

**Nguyên nhân:**
- Docker image cũ không có Prisma Client được generate đúng cách
- Build cache bị corrupted

**Giải pháp:**

```bash
# 1. Chạy rebuild script (dễ nhất)
bash /opt/restaurant-management/deploy/digitalocean/scripts/rebuild-images.sh

# Script sẽ:
# ✓ Stop containers
# ✓ Rebuild images mới (no-cache)
# ✓ Start containers
# ✓ Run migrations
# ✓ Check health
```

**Manual rebuild (nếu script fail):**

```bash
cd /opt/restaurant-management/deploy

# 2. Stop containers
docker compose -f docker-compose.prod.yml stop

# 3. Rebuild server image without cache
docker compose -f docker-compose.prod.yml build --no-cache server

# 4. Start containers
docker compose -f docker-compose.prod.yml up -d

# 5. Wait for database
sleep 15

# 6. Run migrations
export $(cat .env | grep -v '^#' | xargs)
export DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"
docker exec -e DATABASE_URL="$DB_URL" \
  restaurant_server_prod \
  npx prisma migrate deploy --schema prisma/schema.prisma

# 7. Check logs
docker logs -f restaurant_server_prod
```

**Nếu vẫn fail:**

```bash
# Thử clean và rebuild lại
docker compose -f docker-compose.prod.yml down
docker image rm $(docker images | grep restaurant | awk '{print $3}')
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
bash /opt/restaurant-management/deploy/digitalocean/scripts/migrate.sh
```

**⏱️ Rebuild mất 5-10 phút lần đầu**

---

## Bảo Trì và Quản Lý

### Update Ứng Dụng

Khi có code mới:

```bash
cd /opt/restaurant-management
bash deploy/digitalocean/scripts/deploy.sh
```

Script sẽ tự động:
- Pull code mới
- Rebuild images
- Restart services
- Run migrations

### Backup và Restore

**Tạo backup thủ công:**
```bash
bash deploy/digitalocean/scripts/backup.sh
```

**List backups:**
```bash
ls -lh /opt/restaurant-management/backups/
```

**Restore từ backup:**
```bash
bash deploy/digitalocean/scripts/restore.sh /opt/restaurant-management/backups/db_backup_2024-11-25_030000.sql.gz
```

### Clean Up

**Xóa Docker images cũ:**
```bash
docker image prune -a
```

**Xóa logs cũ:**
```bash
# Backend logs
docker exec restaurant_server_prod rm -rf logs/*.log

# Truncate Docker logs
truncate -s 0 $(docker inspect --format='{{.LogPath}}' restaurant_server_prod)
```

### Security Updates

**Update hệ thống hàng tháng:**
```bash
apt update
apt upgrade -y
apt autoremove -y
reboot  # Khởi động lại server
```

⏱️ Server sẽ down ~2-5 phút khi reboot.

### Giám Sát

**Cài đặt health check tự động:**
```bash
crontab -e
```

Thêm dòng:
```bash
*/5 * * * * /opt/restaurant-management/deploy/digitalocean/scripts/health-check.sh >> /var/log/restaurant-health.log 2>&1
```

**Xem health logs:**
```bash
tail -f /var/log/restaurant-health.log
```

---

## Tài Nguyên Bổ Sung

### Tài Liệu Liên Quan

- [Quick Reference](./QUICK_REFERENCE.md) - Cheatsheet lệnh thường dùng
- [Cost Optimization](./COST_OPTIMIZATION.md) - Tiết kiệm chi phí
- [Security Checklist](./SECURITY_CHECKLIST.md) - Danh sách kiểm tra bảo mật

### Tools Hữu Ích

- [DigitalOcean Docs](https://docs.digitalocean.com/) - Tài liệu chính thức
- [Docker Docs](https://docs.docker.com/) - Docker documentation
- [Caddy Docs](https://caddyserver.com/docs/) - Caddy server docs

### Liên Hệ và Hỗ Trợ

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/restaurant-management/issues)
- **Discussions:** GitHub Discussions
- **Email:** your.email@example.com

---

## Kết Luận

Chúc mừng! 🎉 Bạn đã deploy thành công Restaurant Management System lên DigitalOcean VPS.

### Checklist Cuối Cùng

- [ ] Tất cả services đang chạy (`docker ps`)
- [ ] HTTPS hoạt động (hoặc HTTP nếu không có domain)
- [ ] Có thể login và test các features
- [ ] Backup tự động đã được cấu hình
- [ ] Firewall đã enable và configured đúng
- [ ] Đã đổi tất cả passwords/secrets mặc định

### Next Steps

1. **Tùy chỉnh ứng dụng:** Thêm logo, đổi colors, v.v.
2. **Setup monitoring:** Uptime monitoring, error tracking
3. **Optimize performance:** Caching, CDN (nếu cần)
4. **Documentation:** Viết docs cho team/users
5. **Testing:** Load testing, security testing

### Ghi Chú Quan Trọng

⚠️ **Đây là setup cho thesis/demo.** Nếu deploy production thật:
- Dùng managed database (DigitalOcean Managed PostgreSQL)
- Setup monitoring chuyên nghiệp (Prometheus, Grafana)
- Implement CI/CD pipeline
- Tăng số lượng droplets (load balancing)
- Regular security audits

**Good luck với đồ án! 🚀**

---

**Phiên bản:** 1.0  
**Cập nhật:** 25/11/2025  
**Tác giả:** Restaurant Management Team
