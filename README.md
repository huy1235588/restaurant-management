<div align="center">

# 🍽️ Restaurant Management System

**A modern, full-stack solution for complete restaurant operations management**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/) [![NestJS](https://img.shields.io/badge/NestJS-11+-ea2845)](https://nestjs.com/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6)](https://www.typescriptlang.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo)

</div>

---

## 📋 Table of Contents

-   [Overview](#-overview)
-   [Features](#-features)
-   [Tech Stack](#-tech-stack)
-   [Quick Start](#-quick-start)
-   [Configuration](#-configuration)
-   [Documentation](#-documentation)
-   [Testing](#-testing)
-   [Deployment](#-deployment)
-   [Contributing](#-contributing)
-   [License](#-license)

## 🎯 Overview

A comprehensive restaurant management platform built with modern technologies, providing real-time order tracking, table management, inventory control, and staff coordination. Designed for restaurants of all sizes with scalability and ease of use in mind.

### Why This System?

-   **Real-time updates** via WebSocket for instant kitchen and floor synchronization
-   **Multi-language support** (English/Vietnamese) for diverse teams
-   **Responsive design** works on desktop, tablet, and mobile devices
-   **Role-based access** ensures proper security and workflow
-   **Analytics dashboard** for data-driven decision making
-   **Docker ready** for easy deployment and scaling

## ✨ Features

### Core Modules

| Module           | Description                      | Key Capabilities                                                    |
| ---------------- | -------------------------------- | ------------------------------------------------------------------- |
| **📋 Orders**    | End-to-end order management      | Real-time tracking, kitchen display, status updates, print receipts |
| **🪑 Tables**    | Floor and reservation management | Visual floor editor, status tracking, QR codes, time slots          |
| **🍽️ Menu**      | Complete menu administration     | Categories, items, pricing, combos, availability control            |
| **📦 Inventory** | Stock and supplier management    | Level tracking, alerts, purchase orders, reports                    |
| **👥 Staff**     | Team and access management       | Role-based control, scheduling, performance tracking                |
| **💰 Billing**   | Payment processing               | Multiple methods, split bills, discounts, tax calculation           |

### Technical Highlights

-   **Real-time Kitchen Display System** - Orders appear instantly on kitchen screens
-   **Multi-table Order Management** - Handle multiple tables simultaneously
-   **Visual Floor Plan Editor** - Drag-and-drop table arrangement
-   **Advanced Analytics** - Sales reports, inventory insights, staff performance
-   **Offline Support** - Continue operations during network issues (PWA)
-   **Theme Customization** - Light/dark modes with brand colors

## 🛠️ Tech Stack

<details>
<summary><b>Frontend Stack</b></summary>

-   **Framework:** Next.js 16.0 (App Router) with React 19
-   **Language:** TypeScript 5+
-   **Styling:** Tailwind CSS 4.1+
-   **UI Library:** Radix UI + shadcn/ui
-   **State:** Zustand 5.0+
-   **Forms:** React Hook Form + Zod
-   **Real-time:** Socket.io Client
-   **HTTP:** Axios with interceptors
-   **i18n:** i18next + react-i18next

</details>

<details>
<summary><b>Backend Stack</b></summary>

-   **Framework:** NestJS 11+ (Node.js 20+)
-   **Language:** TypeScript 5.7+
-   **Database:** PostgreSQL 16
-   **ORM:** Prisma 6+
-   **Authentication:** JWT + bcrypt
-   **Real-time:** Socket.io Gateway
-   **Cache:** Redis 7
-   **Storage:** Cloudflare R2 / Cloudinary
-   **API Docs:** Swagger/OpenAPI
-   **Logging:** Winston

</details>

<details>
<summary><b>Infrastructure</b></summary>

-   **Containerization:** Docker + Docker Compose
-   **Package Manager:** pnpm 9+
-   **Reverse Proxy:** Nginx/Caddy
-   **CI/CD:** GitHub Actions (optional)

</details>

## 🚀 Quick Start

### Prerequisites

Ensure you have these installed:

-   [Node.js 20+](https://nodejs.org/)
-   [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop)
-   [Git](https://git-scm.com/)

### Installation

#### Option 1: Automated Setup (Recommended)

**Windows:**

```powershell
.\deploy\scripts\setup-local.ps1
```

**macOS/Linux:**

```bash
chmod +x deploy/scripts/setup-local.sh && ./deploy/scripts/setup-local.sh
```

This script will:

-   ✅ Create environment files with secure defaults
-   ✅ Start PostgreSQL and Redis containers
-   ✅ Install all dependencies
-   ✅ Run database migrations and seeding
-   ✅ Start development servers

#### Option 2: Manual Setup

<details>
<summary><b>Click to expand manual steps</b></summary>

**1. Clone and setup**

```bash
git clone <repository-url>
cd restaurant-management
```

**2. Start infrastructure**

```bash
docker-compose -f deploy/docker-compose.dev.yml up -d
```

**3. Backend setup**

```bash
cd app/server
cp .env.example .env
# Edit .env with your configuration
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm run seed
pnpm run start:dev
```

**4. Frontend setup (in new terminal)**

```bash
cd app/client
cp .env.example .env
# Edit .env with API URL
pnpm install
pnpm run dev
```

</details>

### Access the Application

-   🌐 **Frontend:** [http://localhost:3000](http://localhost:3000)
-   🔧 **Backend API:** [http://localhost:5000](http://localhost:5000)
-   📖 **API Docs:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
-   🗄️ **Database UI:** Run `pnpm prisma studio` in server folder

### Default Login Credentials

| Role    | Email               | Password   |
| ------- | ------------------- | ---------- |
| Admin   | admin@example.com   | admin123   |
| Manager | manager@example.com | manager123 |
| Cashier | cashier@example.com | cashier123 |
| Server  | server@example.com  | server123  |
| Kitchen | kitchen@example.com | kitchen123 |

> ⚠️ **Security Note:** Change these credentials immediately after first login in production!

## 📂 Project Structure

```
restaurant-management/
├── app/
│   ├── client/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── modules/     # Feature modules
│   │   │   ├── components/  # Shared components
│   │   │   └── hooks/       # Custom hooks
│   │   └── locales/         # Translations (EN/VI)
│   │
│   ├── server/              # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/     # API modules
│   │   │   ├── common/      # Utilities
│   │   │   └── config/      # Configuration
│   │   └── prisma/          # Database schema
│   │
│   └── desktop/             # Tauri app (optional)
│
├── deploy/
│   ├── docker-compose.*.yml # Docker configs
│   └── scripts/             # Setup scripts
│
└── docs/                    # Documentation
    ├── features/
    ├── api/
    ├── architecture/
    └── technical/
```

## ⚙️ Configuration

### Environment Variables

<details>
<summary><b>Backend (.env)</b></summary>

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_db"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-key-change-this"
JWT_EXPIRES_IN="7d"

# File Upload (Optional)
CLOUDFLARE_R2_ACCOUNT_ID=""
CLOUDFLARE_R2_ACCESS_KEY_ID=""
CLOUDFLARE_R2_SECRET_ACCESS_KEY=""
CLOUDFLARE_R2_BUCKET_NAME=""

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

</details>

<details>
<summary><b>Frontend (.env.local)</b></summary>

```env
# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000

# Features (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
```

</details>

## 📚 Documentation

Comprehensive guides available in the `/docs` directory:

-   📖 **[Features Guide](docs/features/)** - Detailed feature documentation
-   🏗️ **[Architecture](docs/architecture/)** - System design & database schema
-   🔌 **[API Reference](docs/api/)** - Complete API documentation
-   🛠️ **[Technical Guides](docs/technical/)** - Implementation details
-   📊 **[Use Cases](docs/diagrams/)** - System diagrams and workflows
-   🚀 **[Deployment Guide](deploy/README.md)** - Production deployment

### Quick Links

-   [Database Schema](docs/architecture/DATABASE.md)
-   [API Endpoints](docs/api/)
-   [Desktop App Guide](docs/technical/DESKTOP_DOCUMENTATION.md)
-   [Video Demo Script](docs/VIDEO_DEMO_SCRIPT.md)

## 🧪 Testing

### Run Tests

```bash
# Backend
cd app/server
pnpm test              # Unit tests
pnpm test:e2e          # End-to-end tests
pnpm test:cov          # Coverage report

# Frontend
cd app/client
pnpm test              # Component tests
pnpm test:coverage     # Coverage
```

### Database Management

```bash
cd app/server

# Generate Prisma client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name your_migration_name

# Seed database
pnpm run seed

# Open database GUI
pnpm prisma studio
```

## 🐳 Deployment

### Docker Deployment

**Development:**

```bash
docker-compose -f deploy/docker-compose.dev.yml up
```

**Production:**

```bash
docker-compose -f deploy/docker-compose.prod.yml up -d
```

See [deploy/README.md](deploy/README.md) for detailed deployment instructions including:

-   Cloud deployment (AWS, GCP, Azure)
-   SSL/TLS configuration
-   Backup strategies
-   Scaling guidelines

### Desktop Application

Build standalone desktop app using Tauri:

```bash
cd app/desktop
pnpm install
pnpm tauri build
```

Installers will be in `app/desktop/src-tauri/target/release/bundle/`

## 🛡️ Security

Built-in security features:

-   ✅ JWT authentication with secure token handling
-   ✅ Role-based access control (RBAC)
-   ✅ bcrypt password hashing (10 rounds)
-   ✅ Request rate limiting
-   ✅ CORS protection
-   ✅ Helmet.js security headers
-   ✅ Input validation (Zod schemas)
-   ✅ SQL injection prevention (Prisma)
-   ✅ XSS protection
-   ✅ CSRF tokens for state-changing operations

## 🐛 Troubleshooting

<details>
<summary><b>Database Connection Issues</b></summary>

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs restaurant-postgres

# Restart database
docker-compose -f deploy/docker-compose.dev.yml restart postgres
```

</details>

<details>
<summary><b>Port Already in Use</b></summary>

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

</details>

<details>
<summary><b>Redis Connection Issues</b></summary>

```bash
# Check Redis status
docker ps | grep redis

# Test connection
redis-cli ping

# Restart Redis
docker-compose -f deploy/docker-compose.dev.yml restart redis
```

</details>

For more troubleshooting, see [deploy/README.md](deploy/README.md#troubleshooting).

---

## 🌟 Acknowledgments

Built with these amazing technologies:

-   [Next.js](https://nextjs.org/) - The React Framework
-   [NestJS](https://nestjs.com/) - Progressive Node.js Framework
-   [Prisma](https://www.prisma.io/) - Next-generation ORM
-   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
-   [Radix UI](https://www.radix-ui.com/) - Unstyled UI Primitives
-   [Socket.io](https://socket.io/) - Real-time Communication

---

</div>
