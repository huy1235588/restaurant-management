# 🍽️ Restaurant Management System

> A modern, full-stack restaurant management system built with Next.js, Express, and PostgreSQL, fully containerized with Docker.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Node.js](https://img.shields.io/badge/Node.js-20-green)

## 🌟 Features

- **🔐 Authentication & Authorization** - JWT-based secure authentication
- **📋 Order Management** - Real-time order tracking and management
- **👨‍🍳 Kitchen Display** - Live kitchen orders with WebSocket updates
- **🪑 Table Management** - Table reservation and status tracking
- **📱 Responsive Design** - Mobile-friendly interface
- **🌐 Internationalization** - Multi-language support (EN/VI)
- **⚡ Real-time Updates** - WebSocket-powered live updates
- **🐳 Docker Ready** - Fully containerized deployment

## 🚀 Quick Start with Docker

### Prerequisites

- Docker Engine 20.10+
- Docker Compose V2+
- 4GB RAM minimum

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd restaurant-management
```

### 2. Setup Environment

```powershell
# Windows
.\docker.ps1 env

# Linux/Mac
./docker.sh env
# or
make env
```

### 3. Configure .env

Edit `.env` file and update:

```env
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-minimum-32-chars
```

**Generate secure JWT secret:**

```powershell
# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Linux/Mac
openssl rand -base64 32
```

### 4. Start Application

**Development (with hot reload):**

```powershell
# Windows
.\docker.ps1 dev

# Linux/Mac
./docker.sh dev
# or
make dev
```

**Production:**

```powershell
# Windows
.\docker.ps1 prod

# Linux/Mac
./docker.sh prod
# or
make prod
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**DOCKER.md**](./DOCKER.md) | Complete Docker deployment guide |
| [**DOCKER_OPTIMIZATION.md**](./DOCKER_OPTIMIZATION.md) | Docker optimization details |

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - Data fetching
- **Socket.io Client** - Real-time communication

### Backend
- **Express.js 5** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database ORM
- **PostgreSQL 16** - Database
- **Redis 7** - Caching & sessions
- **Socket.io** - WebSocket server
- **JWT** - Authentication

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD

## 📦 Project Structure

```
restaurant-management/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   ├── services/      # API services
│   │   ├── stores/        # Zustand stores
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   ├── locales/           # i18n translations
│   └── Dockerfile         # Production build
│
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Express middlewares
│   │   ├── repositories/  # Data access layer
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utilities
│   │   └── validators/    # Input validation
│   ├── prisma/            # Prisma schema & migrations
│   ├── logs/              # Application logs
│   └── Dockerfile         # Production build
│
├── nginx/                 # Nginx configuration
│   └── nginx.conf         # Reverse proxy config
│
├── .github/
│   └── workflows/         # CI/CD workflows
│       └── docker-build.yml
│
├── docker-compose.yml     # Production setup
├── docker-compose.dev.yml # Development setup
├── docker.ps1             # Windows management script
├── docker.sh              # Linux/Mac management script
├── Makefile               # Make commands
├── .env.example           # Environment template
└── DOCKER.md              # Docker documentation
```

## 🔧 Development

### Prerequisites for Local Development

- Node.js 20+
- pnpm 8+
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)

### Local Setup (without Docker)

#### 1. Install Dependencies

```bash
# Client
cd client
pnpm install

# Server
cd ../server
pnpm install
```

#### 2. Setup Database

```bash
# In server directory
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

#### 3. Start Development Servers

```bash
# Terminal 1 - Server
cd server
pnpm dev

# Terminal 2 - Client
cd client
pnpm dev
```

### Docker Development

```powershell
# Start with hot reload
.\docker.ps1 dev

# View logs
.\docker.ps1 logs

# Restart after changes
.\docker.ps1 restart

# Stop
.\docker.ps1 dev-down
```

## 📋 Common Commands

### Docker Commands (Windows)

```powershell
.\docker.ps1 env              # Setup environment
.\docker.ps1 dev              # Start development
.\docker.ps1 prod             # Start production
.\docker.ps1 prod-nginx       # Start with Nginx
.\docker.ps1 logs             # View logs
.\docker.ps1 status           # Check status
.\docker.ps1 restart          # Restart services
.\docker.ps1 db-migrate       # Run migrations
.\docker.ps1 db-seed          # Seed database
.\docker.ps1 db-backup        # Backup database
.\docker.ps1 clean            # Clean up
.\docker.ps1 help             # Show all commands
```

### Docker Commands (Linux/Mac)

```bash
./docker.sh <command>
# or
make <command>
```

### Database Commands

```powershell
.\docker.ps1 db-migrate       # Run migrations
.\docker.ps1 db-seed          # Seed database
.\docker.ps1 db-reset         # Reset database (⚠️ destructive)
.\docker.ps1 db-studio        # Open Prisma Studio
.\docker.ps1 db-backup        # Backup to backup.sql
.\docker.ps1 db-restore       # Restore from backup.sql
.\docker.ps1 shell-db         # Access PostgreSQL shell
```

## 🧪 Testing

```bash
# Server tests
cd server
pnpm test
pnpm test:watch
pnpm test:coverage

# Client tests (if configured)
cd client
pnpm test
```

## 🚀 Deployment

### Docker Deployment (Recommended)

See [DOCKER.md](./DOCKER.md) for complete deployment guide.

**Quick Production Deploy:**

```powershell
# 1. Configure environment
.\docker.ps1 env
# Edit .env with production values

# 2. Build and start
.\docker.ps1 prod

# 3. With Nginx reverse proxy
.\docker.ps1 prod-nginx
```

### Manual Deployment

#### Build Client

```bash
cd client
pnpm build
pnpm start  # or deploy to Vercel/Netlify
```

#### Build Server

```bash
cd server
pnpm build
pnpm prisma:generate
pnpm prisma:migrate:deploy
pnpm start
```

## 🔒 Security

### Production Checklist

- ✅ Change `POSTGRES_PASSWORD` in `.env`
- ✅ Generate secure `JWT_SECRET` (32+ characters)
- ✅ Enable HTTPS/SSL in Nginx
- ✅ Configure firewall rules
- ✅ Set up rate limiting
- ✅ Enable security headers
- ✅ Regular security updates
- ✅ Use environment variable management
- ✅ Enable database backups
- ✅ Monitor application logs

See [DOCKER.md - Security Section](./DOCKER.md#-security) for details.

## 📊 Monitoring

### View Logs

```powershell
# All services
.\docker.ps1 logs

# Specific service
.\docker.ps1 logs-server
.\docker.ps1 logs-client
.\docker.ps1 logs-db

# Follow logs
docker-compose logs -f
```

### Check Health

```powershell
# Container status
.\docker.ps1 status

# Health endpoints
curl http://localhost:5000/health
```

### Resource Usage

```powershell
# Live stats
docker stats

# Container details
docker ps
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```env
# Change ports in .env
CLIENT_PORT=3001
SERVER_PORT=5001
```

#### Database Connection Failed

```powershell
# Check database status
.\docker.ps1 logs-db

# Restart database
docker-compose restart postgres
```

#### Build Failures

```powershell
# Clear cache and rebuild
docker builder prune -af
.\docker.ps1 rebuild
```

#### Clean Start

```powershell
# Remove everything and start fresh
.\docker.ps1 clean
.\docker.ps1 prod
```

See [DOCKER.md - Troubleshooting](./DOCKER.md#-troubleshooting) for complete guide.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Docker team for containerization
- All contributors and maintainers

## 📞 Support

- **Documentation**: [DOCKER.md](./DOCKER.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/restaurant-management/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/restaurant-management/discussions)

---

**Made with ❤️ using Next.js, Express, and Docker**

⭐ If you find this project helpful, please consider giving it a star!
