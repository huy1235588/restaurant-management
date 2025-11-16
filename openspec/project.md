# Project Context

## Purpose
A comprehensive, full-stack restaurant management system designed to streamline restaurant operations including:
- Order management with real-time kitchen display
- Table reservation and status tracking
- Menu and inventory management
- Staff management with role-based access control
- Payment processing and billing
- Real-time updates via WebSocket
- Multi-language support (EN/VI)

**Target Users**: Restaurant owners, managers, waitstaff, kitchen staff, and cashiers.

## Tech Stack

### Frontend
- **Framework**: Next.js 16.0.0 with React 19.2.0
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4.1+ with custom CSS variables for theming
- **UI Components**: Radix UI primitives (Dialog, Dropdown, Popover, etc.)
- **State Management**: Zustand 5.0+
- **Forms**: React Hook Form 7.54+ with Zod 4.1+ validation
- **Internationalization**: i18next 25.6+ with react-i18next 16.2+
- **Real-time**: Socket.io-client 4.8+
- **HTTP Client**: Axios 1.7+
- **Animations**: Framer Motion 12.23+
- **Date Handling**: date-fns 4.1+
- **Charts**: Recharts 3.3+
- **Theme**: next-themes 0.4+ for dark mode support

### Backend
- **Framework**: Express 5.1+ on Node.js 20+
- **Language**: TypeScript 5.7+
- **Database**: PostgreSQL 16 with Prisma 6.18+ ORM
- **Authentication**: JWT (jsonwebtoken 9.0+) with bcryptjs 3.0+
- **Real-time**: Socket.io 4.8+
- **Caching**: Redis 7
- **File Upload**: Multer 2.0+ with Cloudflare R2 (primary) + Cloudinary 2.8+ (legacy)
- **Logging**: Winston 3.17+ with Morgan 1.10+
- **Security**: Helmet 8.0+, CORS 2.8+, express-rate-limit 8.1+
- **API Documentation**: Swagger (swagger-jsdoc 6.2+ & swagger-ui-express 5.0+)
- **Task Scheduling**: node-cron 4.2+
- **Validation**: Zod 4.1+

### Infrastructure
- **Containerization**: Docker with Docker Compose V2+
- **Reverse Proxy**: Nginx (optional)
- **Package Manager**: pnpm
- **Monorepo**: Organized as `app/client` and `app/server`

### Development Tools
- **Build Tools**: TypeScript compiler, tsc-alias, tsconfig-paths
- **Dev Server**: ts-node-dev, nodemon
- **Code Quality**: ESLint 9.38+ (Next.js config)

## Project Conventions

### Code Style
- **Language**: TypeScript with strict mode enabled
- **Formatting**: 
  - 4 spaces for indentation (inferred from config files)
  - Semicolons optional but consistent
  - Double quotes for strings
- **Naming Conventions**:
  - PascalCase for React components and types/interfaces
  - camelCase for functions, variables, and methods
  - UPPER_SNAKE_CASE for environment variables
  - kebab-case for file names in routes/pages
- **Import Aliases**: Use `@/*` for absolute imports from `src/` directory
- **File Organization**:
  - Group by feature/domain rather than type
  - Co-locate related files (component, styles, tests)

### Architecture Patterns

#### Frontend Architecture
- **Pattern**: Feature-based architecture with App Router (Next.js 16)
- **Directory Structure**:
  - `/src/app` - Next.js App Router pages and layouts
  - `/src/components` - Reusable UI components
  - `/src/contexts` - React Context providers
  - `/src/hooks` - Custom React hooks
  - `/locales` - i18n translation files (en.json, vi.json)
  - `/public` - Static assets (images, videos)
- **State Management**: 
  - Local state: React hooks (useState, useReducer)
  - Global state: Zustand stores
  - Server state: React Query or SWR patterns (via hooks)
- **API Integration**: 
  - Centralized API client using Axios
  - API proxy configuration via `src/proxy.ts`
- **Real-time**: Socket.io connection for live kitchen orders and table status

#### Backend Architecture
- **Pattern**: Feature-based modular architecture
- **Directory Structure**:
  - `/src/app.ts` - Express app setup
  - `/src/index.ts` - Entry point
  - `/src/features` - Feature modules (auth, menu, orders, etc.)
  - `/src/routes` - API route definitions
  - `/src/config` - Configuration files
  - `/src/shared` - Shared utilities, middleware, types
  - `/src/utils` - Helper functions
  - `/src/jobs` - Scheduled tasks (cron jobs)
  - `/src/cli` - CLI tools
  - `/prisma` - Database schema and migrations
- **API Design**:
  - RESTful endpoints
  - Versioned API (v1)
  - Consistent response format
  - Swagger documentation at `/api-docs`
- **Security**:
  - JWT-based authentication with refresh tokens
  - Role-based access control (RBAC) with 5 roles: admin, manager, waiter, chef, cashier
  - Helmet for HTTP headers security
  - Rate limiting on API endpoints
  - CORS configured for client URL
- **Error Handling**: Centralized error middleware with Winston logging

### Testing Strategy
- **Current Status**: Test infrastructure ready (Jest referenced in package.json)
- **Recommended Approach**:
  - **Unit Tests**: Jest for business logic and utilities
  - **Integration Tests**: Supertest for API endpoints
  - **E2E Tests**: Playwright or Cypress for critical user flows
  - **Coverage**: Target 80%+ for core business logic
- **Test Organization**: Co-locate tests with source files using `.test.ts` or `.spec.ts` extension

### Git Workflow
- **Branching Strategy**: (Inferred best practices)
  - `main` - Production-ready code
  - `develop` - Integration branch for features
  - `feature/*` - New features
  - `bugfix/*` - Bug fixes
  - `hotfix/*` - Production hotfixes
- **Commit Conventions**: Use conventional commits
  - `feat:` - New feature
  - `fix:` - Bug fix
  - `docs:` - Documentation changes
  - `refactor:` - Code refactoring
  - `style:` - Formatting changes
  - `test:` - Adding/updating tests
  - `chore:` - Maintenance tasks

## Domain Context

### Restaurant Business Domain
This system manages a full-service restaurant with:

**Core Entities**:
- **Users/Staff**: admin, manager, waiter, chef, cashier with RBAC
- **Menu**: Categories (appetizers, mains, desserts, drinks) and food items
- **Tables**: Table management with statuses (available, occupied, reserved, maintenance)
- **Reservations**: Online table booking system
- **Orders**: Order lifecycle (pending → confirmed → preparing → ready → served/cancelled)
- **Kitchen**: Real-time kitchen display for order preparation
- **Billing**: Payment processing (cash, card, mobile, voucher)
- **Inventory**: Stock management and ingredient tracking

**Business Rules**:
- Orders linked to tables and bills
- Real-time updates for kitchen staff via WebSocket
- Multi-language support for diverse staff and customers
- Role-based permissions for different operations
- Reservation system prevents double-booking
- Inventory tracking for food preparation

**Key Workflows**: Detailed in `/docs/use_case/` directory:
1. Authentication & User Management
2. Menu Management
3. Reservation Management  
4. Order Management
5. Bill & Payment Management
6. Staff Management
7. Inventory Management
8. Food Import Management

### Database Schema
- **ORM**: Prisma with PostgreSQL 16
- **Schema Location**: `/app/server/prisma/schema.prisma`
- **Key Tables**: User, Category, FoodItem, Table, Reservation, Order, OrderItem, Bill, Payment, Inventory, Ingredient
- **Enums**: Role, TableStatus, OrderStatus, PaymentStatus, PaymentMethod, ReservationStatus, etc.
- **Documentation**: `/docs/DATABASE.md` with full ERD and relationships

## Important Constraints

### Technical Constraints
- **Node.js**: Version 20+ required
- **Docker**: Engine 20.10+, Compose V2+ required
- **RAM**: Minimum 4GB for Docker deployment
- **Database**: PostgreSQL 16 only (not compatible with older versions)
- **Platform**: 
  - Windows development requires special handling for Next.js standalone output (EPERM symlink issues)
  - Production builds use standalone output on Linux/Docker only
- **Image Optimization**: Disabled in production Docker builds (unoptimized: true)

### Business Constraints
- **Multi-tenancy**: Currently single-restaurant (can be extended)
- **Currency**: Not specified (implement as needed)
- **Time Zone**: Handle restaurant local time for reservations and orders
- **Language**: Support for English and Vietnamese (extensible)

### Security Constraints
- **JWT Secrets**: Must be 32+ characters
- **Password Hashing**: bcryptjs with salt rounds
- **HTTPS**: Required for production deployment
- **CORS**: Restricted to configured client URL
- **Rate Limiting**: Enabled on all API endpoints
- **File Uploads**: Validated and size-limited (via Multer)

### Development Constraints
- **Package Manager**: Must use `pnpm` (pnpm-workspace.yaml present)
- **TypeScript**: Strict mode enabled, no implicit any
- **Code Organization**: Feature-based, not by file type
- **Environment Variables**: Required for all secrets (JWT, DB, Redis, R2, Cloudinary)

## External Dependencies

### Third-Party Services
- **Cloudflare R2**: Object storage for file uploads (images, documents, videos)
  - Configuration required: Account ID, bucket name, access key ID, secret access key, public URL
  - S3-compatible API via AWS SDK
  - Primary storage provider for production
- **Cloudinary** (Legacy): Image storage for backward compatibility
  - Configuration required: API key, secret, cloud name
  - Deprecated - use R2 for new uploads

### Infrastructure Services
- **PostgreSQL 16**: Primary database
  - Connection string format: `postgresql://user:password@host:port/database?schema=public`
  - Requires health checks in Docker
  - Default port: 5432

- **Redis 7**: Caching and session storage
  - URL format: `redis://host:port`
  - Used for session management and performance optimization
  - Default port: 6379

### APIs & Integrations
- **Socket.io**: Real-time bidirectional communication
  - Used for kitchen display updates
  - Used for table status changes
  - Client connects to `NEXT_PUBLIC_SOCKET_URL`

- **Swagger UI**: API documentation
  - Available at `/api-docs` endpoint
  - Auto-generated from JSDoc comments

### Development Dependencies
- **Prisma Studio**: Database GUI (via `prisma studio` command)
- **Docker Desktop**: Required for local development with containers
- **Nginx**: Optional reverse proxy (--profile nginx)

### File Storage
- **Local Development**: Files stored in `/app/server/uploads/`
- **Production**: Cloudflare R2 for persistent storage (Cloudinary legacy)
- **Documentation**: See `/docs/FILE_STORAGE_GUIDE.md`

### Monitoring & Logging
- **Winston**: Application logging to `/app/server/logs/`
- **Morgan**: HTTP request logging
- **Health Check**: Available at `/health` endpoint
