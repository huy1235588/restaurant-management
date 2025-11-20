# Implementation Tasks

## 1. Project Setup & Infrastructure
- [x] 1.1 Create `/app/server/` directory for new NestJS application
- [x] 1.2 Initialize NestJS project: `nest new server --package-manager pnpm --skip-git`
- [x] 1.3 Install core dependencies: `@nestjs/config`, `@nestjs/swagger`, `@nestjs/passport`, `@nestjs/jwt`, `@nestjs/platform-socket.io`, `@nestjs/schedule`, `class-validator`, `class-transformer`, `passport`, `passport-jwt`, `@prisma/client`
- [x] 1.4 Install additional dependencies: `bcryptjs`, `@types/bcryptjs`, `cookie-parser`, `@types/cookie-parser`, `helmet`, `compression`, `@types/multer`, `@aws-sdk/client-s3`, `cloudinary`, `date-fns`, `nodemailer`, `@types/nodemailer`
- [x] 1.5 Copy Prisma schema from `/app/server-old/prisma/` to `/app/server/prisma/`
- [x] 1.6 Run `npx prisma generate` to generate Prisma Client
- [x] 1.7 Create `.env` file with all required environment variables (copy from server-old)
- [x] 1.8 Configure `tsconfig.json` with path aliases (`@/*` for `src/*`)
- [x] 1.9 Setup `nest-cli.json` with path mappings

## 2. Configuration Module
- [x] 2.1 Create `src/config/configuration.ts` with typed configuration interface
- [x] 2.2 Setup `ConfigModule.forRoot()` in `app.module.ts` with global scope
- [x] 2.3 Define environment variable validation schema (optional but recommended)
- [x] 2.4 Export configuration service for typed access to env vars

## 3. Database Module
- [x] 3.1 Create `src/database/prisma.service.ts` extending PrismaClient
- [x] 3.2 Implement `onModuleInit()` for $connect lifecycle
- [x] 3.3 Implement `onModuleDestroy()` for $disconnect lifecycle
- [x] 3.4 Create `src/database/database.module.ts` as @Global() module
- [x] 3.5 Export PrismaService for dependency injection

## 4. Common Layer - Guards
- [x] 4.1 Create `src/common/guards/jwt-auth.guard.ts` using Passport
- [x] 4.2 Create `src/common/guards/roles.guard.ts` for role-based authorization
- [x] 4.3 Implement `@Public()` decorator to bypass authentication
- [x] 4.4 Implement `@Roles(...roles)` decorator for role checking

## 5. Common Layer - Decorators
- [x] 5.1 Create `src/common/decorators/current-user.decorator.ts` to extract user from request
- [x] 5.2 Create `src/common/decorators/public.decorator.ts` for @Public()
- [x] 5.3 Create `src/common/decorators/roles.decorator.ts` for @Roles()

## 6. Common Layer - Filters
- [x] 6.1 Create custom error classes in `src/common/errors/` (UnauthorizedError, ForbiddenError, NotFoundError, ValidationError, ConflictError)
- [x] 6.2 Create `src/common/filters/all-exceptions.filter.ts` to catch and format errors
- [x] 6.3 Register exception filter globally in `main.ts`

## 7. Common Layer - Pipes
- [x] 7.1 Setup global ValidationPipe in `main.ts` with transform options
- [x] 7.2 Configure ValidationPipe to use class-validator decorators

## 8. Common Layer - Interceptors
- [ ] 8.1 Create `src/common/interceptors/logging.interceptor.ts` for HTTP request logging (optional)
- [ ] 8.2 Create `src/common/interceptors/transform.interceptor.ts` for response wrapping (optional)

## 9. Main Bootstrap
- [x] 9.1 Configure `main.ts` with global prefix `/api/v1`
- [x] 9.2 Enable CORS with credentials support
- [x] 9.3 Setup Helmet middleware for security headers
- [x] 9.4 Setup compression middleware
- [x] 9.5 Setup cookie-parser middleware
- [x] 9.6 Setup rate limiting (ThrottlerModule)
- [x] 9.7 Configure Swagger documentation with `SwaggerModule.setup('/api-docs')`
- [x] 9.8 Setup graceful shutdown hooks
- [ ] 9.9 Configure static file serving for `/uploads` directory

## 10. Auth Module
- [ ] 10.1 Create `src/modules/auth/auth.module.ts` with imports (JwtModule, PassportModule)
- [ ] 10.2 Create `src/modules/auth/auth.controller.ts` with routes: POST /login, POST /register, POST /refresh-token, POST /logout, POST /change-password
- [ ] 10.3 Create `src/modules/auth/auth.service.ts` with business logic
- [ ] 10.4 Create `src/modules/auth/strategies/jwt.strategy.ts` for Passport JWT
- [ ] 10.5 Create DTOs: `login.dto.ts`, `register.dto.ts`, `refresh-token.dto.ts`, `change-password.dto.ts`
- [ ] 10.6 Create `src/modules/auth/auth.repository.ts` for refresh token operations
- [ ] 10.7 Add Swagger decorators (@ApiTags, @ApiOperation, @ApiResponse)
- [ ] 10.8 Test all auth endpoints

## 11. Staff Module
- [ ] 11.1 Create `src/modules/staff/staff.module.ts`
- [ ] 11.2 Create `src/modules/staff/staff.controller.ts` with CRUD routes
- [ ] 11.3 Create `src/modules/staff/staff.service.ts` with business logic
- [ ] 11.4 Create `src/modules/staff/staff.repository.ts` extending base repository pattern
- [ ] 11.5 Create DTOs: `create-staff.dto.ts`, `update-staff.dto.ts`, `update-staff-status.dto.ts`
- [ ] 11.6 Apply @UseGuards(JwtAuthGuard, RolesGuard) and @Roles() decorators
- [ ] 11.7 Add Swagger decorators
- [ ] 11.8 Test all staff endpoints

## 12. Category Module
- [ ] 12.1 Create `src/modules/category/category.module.ts`
- [ ] 12.2 Create `src/modules/category/category.controller.ts`
- [ ] 12.3 Create `src/modules/category/category.service.ts`
- [ ] 12.4 Create DTOs: `create-category.dto.ts`, `update-category.dto.ts`
- [ ] 12.5 Apply guards and add Swagger decorators
- [ ] 12.6 Test all category endpoints

## 13. Menu Module
- [ ] 13.1 Create `src/modules/menu/menu.module.ts`
- [ ] 13.2 Create `src/modules/menu/menu.controller.ts`
- [ ] 13.3 Create `src/modules/menu/menu.service.ts`
- [ ] 13.4 Create DTOs: `create-menu-item.dto.ts`, `update-menu-item.dto.ts`
- [ ] 13.5 Apply guards and add Swagger decorators
- [ ] 13.6 Test all menu endpoints

## 14. Storage Module
- [ ] 14.1 Create `src/modules/storage/storage.module.ts`
- [ ] 14.2 Create `src/modules/storage/storage.controller.ts` with @UseInterceptors(FileInterceptor())
- [ ] 14.3 Create `src/modules/storage/storage.service.ts` with Cloudflare R2 and Cloudinary logic
- [ ] 14.4 Configure Multer for file size limits and allowed types
- [ ] 14.5 Test file upload and delete endpoints

## 15. Table Module
- [ ] 15.1 Create `src/modules/table/table.module.ts`
- [ ] 15.2 Create `src/modules/table/table.controller.ts`
- [ ] 15.3 Create `src/modules/table/table.service.ts`
- [ ] 15.4 Create `src/modules/table/table.repository.ts`
- [ ] 15.5 Create DTOs: `create-table.dto.ts`, `update-table.dto.ts`, `update-table-status.dto.ts`
- [ ] 15.6 Apply guards and add Swagger decorators
- [ ] 15.7 Test all table endpoints

## 16. Floor Plan Module
- [ ] 16.1 Create `src/modules/floor-plan/floor-plan.module.ts`
- [ ] 16.2 Create `src/modules/floor-plan/floor-plan.controller.ts`
- [ ] 16.3 Create `src/modules/floor-plan/floor-plan.service.ts`
- [ ] 16.4 Create DTOs for floor plan operations
- [ ] 16.5 Apply guards and add Swagger decorators
- [ ] 16.6 Test all floor plan endpoints

## 17. Reservation Module
- [ ] 17.1 Create `src/modules/reservation/reservation.module.ts`
- [ ] 17.2 Create `src/modules/reservation/reservation.controller.ts`
- [ ] 17.3 Create `src/modules/reservation/reservation.service.ts`
- [ ] 17.4 Create DTOs: `create-reservation.dto.ts`, `update-reservation.dto.ts`
- [ ] 17.5 Apply guards and add Swagger decorators
- [ ] 17.6 Test all reservation endpoints

## 18. Customer Module
- [ ] 18.1 Create `src/modules/customer/customer.module.ts`
- [ ] 18.2 Create `src/modules/customer/customer.controller.ts`
- [ ] 18.3 Create `src/modules/customer/customer.service.ts`
- [ ] 18.4 Create DTOs for customer operations
- [ ] 18.5 Apply guards and add Swagger decorators
- [ ] 18.6 Test all customer endpoints

## 19. Order Module
- [ ] 19.1 Create `src/modules/order/order.module.ts`
- [ ] 19.2 Create `src/modules/order/order.controller.ts`
- [ ] 19.3 Create `src/modules/order/order.service.ts`
- [ ] 19.4 Create DTOs: `create-order.dto.ts`, `update-order.dto.ts`, `update-order-status.dto.ts`
- [ ] 19.5 Apply guards and add Swagger decorators
- [ ] 19.6 Test all order endpoints

## 20. Kitchen Module & WebSocket Gateway
- [ ] 20.1 Create `src/modules/kitchen/kitchen.module.ts`
- [ ] 20.2 Create `src/modules/kitchen/kitchen.controller.ts`
- [ ] 20.3 Create `src/modules/kitchen/kitchen.service.ts`
- [ ] 20.4 Create `src/modules/kitchen/kitchen.gateway.ts` with @WebSocketGateway()
- [ ] 20.5 Implement Socket.io events: `new-order`, `update-order`, `order-completed`
- [ ] 20.6 Inject KitchenGateway into OrderService for real-time notifications
- [ ] 20.7 Test WebSocket connections and events

## 21. Bill Module
- [ ] 21.1 Create `src/modules/bill/bill.module.ts`
- [ ] 21.2 Create `src/modules/bill/bill.controller.ts`
- [ ] 21.3 Create `src/modules/bill/bill.service.ts`
- [ ] 21.4 Create DTOs: `create-bill.dto.ts`, `update-bill.dto.ts`
- [ ] 21.5 Apply guards and add Swagger decorators
- [ ] 21.6 Test all bill endpoints

## 22. Payment Module
- [ ] 22.1 Create `src/modules/payment/payment.module.ts`
- [ ] 22.2 Create `src/modules/payment/payment.controller.ts`
- [ ] 22.3 Create `src/modules/payment/payment.service.ts`
- [ ] 22.4 Create DTOs: `create-payment.dto.ts`, `update-payment.dto.ts`
- [ ] 22.5 Apply guards and add Swagger decorators
- [ ] 22.6 Test all payment endpoints

## 23. Scheduled Tasks
- [ ] 23.1 Install `@nestjs/schedule`
- [ ] 23.2 Import `ScheduleModule.forRoot()` in app.module
- [ ] 23.3 Create `src/modules/tasks/tasks.service.ts`
- [ ] 23.4 Migrate token cleanup job with @Cron() decorator
- [ ] 23.5 Migrate uploads cleanup job with @Cron() decorator
- [ ] 23.6 Register TasksService in a TasksModule
- [ ] 23.7 Verify cron jobs execute on schedule

## 24. Logging
- [ ] 24.1 Replace Winston logger with NestJS built-in Logger
- [ ] 24.2 Update all service classes to use `private readonly logger = new Logger(ClassName.name)`
- [ ] 24.3 Replace `logger.info()` with `this.logger.log()`
- [ ] 24.4 Replace `logger.error()` with `this.logger.error()`
- [ ] 24.5 Configure log levels in main.ts

## 25. Health Check
- [ ] 25.1 Create `src/modules/health/health.controller.ts`
- [ ] 25.2 Implement GET /api/v1/health endpoint with database check
- [ ] 25.3 Return uptime, timestamp, environment, and service statuses
- [ ] 25.4 Test health check endpoint

## 26. Docker Configuration
- [ ] 26.1 Update `/app/server/Dockerfile` for NestJS build process
- [ ] 26.2 Add multi-stage build: builder stage (npm run build), runtime stage (node dist/main.js)
- [ ] 26.3 Update `/app/server/Dockerfile.dev` for development with hot reload
- [ ] 26.4 Update `docker-compose.yml` to point to new server directory
- [ ] 26.5 Update `docker-compose.dev.yml` with new server paths
- [ ] 26.6 Update `docker-compose.prod.yml` with new server paths
- [ ] 26.7 Test Docker build: `docker build -f app/server/Dockerfile -t restaurant-server app/server`
- [ ] 26.8 Test docker-compose: `docker-compose -f docker-compose.dev.yml up --build`

## 27. Documentation
- [ ] 27.1 Update `/docs/technical/BACKEND_DOCUMENTATION.md` with NestJS architecture
- [ ] 27.2 Document module structure and responsibilities
- [ ] 27.3 Document authentication/authorization flow
- [ ] 27.4 Document WebSocket events
- [ ] 27.5 Create migration guide: `docs/MIGRATION_EXPRESS_TO_NESTJS.md`
- [ ] 27.6 Update README.md with new commands: `pnpm run start:dev`, `pnpm run build`, `pnpm run start:prod`

## 28. Testing & Validation
- [ ] 28.1 Test all authentication endpoints (login, register, refresh, logout, change password)
- [ ] 28.2 Test all CRUD operations for each module
- [ ] 28.3 Test role-based access control (admin, manager, waiter, chef, cashier)
- [ ] 28.4 Test file uploads to Cloudflare R2 and Cloudinary
- [ ] 28.5 Test WebSocket connections and real-time kitchen updates
- [ ] 28.6 Test database operations and Prisma queries
- [ ] 28.7 Test error handling and exception filters
- [ ] 28.8 Test Swagger documentation generation at `/api-docs`
- [ ] 28.9 Test health check endpoint
- [ ] 28.10 Verify environment variables load correctly
- [ ] 28.11 Test Docker containers start and API responds
- [ ] 28.12 Verify cron jobs execute

## 29. Cleanup & Archival
- [ ] 29.1 Move `/app/server-old/` to `/app/server-old-archived-[date]/` for reference
- [ ] 29.2 Update `/docker-compose.yml` references to remove old server
- [ ] 29.3 Remove unused dependencies from root workspace
- [ ] 29.4 Commit migration changes
- [ ] 29.5 Tag release: `v2.0.0-nestjs-migration`

## 30. Final Verification
- [ ] 30.1 Run full smoke test suite via Postman/Swagger
- [ ] 30.2 Verify Next.js client connects and works
- [ ] 30.3 Verify Tauri desktop app connects and works
- [ ] 30.4 Verify all environment variables documented
- [ ] 30.5 Confirm no breaking changes to API contracts
- [ ] 30.6 Mark proposal as complete in OpenSpec
