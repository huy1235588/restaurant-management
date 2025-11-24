# Security Checklist - DigitalOcean Deployment

Danh sách kiểm tra bảo mật cho Restaurant Management System trên DigitalOcean VPS.

---

## 🎯 Mục tiêu

Document này giúp bạn:
- ✅ Verify các security measures đã được implement
- ✅ Identify các lỗ hổng bảo mật tiềm năng
- ✅ Follow security best practices cho production deployment

**Mức độ ưu tiên:**
- 🔴 **Critical** - MUST implement trước khi go live
- 🟡 **Important** - Should implement trong vòng 1 tuần
- 🟢 **Recommended** - Nice to have, implement khi có thời gian

---

## 1️⃣ Server Access Security

### 🔴 SSH Key Authentication

**Requirement:** Disable password login, chỉ dùng SSH keys.

**Check:**
```bash
# Verify SSH config
sudo cat /etc/ssh/sshd_config | grep PasswordAuthentication
# Should show: PasswordAuthentication no

sudo cat /etc/ssh/sshd_config | grep PubkeyAuthentication
# Should show: PubkeyAuthentication yes
```

**Fix nếu chưa đúng:**
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set these values:
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password

# Restart SSH
sudo systemctl restart sshd
```

**Verify:**
```bash
# Try login with password từ another terminal
# Should be rejected
```

**Checklist:**
- [ ] SSH key added to server (`~/.ssh/authorized_keys`)
- [ ] Password authentication disabled
- [ ] Can login với SSH key successfully
- [ ] Cannot login với password

---

### 🟡 Change Default SSH Port (Optional but Recommended)

**Benefit:** Reduce automated SSH brute-force attacks.

**Implementation:**
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change line:
# Port 22
# To:
Port 2222

# Update firewall
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp

# Restart SSH
sudo systemctl restart sshd
```

**Update connection:**
```bash
# Now connect with:
ssh -p 2222 root@YOUR_DROPLET_IP
```

**Checklist:**
- [ ] SSH port changed
- [ ] Firewall rules updated
- [ ] Can connect with new port
- [ ] Document new port (don't forget!)

---

### 🟢 Fail2Ban (Recommended)

**Benefit:** Auto-ban IPs after failed login attempts.

**Installation:**
```bash
# Install fail2ban
sudo apt update
sudo apt install fail2ban -y

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit config
sudo nano /etc/fail2ban/jail.local

# Configure SSH jail:
[sshd]
enabled = true
port = 22  # hoặc custom port của bạn
maxretry = 3
bantime = 3600
findtime = 600

# Start fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

**Verify:**
```bash
# Check status
sudo fail2ban-client status sshd

# View banned IPs
sudo fail2ban-client status sshd | grep "Banned IP"
```

**Checklist:**
- [ ] Fail2ban installed
- [ ] SSH jail configured
- [ ] Service running
- [ ] Tested with failed login

---

## 2️⃣ Firewall Configuration

### 🔴 UFW Firewall Active

**Requirement:** Only necessary ports open.

**Check:**
```bash
sudo ufw status verbose
```

**Expected output:**
```
Status: active
Logging: on (low)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

**Setup nếu chưa có:**
```bash
# Allow SSH first (để không bị lock out!)
sudo ufw allow 22/tcp

# Allow HTTP và HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Verify
sudo ufw status verbose
```

**Checklist:**
- [ ] UFW enabled
- [ ] Only ports 22, 80, 443 open (hoặc custom SSH port)
- [ ] No unnecessary ports open
- [ ] Can access website (80/443)
- [ ] Can SSH (22 hoặc custom port)

---

### 🔴 Database Ports NOT Exposed

**Requirement:** PostgreSQL và Redis chỉ accessible from Docker network, không public.

**Check:**
```bash
# Check listening ports
sudo netstat -tulpn | grep -E '5432|6379'

# Should show 127.0.0.1 or docker0 interface only
# Should NOT show 0.0.0.0
```

**Verify từ bên ngoài:**
```bash
# Từ local machine (NOT server)
telnet YOUR_DROPLET_IP 5432
# Should: Connection refused

telnet YOUR_DROPLET_IP 6379
# Should: Connection refused
```

**Fix nếu exposed:**
```yaml
# docker-compose.prod.yml
services:
  postgres:
    ports:
      # BAD: - "5432:5432"  # Exposes to public
      # GOOD:
      - "127.0.0.1:5432:5432"  # Only localhost
      # OR better: Remove ports completely (internal only)
```

**Checklist:**
- [ ] PostgreSQL port 5432 không accessible từ bên ngoài
- [ ] Redis port 6379 không accessible từ bên ngoài
- [ ] Services vẫn communicate internally via Docker network
- [ ] Application kết nối database thành công

---

### 🟡 Rate Limiting on Firewall

**Benefit:** Prevent DDoS và brute force attacks.

**Implementation:**
```bash
# Limit SSH connections
sudo ufw limit 22/tcp

# OR with iptables
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP
```

**Checklist:**
- [ ] Rate limiting configured for SSH
- [ ] Tested: Multiple rapid connections blocked
- [ ] Can still connect normally

---

## 3️⃣ Application Security

### 🔴 Strong JWT Secrets

**Requirement:** JWT secrets phải random, strong (32+ characters).

**Check:**
```bash
# Verify JWT secrets length
cd /opt/restaurant-management/deploy
grep JWT_SECRET .env | wc -c
# Should be > 40 characters
```

**Bad examples:**
```env
JWT_SECRET=secret123  # ❌ Too short
JWT_SECRET=myapplication2024  # ❌ Predictable
```

**Good examples:**
```env
JWT_SECRET=K7x9P2mN8qR5tY4wE6uZ3vB1nH0jL9fG
JWT_REFRESH_SECRET=A1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tU
```

**Generate strong secrets:**
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Checklist:**
- [ ] `JWT_SECRET` is strong random value (32+ chars)
- [ ] `JWT_REFRESH_SECRET` is different from JWT_SECRET
- [ ] Secrets không commit vào Git
- [ ] `.env` file có proper permissions (600)

---

### 🔴 Strong Database Passwords

**Requirement:** PostgreSQL và Redis passwords phải strong.

**Check:**
```bash
cd /opt/restaurant-management/deploy
cat .env | grep -E 'POSTGRES_PASSWORD|REDIS_PASSWORD'
```

**Bad:**
```env
POSTGRES_PASSWORD=password123  # ❌
REDIS_PASSWORD=redis  # ❌
```

**Good:**
```env
POSTGRES_PASSWORD=p9X2mK7nQ4wR5tY8vB3zH6jL0fG1cD4e
REDIS_PASSWORD=R5tY8vB3zH6jL0fG1cD4eK7x9P2mN8qA
```

**Change passwords:**
```bash
# Generate strong password
openssl rand -base64 24

# Update .env file
nano .env

# Restart containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

**Checklist:**
- [ ] PostgreSQL password is strong (24+ chars)
- [ ] Redis password is strong (24+ chars)
- [ ] Passwords different from defaults
- [ ] Services restart successfully với new passwords

---

### 🔴 CORS Configuration

**Requirement:** CORS chỉ allow specific origins, không dùng `*`.

**Check backend code:**
```typescript
// app/server/src/app.ts
app.use(cors({
  origin: process.env.CLIENT_URL,  // ✅ Specific URL
  // origin: '*',  // ❌ Too permissive
}));
```

**Verify environment:**
```bash
cd /opt/restaurant-management/deploy
grep CLIENT_URL .env
# Should show: CLIENT_URL=https://yourdomain.com
# NOT: CLIENT_URL=*
```

**Test:**
```bash
# Request từ allowed origin (should work)
curl -H "Origin: https://yourdomain.com" -I http://YOUR_DROPLET_IP:5000/api/v1/health

# Request từ random origin (should be blocked)
curl -H "Origin: https://evil.com" -I http://YOUR_DROPLET_IP:5000/api/v1/health
```

**Checklist:**
- [ ] `CLIENT_URL` set to specific domain
- [ ] CORS config uses `CLIENT_URL` environment variable
- [ ] Requests from allowed origin work
- [ ] Requests from other origins blocked

---

### 🔴 HTTPS Enforced

**Requirement:** Tất cả traffic qua HTTPS, HTTP redirect to HTTPS.

**Check:**
```bash
# Test HTTP redirect
curl -I http://yourdomain.com
# Should show: Location: https://yourdomain.com

# Test HTTPS works
curl -I https://yourdomain.com
# Should show: HTTP/2 200
```

**Caddy auto-config (already done):**
```caddyfile
# Caddyfile
yourdomain.com {
    # Caddy automatically redirects HTTP → HTTPS
    reverse_proxy frontend:3000
}
```

**Verify certificate:**
```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Should show:
# - Issuer: Let's Encrypt
# - Valid dates
# - No errors
```

**Test in browser:**
- Visit `http://yourdomain.com` → Should redirect to `https://`
- Check browser address bar: Should show 🔒 (lock icon)
- Certificate should be valid

**Checklist:**
- [ ] HTTPS works
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid (Let's Encrypt)
- [ ] No browser security warnings
- [ ] Certificate auto-renews (Caddy handles this)

---

### 🟡 Security Headers

**Requirement:** HTTP security headers configured.

**Check:**
```bash
curl -I https://yourdomain.com
```

**Expected headers:**
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

**Implementation (Caddy):**
```caddyfile
yourdomain.com {
    header {
        # HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        
        # Prevent MIME sniffing
        X-Content-Type-Options "nosniff"
        
        # Prevent clickjacking
        X-Frame-Options "DENY"
        
        # XSS Protection
        X-XSS-Protection "1; mode=block"
        
        # Referrer Policy
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    
    reverse_proxy frontend:3000
}
```

**Check implementation (Backend - Helmet.js):**
```typescript
// app/server/src/app.ts
import helmet from 'helmet';

app.use(helmet({
    contentSecurityPolicy: false,  // Next.js handles CSP
    crossOriginEmbedderPolicy: false,
}));
```

**Checklist:**
- [ ] HSTS header present
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY hoặc SAMEORIGIN
- [ ] Security headers passed online checkers

---

### 🟡 Input Validation

**Requirement:** All user inputs validated.

**Check backend validation:**
```typescript
// Example: app/server/src/features/auth/auth.controller.ts
import { z } from 'zod';

const loginSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6),
});

// ✅ Zod validation already implemented
```

**Verify:**
- Backend uses Zod for request validation
- Frontend uses React Hook Form + Zod
- Database queries use Prisma (SQL injection protected)

**Checklist:**
- [ ] Backend validates all inputs với Zod
- [ ] Frontend validates inputs
- [ ] No raw SQL queries (use Prisma)
- [ ] File upload validation (type, size)

---

## 4️⃣ Docker Security

### 🔴 Containers Run as Non-Root

**Requirement:** Docker containers không run as root user.

**Check Dockerfiles:**
```dockerfile
# app/server/Dockerfile
USER nestjs  # ✅ Non-root user

# app/client/Dockerfile
USER nextjs  # ✅ Non-root user
```

**Verify running containers:**
```bash
# Check process user
docker exec restaurant_server_prod whoami
# Should show: nestjs (NOT root)

docker exec restaurant_client_prod whoami
# Should show: nextjs (NOT root)
```

**Checklist:**
- [ ] Server container runs as `nestjs` user
- [ ] Client container runs as `nextjs` user
- [ ] Database containers use default non-root users
- [ ] No containers run as root

---

### 🟡 Container Resource Limits

**Requirement:** Memory và CPU limits để prevent resource exhaustion.

**Check docker-compose:**
```yaml
# docker-compose.override.yml
services:
  server:
    mem_limit: 512M
    cpus: 0.5
```

**Verify limits active:**
```bash
docker stats --no-stream
# Should show memory limits
```

**Checklist:**
- [ ] Memory limits configured for all containers
- [ ] CPU limits configured
- [ ] Limits appropriate cho Droplet size
- [ ] No single container can exhaust all resources

---

### 🟡 Image Scanning (Optional)

**Benefit:** Detect vulnerabilities in Docker images.

**Tools:**
```bash
# Install Trivy
sudo apt install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt update
sudo apt install trivy

# Scan image
trivy image restaurant-server:latest
```

**Checklist:**
- [ ] Scan images for vulnerabilities
- [ ] Critical/High vulnerabilities addressed
- [ ] Update base images regularly

---

## 5️⃣ Data Security

### 🔴 Environment File Permissions

**Requirement:** `.env` file chỉ readable by owner.

**Check:**
```bash
cd /opt/restaurant-management/deploy
ls -la .env
# Should show: -rw------- (600)
```

**Fix permissions:**
```bash
chmod 600 .env
chown root:root .env
```

**Verify:**
```bash
# Try read as other user (should fail)
sudo -u nobody cat .env
# Permission denied
```

**Checklist:**
- [ ] `.env` permissions = 600
- [ ] `.env` owner = root
- [ ] `.env` NOT in Git repository
- [ ] `.env.example` có trong Git (without secrets)

---

### 🔴 Database Backups Encrypted (Optional but Recommended)

**Benefit:** Protect sensitive data in backups.

**Implementation:**
```bash
# Backup với encryption
#!/bin/bash
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql.gz"
ENCRYPT_PASSWORD="your-strong-encryption-password"

# Create encrypted backup
docker exec restaurant_postgres_prod pg_dump -U restaurant_admin restaurant_db | \
gzip | \
openssl enc -aes-256-cbc -salt -pbkdf2 -pass pass:$ENCRYPT_PASSWORD > \
/opt/restaurant-management/backups/$BACKUP_FILE.enc

# Restore
openssl enc -d -aes-256-cbc -pbkdf2 -pass pass:$ENCRYPT_PASSWORD -in backup.sql.gz.enc | \
gunzip | \
docker exec -i restaurant_postgres_prod psql -U restaurant_admin restaurant_db
```

**Checklist:**
- [ ] Backup encryption implemented
- [ ] Encryption password stored securely
- [ ] Tested restore from encrypted backup

---

### 🟡 Database Connection String Security

**Requirement:** Database credentials không log ra hoặc expose.

**Check:**
```bash
# Verify DATABASE_URL không show trong logs
docker logs restaurant_server_prod | grep DATABASE_URL
# Should: Not found

# Check environment variable handling
docker exec restaurant_server_prod env | grep DATABASE_URL
# OK to show here (secured container)
```

**Code check:**
```typescript
// DON'T log DATABASE_URL
console.log(process.env.DATABASE_URL);  // ❌

// OK to log connection status
console.log('Database connected');  // ✅
```

**Checklist:**
- [ ] DATABASE_URL không logged
- [ ] Error messages không expose credentials
- [ ] Connection strings properly secured

---

## 6️⃣ Monitoring & Logging

### 🟡 Log Rotation

**Requirement:** Logs không chiếm hết disk space.

**Implementation:**
```yaml
# docker-compose.override.yml
services:
  server:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**System log rotation:**
```bash
# Check logrotate config
cat /etc/logrotate.d/docker-container

# Manual rotation
sudo logrotate -f /etc/logrotate.d/docker-container
```

**Checklist:**
- [ ] Docker log rotation configured
- [ ] System logs rotated
- [ ] Old logs cleaned up automatically
- [ ] Disk space monitored

---

### 🟢 Intrusion Detection (Optional)

**Tools:**
- **AIDE** - File integrity monitoring
- **rkhunter** - Rootkit detection
- **ClamAV** - Antivirus

**Basic setup:**
```bash
# Install rkhunter
sudo apt install rkhunter -y

# Update database
sudo rkhunter --update

# Run scan
sudo rkhunter --check

# Schedule daily scans
echo "0 3 * * * root /usr/bin/rkhunter --check --skip-keypress" | sudo tee -a /etc/crontab
```

**Checklist:**
- [ ] Intrusion detection installed (optional)
- [ ] Regular scans scheduled
- [ ] Alerts configured

---

## 7️⃣ Update & Patch Management

### 🔴 System Updates

**Requirement:** Security updates applied regularly.

**Check:**
```bash
# Check for updates
sudo apt update
sudo apt list --upgradable

# Security updates only
sudo unattended-upgrades --dry-run
```

**Apply updates:**
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Auto-reboot if needed
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

**Checklist:**
- [ ] System packages up to date
- [ ] Automatic security updates enabled
- [ ] Reboot schedule configured (if needed)
- [ ] Monitor update logs

---

### 🟡 Docker Updates

**Check Docker version:**
```bash
docker --version
docker-compose --version

# Check for updates
sudo apt update
sudo apt list --upgradable | grep docker
```

**Update Docker:**
```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Restart Docker
sudo systemctl restart docker
```

**Checklist:**
- [ ] Docker CE updated to latest stable
- [ ] Docker Compose V2 updated
- [ ] Containers restart successfully after update

---

### 🟡 Application Dependencies

**Update Node.js packages:**
```bash
cd /opt/restaurant-management/app/server
npm outdated

# Update dependencies
npm update

# Check for vulnerabilities
npm audit
npm audit fix
```

**Checklist:**
- [ ] Regular dependency updates (monthly)
- [ ] Security vulnerabilities addressed
- [ ] Test after updates
- [ ] Monitor for breaking changes

---

## 🔍 Security Audit Tools

### Online Scanners

**SSL/TLS:**
- [SSL Labs](https://www.ssllabs.com/ssltest/) - A+ rating mục tiêu
- [Mozilla Observatory](https://observatory.mozilla.org/)

**Security Headers:**
- [Security Headers](https://securityheaders.com/)
- Target: A rating

**General Security:**
- [ImmuniWeb](https://www.immuniweb.com/websec/)

**Checklist:**
- [ ] SSL Labs: A/A+ rating
- [ ] Security Headers: A rating
- [ ] No critical vulnerabilities found

---

### Command-Line Tools

```bash
# Port scan from external
nmap -sV YOUR_DROPLET_IP

# Should only show: 22, 80, 443

# Vulnerability scan
nikto -h https://yourdomain.com

# Check for common misconfigurations
lynis audit system
```

---

## ✅ Pre-Production Checklist

### Critical (Must Complete)
- [ ] SSH key authentication only (no passwords)
- [ ] UFW firewall enabled với minimal ports
- [ ] Database ports NOT exposed publicly
- [ ] Strong JWT secrets (32+ chars)
- [ ] Strong database passwords (24+ chars)
- [ ] CORS configured (not *)
- [ ] HTTPS enforced
- [ ] Containers run as non-root
- [ ] .env file permissions = 600
- [ ] System updates applied

### Important (Complete within 1 week)
- [ ] Security headers configured
- [ ] Fail2ban installed
- [ ] Rate limiting on SSH
- [ ] Container resource limits
- [ ] Log rotation configured
- [ ] Backup encryption setup
- [ ] SSL certificate monitoring

### Recommended (Complete within 1 month)
- [ ] Change SSH default port
- [ ] Image vulnerability scanning
- [ ] Intrusion detection system
- [ ] Automated security scans
- [ ] Security audit passed

---

## 📊 Security Monitoring Dashboard

### Weekly Tasks
```bash
# Check failed login attempts
sudo grep "Failed password" /var/log/auth.log | tail -20

# Check firewall logs
sudo tail -100 /var/log/ufw.log

# Check Docker container status
docker ps -a

# Scan for updates
sudo apt update && sudo apt list --upgradable
```

### Monthly Tasks
```bash
# Full system scan
sudo rkhunter --check

# Review user accounts
cat /etc/passwd

# Review sudo access
cat /etc/sudoers

# Docker cleanup
docker system prune -a

# Review backups
ls -lh /opt/restaurant-management/backups/
```

---

## 🚨 Incident Response

### If Server Compromised

**Immediate actions:**
1. **Disconnect server**: `sudo ufw deny out to any`
2. **Stop all services**: `docker-compose down`
3. **Create backup**: Run emergency backup script
4. **Analyze logs**: Check `/var/log/auth.log`, `/var/log/syslog`
5. **Contact DigitalOcean support**
6. **Reset from backup**: Restore known-good state

**Long-term:**
1. Full security audit
2. Update all passwords and secrets
3. Review access logs
4. Implement additional monitoring

---

## 📚 Resources

### Learning
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [DigitalOcean Security Tutorials](https://www.digitalocean.com/community/tags/security)

### Tools
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)

---

**Remember**: Security is ongoing process, not one-time setup. Review this checklist regularly! 🔒
