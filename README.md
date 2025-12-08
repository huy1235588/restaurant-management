<div align="center">

# 🍽️ Restaurant Management System

**A comprehensive, modern restaurant management solution with real-time features**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [Documentation](#-documentation)

</div>

---

## 📖 Overview

A full-stack restaurant management system designed for modern restaurants, featuring real-time order tracking, visual table management, inventory control, and comprehensive reporting. Built with scalability, performance, and user experience in mind.

### 🎯 Key Highlights

- **Real-time Updates**: WebSocket integration for live order status and table management
- **Visual Floor Plan**: Interactive drag-and-drop table layout editor
- **Multi-platform**: Web application with desktop support via Tauri
- **Role-based Access**: Granular permission system for different staff roles
- **Comprehensive**: Full feature set from reservation to payment processing
- **Production Ready**: Complete with Docker, CI/CD, and deployment guides

---

## ✨ Features

### 👨‍💼 Management Features
- 📊 **Dashboard & Analytics** - Real-time business metrics and reporting
- 🍕 **Menu Management** - Complete CRUD operations for dishes, categories, and pricing
- 🪑 **Table Management** - Visual floor plan editor with drag-and-drop
- 📅 **Reservation System** - Online and offline booking with customer management
- 👥 **Staff Management** - Employee scheduling, roles, and permissions
- 📦 **Inventory Control** - Stock tracking, alerts, and supplier management

### 🛎️ Operational Features
- 📝 **Order Management** - Create, modify, and track orders in real-time
- 🍳 **Kitchen Display System** - Real-time order notifications for chefs
- 💰 **Payment Processing** - Multiple payment methods (cash, card, e-wallet)
- 🧾 **Bill Generation** - Automatic invoice creation with tax calculation
- 🔔 **Real-time Notifications** - WebSocket-powered live updates
- 📱 **QR Code Integration** - Digital menu and quick ordering

### 🔐 System Features
- 🔑 **Authentication & Authorization** - JWT-based secure login with refresh tokens
- 🌐 **Internationalization** - Multi-language support (Vietnamese, English)
- 🌙 **Dark/Light Mode** - User preference theme switching
- 📁 **File Storage** - Local and Cloudinary CDN support
- 🔒 **Security** - Rate limiting, input validation, CORS protection
- 📧 **Email Notifications** - Order confirmations and alerts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) - Powerful async state management
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) - Type-safe form validation
- **Real-time**: [Socket.io Client](https://socket.io/) - WebSocket communication
- **Charts**: [Recharts](https://recharts.org/) - Composable charting library
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful, consistent icon set
- **i18n**: [i18next](https://www.i18next.com/) - Internationalization framework

### Backend
- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Reliable relational database
- **ORM**: [Prisma](https://www.prisma.io/) - Next-generation ORM
- **Cache**: [Redis](https://redis.io/) - In-memory data structure store
- **Authentication**: [Passport](http://www.passportjs.org/) + JWT - Secure authentication
- **WebSocket**: [Socket.io](https://socket.io/) - Real-time bidirectional communication
- **Validation**: [Class Validator](https://github.com/typestack/class-validator) - Decorator-based validation
- **API Docs**: [Swagger](https://swagger.io/) - OpenAPI documentation
- **File Upload**: [Multer](https://github.com/expressjs/multer) - Multipart/form-data handling
- **Storage**: Local + [Cloudinary](https://cloudinary.com/) - Media management

### Desktop Application
- **Framework**: [Tauri](https://tauri.app/) - Build desktop apps with web technologies
- **Frontend**: [React](https://react.dev/) + [Vite](https://vite.dev/)

### DevOps & Infrastructure
- **Containerization**: [Docker](https://www.docker.com/) + Docker Compose
- **Reverse Proxy**: [Caddy](https://caddyserver.com/) / Nginx - Automatic HTTPS
- **CI/CD**: GitHub Actions - Automated testing and deployment
- **Deployment**: 
  - [Vercel](https://vercel.com/) (Frontend)
  - [Railway](https://railway.app/) (Backend + Database)
  - [DigitalOcean](https://www.digitalocean.com/) (VPS option)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** ([Install](https://pnpm.io/installation))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git**

### Quick Setup (Automated)

We provide automated setup scripts for both Windows and Unix-based systems:

#### Windows (PowerShell)
```powershell
.\deploy\scripts\setup-local.ps1
```

#### Linux/macOS
```bash
chmod +x deploy/scripts/setup-local.sh
./deploy/scripts/setup-local.sh
```

The script will automatically:
- ✅ Create `.env` from `.env.example`
- ✅ Generate secure JWT secrets
- ✅ Start PostgreSQL and Redis containers
- ✅ Run database migrations
- ✅ Optionally seed demo data

### Manual Setup

If you prefer manual setup or the script fails:

#### 1. Clone the repository
```bash
git clone https://github.com/huy1235588/restaurant-management.git
cd restaurant-management
```

#### 2. Start Docker services
```bash
docker-compose -f deploy/docker-compose.yml up -d
```

#### 3. Configure environment variables
```bash
cd deploy
cp .env.example .env
# Edit .env and update the values, especially JWT_SECRET
```

#### 4. Setup and start the backend
```bash
cd app/server
pnpm install
pnpm prisma migrate deploy
pnpm prisma db seed  # Optional: add demo data
pnpm dev
```

#### 5. Setup and start the frontend
```bash
cd app/client
pnpm install
pnpm dev
```

### Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### Default Login Credentials (Demo Data)

After seeding the database, you can login with:

- **Admin**: 
  - Username: `admin`
  - Password: (check seed data)
- **Manager**: 
  - Username: `manager`
  - Password: (check seed data)

---

## 🌐 Deployment

This project supports multiple deployment options for different use cases:

### Option A: Vercel + Railway (Recommended for Quick Demo)

**Best for**: Fast deployment, demos, small-scale projects

- ✅ **Cost**: Free tier available ($0-5/month)
- ✅ **Setup Time**: 20-30 minutes
- ✅ **Automatic HTTPS/SSL**
- ✅ **No server management required**

📖 **[Complete Vercel + Railway Guide](deploy/README.md#option-a-vercel--railway-recommended)**

### Option B: DigitalOcean VPS (Recommended for Production & Learning)

**Best for**: Production environments, learning DevOps, full control

- ✅ **Cost**: Free with GitHub Education Pack ($200 credit = 33 months)
- ✅ **Full infrastructure control**
- ✅ **Learn server administration** (Docker, Linux, Security)
- ✅ **Production-ready** with complete security setup

📖 **Detailed Guides**:
- 🇻🇳 **[DigitalOcean Deployment Guide (Vietnamese)](deploy/digitalocean/DEPLOYMENT_GUIDE_VI.md)**
- 📋 **[Quick Reference Commands](deploy/digitalocean/QUICK_REFERENCE.md)**
- 💰 **[Cost Optimization Guide](deploy/digitalocean/COST_OPTIMIZATION.md)**
- 🔒 **[Security Checklist](deploy/digitalocean/SECURITY_CHECKLIST.md)**

### Environment Variables

Key environment variables to configure:

```env
# Database
POSTGRES_USER=restaurant_admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=restaurant_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Storage (optional - for Cloudinary)
STORAGE_TYPE=local
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

For complete environment configuration, see [`.env.example`](deploy/.env.example)

---

## 📁 Project Structure

```
restaurant-management/
├── app/
│   ├── client/          # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Utilities and configs
│   │   │   ├── stores/       # Zustand state stores
│   │   │   └── types/        # TypeScript types
│   │   └── public/       # Static assets
│   │
│   ├── server/          # NestJS backend application
│   │   ├── src/
│   │   │   ├── modules/      # Feature modules
│   │   │   ├── common/       # Shared utilities
│   │   │   ├── guards/       # Auth guards
│   │   │   └── decorators/   # Custom decorators
│   │   └── prisma/       # Database schema & migrations
│   │
│   └── desktop/         # Tauri desktop application
│       └── tauri/
│
├── deploy/              # Deployment configurations
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── scripts/         # Deployment automation scripts
│   └── digitalocean/    # DigitalOcean VPS setup
│
├── docs/                # Comprehensive documentation
│   ├── features/        # Feature specifications
│   ├── architecture/    # System architecture & database design
│   ├── technical/       # Technical guides
│   ├── api/             # API documentation
│   ├── use_case/        # Use case documents
│   └── diagrams/        # System diagrams
│
└── openspec/            # OpenSpec specifications
```

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

### For Developers
- 🏗️ **[Architecture Overview](docs/architecture/BUSINESS_USE_CASES.md)** - System design and requirements
- 🗄️ **[Database Schema](docs/architecture/DATABASE.md)** - Complete database design
- 🔧 **[Frontend Guide](docs/technical/FRONTEND_DOCUMENTATION.md)** - Frontend architecture
- 🔌 **[WebSocket Integration](docs/technical/WEBSOCKET_INTEGRATION.md)** - Real-time features
- 📁 **[File Storage Guide](docs/technical/FILE_STORAGE_GUIDE.md)** - File upload & storage

### For Product Managers
- 🎯 **[Feature Documentation](docs/features/)** - Detailed feature specifications
- 📊 **[Use Cases](docs/use_case/)** - Business use cases
- 📈 **[Business Requirements](docs/architecture/BUSINESS_USE_CASES.md)**

### For DevOps Engineers
- 🚀 **[Deployment Guide](deploy/README.md)** - Complete deployment instructions
- 🐳 **[Docker Setup](deploy/)** - Container configurations
- 📋 **[Quick Reference](deploy/digitalocean/QUICK_REFERENCE.md)** - Common commands
- 💰 **[Cost Optimization](deploy/digitalocean/COST_OPTIMIZATION.md)** - Reduce costs

### API Documentation
- 📖 **[Swagger UI](http://localhost:5000/api-docs)** - Interactive API documentation (when server is running)
- 🌐 **[API Reference](docs/api/)** - API endpoint documentation

For a complete documentation index, see **[docs/README.md](docs/README.md)**

---

## 🧪 Testing

### Backend Tests
```bash
cd app/server

# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

### Frontend Tests
```bash
cd app/client

# Run tests (when available)
pnpm test
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Use TypeScript strict mode
- Follow the feature documentation template in [`docs/templates/`](docs/templates/)

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🔒 Security

Security is a top priority. The system includes:

- 🔐 JWT-based authentication with refresh tokens
- 🛡️ Rate limiting and throttling
- ✅ Input validation and sanitization
- 🔒 CORS protection
- 🔑 Bcrypt password hashing
- 🚨 SQL injection prevention (via Prisma)
- 📧 Secure environment variable management

If you discover a security vulnerability, please email us at [security contact] instead of using the issue tracker.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

- **Huy Nguyen** - *Initial work* - [@huy1235588](https://github.com/huy1235588)

See also the list of [contributors](https://github.com/huy1235588/restaurant-management/contributors) who participated in this project.

---

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by real-world restaurant management needs
- Thanks to all open-source projects that made this possible

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/huy1235588/restaurant-management/issues)
- **Discussions**: [GitHub Discussions](https://github.com/huy1235588/restaurant-management/discussions)
- **Documentation**: [Full Documentation](docs/README.md)
- **Email**: [Contact Information]

---

## 🗺️ Roadmap

### Current Features
- ✅ Core restaurant management functionality
- ✅ Real-time order tracking
- ✅ Visual table management
- ✅ Multi-language support
- ✅ Desktop application

### Upcoming Features
- 🔄 Mobile application (React Native)
- 📊 Advanced analytics and reporting
- 🤖 AI-powered demand forecasting
- 📱 Customer-facing mobile app
- 🔗 Third-party integrations (Delivery platforms)
- 💳 More payment gateway integrations

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by the Restaurant Management Team

</div>
