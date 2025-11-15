#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Generating Production Secrets${NC}"
echo -e "${GREEN}=================================================${NC}"

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo -e "${YELLOW}JWT_SECRET:${NC}"
echo "$JWT_SECRET"
echo ""

# Generate PostgreSQL Password
POSTGRES_PASSWORD=$(openssl rand -base64 32)
echo -e "${YELLOW}POSTGRES_PASSWORD:${NC}"
echo "$POSTGRES_PASSWORD"
echo ""

# Generate Redis Password (optional)
REDIS_PASSWORD=$(openssl rand -base64 32)
echo -e "${YELLOW}REDIS_PASSWORD (optional):${NC}"
echo "$REDIS_PASSWORD"
echo ""

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}Save these secrets securely!${NC}"
echo -e "${GREEN}Add them to .env.production and GitHub Secrets${NC}"
echo -e "${GREEN}=================================================${NC}"

# Optionally create .env.production
read -p "Create .env.production file? (yes/no): " CREATE_ENV
if [ "$CREATE_ENV" = "yes" ]; then
    if [ -f ".env.production" ]; then
        echo -e "${YELLOW}Warning: .env.production already exists${NC}"
        read -p "Overwrite? (yes/no): " OVERWRITE
        if [ "$OVERWRITE" != "yes" ]; then
            echo "Skipping .env.production creation"
            exit 0
        fi
    fi
    
    read -p "Enter Droplet IP: " DROPLET_IP
    read -p "Enter GitHub username: " GITHUB_USER
    read -p "Enter repository name: " REPO_NAME
    read -p "Enter Cloudinary cloud name: " CLOUDINARY_CLOUD_NAME
    read -p "Enter Cloudinary API key: " CLOUDINARY_API_KEY
    read -p "Enter Cloudinary API secret: " CLOUDINARY_API_SECRET
    
    cat > .env.production <<EOF
NODE_ENV=production

# Server
PORT=5000
API_VERSION=v1
API_BASE_URL=http://${DROPLET_IP}:5000
CLIENT_URL=http://${DROPLET_IP}:3000

# Database
POSTGRES_USER=restaurant_admin
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=restaurant_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://restaurant_admin:$POSTGRES_PASSWORD@postgres:5432/restaurant_db?schema=public&connect_timeout=10&pool_timeout=10

# Redis
REDIS_URL=redis://redis:6379
REDIS_PORT=6379

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Storage
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET

# Frontend
NEXT_PUBLIC_API_URL=http://${DROPLET_IP}:5000
NEXT_PUBLIC_SOCKET_URL=http://${DROPLET_IP}:5000

# GitHub
GITHUB_REPOSITORY=${GITHUB_USER}/${REPO_NAME}
EOF

    chmod 600 .env.production
    echo -e "${GREEN}✓ .env.production created successfully${NC}"
    echo -e "${YELLOW}Review and adjust the file as needed${NC}"
fi
