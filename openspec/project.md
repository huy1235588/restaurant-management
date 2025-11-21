# Project Context

## Purpose
Đồ án tốt nghiệp cá nhân: Hệ thống quản lý nhà hàng full-stack được thiết kế để tối ưu hóa các hoạt động nhà hàng bao gồm:
- Quản lý đặt món với màn hình bếp thời gian thực
- Quản lý đặt bàn và theo dõi trạng thái bàn
- Quản lý thực đơn và kho hàng
- Quản lý nhân viên với phân quyền dựa trên vai trò
- Xử lý thanh toán và hóa đơn
- Cập nhật thời gian thực qua WebSocket
- Hỗ trợ đa ngôn ngữ (EN/VI)

**Người dùng mục tiêu**: Chủ nhà hàng, quản lý, nhân viên phục vụ, nhân viên bếp, và thu ngân.

**Loại dự án**: Đồ án tốt nghiệp cá nhân - mục tiêu là minh họa kiến thức và kỹ năng phát triển phần mềm, không phải sản phẩm thương mại.

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
- **Pattern**: Feature-based module architecture with App Router (Next.js 16)
- **Directory Structure**:
  - `/src/app` - Next.js App Router pages and layouts
  - `/src/modules` - **Feature modules** (menu, categories, reservations, tables)
    - Each module contains: components, views, dialogs, services, hooks, types, utils
    - Standardized structure for consistency and maintainability
    - Colocated feature code for better organization
  - `/src/components` - Shared components only
    - `shared/` - Truly shared components (LoadingSpinner, EmptyState, etc.)
    - `ui/` - Radix UI primitives (Button, Dialog, Input, etc.)
    - `layouts/` - Layout components (Sidebar, TopBar, etc.)
    - `providers/` - Context providers (Auth, Theme, etc.)
  - `/src/contexts` - React Context providers (deprecated, moved to components/providers)
  - `/src/hooks` - Custom React hooks (global hooks only, feature hooks in modules)
  - `/locales` - i18n translation files (en.json, vi.json)
  - `/public` - Static assets (images, videos)
- **Module Structure Convention**: All feature modules follow the same pattern:
  ```
  modules/[feature]/
  ├── components/    # Reusable UI components
  ├── views/         # Page-level views
  ├── dialogs/       # Modal dialogs (single/bulk operations)
  ├── services/      # API calls
  ├── hooks/         # Custom hooks
  ├── types/         # TypeScript types
  ├── utils/         # Helper functions
  ├── README.md      # Module documentation
  └── index.ts       # Barrel exports
  ```
- **Reference Modules**:
  - `menu/` - Complete implementation with all features
  - `categories/` - Simple, clean structure example
  - `reservations/` - Good hooks and services patterns
  - `tables/` - Complex module with visual editor integration
- **State Management**: 
  - Local state: React hooks (useState, useReducer)
  - Global state: Zustand stores (e.g., tables module uses editorStore, layoutStore, historyStore)
  - Server state: React Query or SWR patterns (via hooks)
- **API Integration**: 
  - Feature-specific services in modules (e.g., `modules/menu/services/menu.service.ts`)
  - Shared services in `src/services/` (auth, upload, bill, supplier)
  - Centralized Axios client in `src/lib/axios.ts`
  - API proxy configuration via `src/proxy.ts`
- **Real-time**: Socket.io connection for live kitchen orders and table status
- **Import Pattern**: 
  ```typescript
  // Module-level imports (recommended)
  import { MenuItemCard } from '@/modules/menu';
  import { menuApi } from '@/modules/menu/services';
  
  // Shared component imports
  import { LoadingSpinner } from '@/components/shared';
  import { Button } from '@/components/ui/button';
  ```

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
- **Phạm vi**: Đồ án tốt nghiệp - testing cơ bản thông qua manual testing và demonstration
- **Không bao gồm**: 
  - Automated unit tests
  - Integration tests
  - E2E tests
  - CI/CD pipelines
  - Test coverage metrics
- **Focus**: Chức năng hoạt động đúng và demo được các use case chính

### Git Workflow
- **Phạm vi**: Đồ án cá nhân - quy trình Git đơn giản
- **Branching Strategy**: 
  - `main` - Code chính của dự án
  - `feature/*` - Phát triển tính năng mới (nếu cần)
- **Commit Conventions**: Conventional commits (không bắt buộc nghiêm ngặt)
  - `feat:` - Tính năng mới
  - `fix:` - Sửa lỗi
  - `docs:` - Cập nhật tài liệu
  - `refactor:` - Tái cấu trúc code
  - `chore:` - Công việc bảo trì

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
- **Docker**: Sử dụng cho môi trường development local (không deploy production)
- **RAM**: Minimum 4GB cho Docker local
- **Database**: PostgreSQL 16
- **Platform**: 
  - Development trên Windows với Next.js dev server
  - Không có production deployment
  - Không có CI/CD pipeline

### Business Constraints
- **Multi-tenancy**: Single-restaurant (đồ án demo)
- **Currency**: VND (Vietnamese Dong) - đơn giản hóa cho demo
- **Time Zone**: Vietnam local time
- **Language**: Hỗ trợ tiếng Anh và tiếng Việt

### Security Constraints (Demo Level)
- **JWT Secrets**: Basic implementation cho authentication demo
- **Password Hashing**: bcryptjs cơ bản
- **HTTPS**: Không bắt buộc (development only)
- **CORS**: Cấu hình cho localhost development
- **Rate Limiting**: Có nhưng không nghiêm ngặt
- **File Uploads**: Validation cơ bản

### Development Constraints
- **Package Manager**: Sử dụng `pnpm`
- **TypeScript**: Strict mode enabled
- **Code Organization**: Feature-based architecture
- **Environment Variables**: Cấu hình cho development local
- **Deployment**: Không có production deployment plan
- **Monitoring**: Không có monitoring/logging phức tạp cho production
- **Performance**: Tối ưu cơ bản, không cần high-scale performance tuning

## External Dependencies

### Third-Party Services
- **Cloudflare R2**: Object storage for file uploads (images, documents, videos)
  - Configuration required: Account ID, bucket name, access key ID, secret access key, public URL
  - S3-compatible API via AWS SDK
  - Primary storage provider for production
- **Cloudinary** (Legacy): Image storage for backward compatibility
  - Configuration required: API key, secret, cloud name
  - Deprecated - use R2 for new uploads

### Infrastructure Services (Development)
- **PostgreSQL 16**: Primary database cho development
  - Connection string format: `postgresql://user:password@host:port/database?schema=public`
  - Chạy trong Docker container local
  - Default port: 5432

- **Redis 7**: Caching cơ bản cho session
  - URL format: `redis://host:port`
  - Session management đơn giản
  - Chạy trong Docker container local
  - Default port: 6379
  - **Lưu ý**: Không có Redis clustering hay high-availability setup

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

### File Storage (Simplified)
- **Development**: Files stored in `/app/server/uploads/` cho local development
- **Cloud Storage**: Cloudflare R2 hoặc Cloudinary cho demo upload cloud
- **Lưu ý**: Không có CDN setup, backup strategy, hay disaster recovery plan
- **Documentation**: See `/docs/FILE_STORAGE_GUIDE.md`

### Logging (Development Only)
- **Winston**: Application logging cơ bản đến `/app/server/logs/` cho debug
- **Morgan**: HTTP request logging trong development
- **Health Check**: Endpoint `/health` đơn giản để kiểm tra server
- **Không bao gồm**: Production monitoring, alerting, performance tracking, APM tools
