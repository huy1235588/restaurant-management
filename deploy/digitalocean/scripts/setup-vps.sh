#!/bin/bash

################################################################################
# VPS Setup Script for Restaurant Management System
# 
# This script prepares a fresh Ubuntu 22.04 LTS server for deployment
# 
# Usage: ./setup-vps.sh
# 
# What it does:
# - Installs Docker and Docker Compose
# - Configures UFW firewall
# - Sets up swap memory
# - Creates application directory structure
# - Sets timezone to Asia/Ho_Chi_Minh
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${GREEN}===${NC} $1 ${GREEN}===${NC}\n"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root (use: sudo ./setup-vps.sh)"
    exit 1
fi

log_step "Restaurant Management System - VPS Setup"

# Confirm before proceeding
read -p "This will install Docker, configure firewall, and setup system. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warn "Setup cancelled by user"
    exit 0
fi

################################################################################
# 1. System Update
################################################################################

log_step "Updating system packages"
apt update
apt upgrade -y
log_info "System packages updated"

################################################################################
# 2. Install Dependencies
################################################################################

log_step "Installing dependencies"
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    wget \
    software-properties-common \
    ufw \
    htop \
    vim \
    net-tools

log_info "Dependencies installed"

################################################################################
# 3. Install Docker
################################################################################

log_step "Installing Docker"

# Check if Docker already installed
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    log_warn "Docker already installed: $DOCKER_VERSION"
    read -p "Reinstall Docker? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Skipping Docker installation"
    else
        # Remove old Docker
        apt remove -y docker docker-engine docker.io containerd runc || true
        
        # Install Docker
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        log_info "Docker reinstalled"
    fi
else
    # Add Docker's official GPG key
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    # Add repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    log_info "Docker installed successfully"
fi

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Verify installation
DOCKER_VERSION=$(docker --version)
COMPOSE_VERSION=$(docker compose version)
log_info "Docker version: $DOCKER_VERSION"
log_info "Docker Compose version: $COMPOSE_VERSION"

################################################################################
# 4. Configure UFW Firewall
################################################################################

log_step "Configuring UFW firewall"

# Disable firewall temporarily to configure
ufw --force disable

# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (check if custom port)
SSH_PORT=$(grep "^Port " /etc/ssh/sshd_config | awk '{print $2}' || echo "22")
log_info "Allowing SSH on port $SSH_PORT"
ufw allow $SSH_PORT/tcp comment 'SSH'

# Allow HTTP and HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Enable firewall
ufw --force enable

# Show status
log_info "Firewall configured and enabled"
ufw status verbose

################################################################################
# 5. Setup Swap Memory
################################################################################

log_step "Setting up swap memory"

# Check if swap already exists
if swapon --show | grep -q '/swapfile'; then
    log_warn "Swap file already exists"
    swapon --show
else
    # Determine swap size based on RAM
    TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
    
    if [ $TOTAL_RAM -lt 2048 ]; then
        SWAP_SIZE="1G"
    elif [ $TOTAL_RAM -lt 4096 ]; then
        SWAP_SIZE="2G"
    else
        SWAP_SIZE="4G"
    fi
    
    log_info "Creating ${SWAP_SIZE} swap file (RAM: ${TOTAL_RAM}MB)"
    
    # Create swap file
    fallocate -l $SWAP_SIZE /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Make swap permanent
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    
    # Configure swappiness (reduce swap usage)
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    
    log_info "Swap configured successfully"
    swapon --show
fi

################################################################################
# 6. Set Timezone
################################################################################

log_step "Setting timezone"

CURRENT_TZ=$(timedatectl | grep "Time zone" | awk '{print $3}')
log_info "Current timezone: $CURRENT_TZ"

if [ "$CURRENT_TZ" != "Asia/Ho_Chi_Minh" ]; then
    timedatectl set-timezone Asia/Ho_Chi_Minh
    log_info "Timezone set to Asia/Ho_Chi_Minh"
else
    log_info "Timezone already set correctly"
fi

timedatectl

################################################################################
# 7. Create Application Directory
################################################################################

log_step "Creating application directory"

APP_DIR="/opt/restaurant-management"

if [ -d "$APP_DIR" ]; then
    log_warn "Directory $APP_DIR already exists"
else
    mkdir -p $APP_DIR
    log_info "Created directory: $APP_DIR"
fi

# Create subdirectories
mkdir -p $APP_DIR/backups
mkdir -p $APP_DIR/logs

log_info "Directory structure created"
ls -la $APP_DIR

################################################################################
# 8. Configure Docker Daemon
################################################################################

log_step "Configuring Docker daemon"

# Create Docker daemon config
DOCKER_DAEMON_CONFIG="/etc/docker/daemon.json"

if [ ! -f "$DOCKER_DAEMON_CONFIG" ]; then
    cat > $DOCKER_DAEMON_CONFIG <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    {
      "base": "172.17.0.0/16",
      "size": 24
    }
  ]
}
EOF
    
    # Restart Docker to apply config
    systemctl restart docker
    log_info "Docker daemon configured"
else
    log_info "Docker daemon config already exists"
fi

################################################################################
# 9. Enable Docker BuildKit
################################################################################

log_step "Enabling Docker BuildKit"

# Add BuildKit to environment
if ! grep -q "DOCKER_BUILDKIT=1" /etc/environment; then
    echo "DOCKER_BUILDKIT=1" >> /etc/environment
    export DOCKER_BUILDKIT=1
    log_info "Docker BuildKit enabled"
else
    log_info "Docker BuildKit already enabled"
fi

################################################################################
# 10. Security Hardening (Basic)
################################################################################

log_step "Applying basic security hardening"

# Disable IPv6 if not needed (optional)
read -p "Disable IPv6? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat >> /etc/sysctl.conf <<EOF

# Disable IPv6
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1
EOF
    sysctl -p
    log_info "IPv6 disabled"
fi

# Set up automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
log_info "Automatic security updates enabled"

################################################################################
# 11. Final Verification
################################################################################

log_step "Verifying installation"

# Check Docker
if docker run --rm hello-world &> /dev/null; then
    log_info "✓ Docker working correctly"
else
    log_error "✗ Docker test failed"
fi

# Check Docker Compose
if docker compose version &> /dev/null; then
    log_info "✓ Docker Compose working correctly"
else
    log_error "✗ Docker Compose not found"
fi

# Check firewall
if ufw status | grep -q "Status: active"; then
    log_info "✓ Firewall active"
else
    log_warn "✗ Firewall not active"
fi

# Check swap
if swapon --show | grep -q '/swapfile'; then
    log_info "✓ Swap enabled"
else
    log_warn "✗ Swap not enabled"
fi

################################################################################
# 12. Display Summary
################################################################################

log_step "Setup Complete!"

echo ""
echo "==============================================="
echo "  VPS Setup Summary"
echo "==============================================="
echo ""
echo "Docker Version:       $(docker --version | awk '{print $3}' | tr -d ',')"
echo "Docker Compose:       $(docker compose version | awk '{print $4}')"
echo "Application Dir:      $APP_DIR"
echo "Timezone:             $(timedatectl | grep 'Time zone' | awk '{print $3}')"
echo "Swap Memory:          $(swapon --show | tail -1 | awk '{print $3}')"
echo "Firewall Status:      $(ufw status | grep Status | awk '{print $2}')"
echo ""
echo "==============================================="
echo "  Next Steps"
echo "==============================================="
echo ""
echo "1. Clone repository:"
echo "   cd $APP_DIR"
echo "   git clone <your-repo-url> ."
echo ""
echo "2. Configure environment:"
echo "   cd deploy"
echo "   cp .env.example .env"
echo "   nano .env  # Edit configuration"
echo ""
echo "3. Deploy application:"
echo "   cd digitalocean/scripts"
echo "   ./deploy.sh"
echo ""
echo "==============================================="
echo ""

log_info "Setup script completed successfully!"
log_warn "Please configure SSH key authentication and disable password login"
log_warn "Run: deploy/digitalocean/SECURITY_CHECKLIST.md"

exit 0
