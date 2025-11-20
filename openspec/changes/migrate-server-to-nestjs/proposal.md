# Migrate Server to NestJS

## Why

The current Express-based backend lacks standardization, built-in dependency injection, and architectural patterns that scale with growing complexity. NestJS provides a robust, opinionated framework with TypeScript-first design, built-in testing utilities, modular architecture, and enterprise-grade patterns (Guards, Interceptors, Pipes) that align with the project's academic goals of demonstrating best practices.

## What Changes

- Replace Express framework with NestJS framework while maintaining all existing API contracts
- Migrate feature modules (auth, orders, bills, menu, tables, reservations, kitchen, staff, payments, storage, floor-plan, customers) to NestJS modules with proper dependency injection
- Convert Express middleware (authentication, authorization, error handling, validation) to NestJS Guards, Interceptors, and Pipes
- Migrate Zod validation schemas to class-validator/class-transformer DTOs with ValidationPipe
- Replace manual route definitions with NestJS decorators (@Controller, @Get, @Post, etc.)
- Convert service classes to NestJS providers with proper DI container registration
- Migrate Swagger setup from swagger-jsdoc/swagger-ui-express to @nestjs/swagger with decorators
- Replace Socket.io manual initialization with @nestjs/platform-socket.io module
- Migrate Prisma integration to NestJS PrismaService pattern with proper module scoping
- Convert manual error handling to NestJS exception filters
- Migrate configuration from manual dotenv to @nestjs/config ConfigModule
- Replace Winston logging with NestJS built-in Logger or integrate with @nestjs/logger
- Convert cron jobs from node-cron to @nestjs/schedule decorators
- Update Docker configuration for NestJS build process and runtime
- Preserve all existing business logic, database schema, and API behavior

## Impact

### Affected Specs
- `backend-framework` (new spec) - Core NestJS architecture and patterns
- `authentication` (to be created) - Auth guards and JWT strategy
- `api-routes` (to be created) - RESTful API structure
- `real-time-communication` (to be created) - Socket.io integration
- `database-access` (to be created) - Prisma service pattern
- `file-storage` (to be created) - Multer integration with NestJS
- `validation` (to be created) - DTO validation with class-validator
- `error-handling` (to be created) - Exception filters
- `logging` (to be created) - NestJS Logger integration
- `scheduled-tasks` (to be created) - Cron jobs with @nestjs/schedule

### Affected Code
- **New directory**: `/app/server/` - Complete NestJS application
- **Preserved**: `/app/server-old/` - Original Express codebase for reference
- **Modified**: `/docker-compose.yml`, `/docker-compose.dev.yml`, `/docker-compose.prod.yml` - Update server build and runtime
- **Modified**: `/Dockerfile`, `/Dockerfile.dev` (server) - Update for NestJS build process
- **Modified**: `/docs/technical/` - Update backend documentation
- **New**: `/app/server/src/main.ts` - NestJS bootstrap
- **New**: `/app/server/src/app.module.ts` - Root application module
- **New**: `/app/server/src/modules/` - Feature modules (auth, orders, menu, etc.)
- **New**: `/app/server/src/common/` - Shared guards, interceptors, filters, decorators
- **Preserved**: `/app/server-old/prisma/` - Copy to `/app/server/prisma/` with identical schema

### Breaking Changes
- **NONE** - All API endpoints, request/response formats, and authentication mechanisms remain identical
- Internal server architecture changes only; client and desktop apps are not affected

### Migration Strategy
1. Create new `/app/server/` directory alongside existing `/app/server-old/`
2. Scaffold NestJS project with proper module structure
3. Migrate features incrementally: auth → menu → orders → tables → reservations → kitchen → staff → bills → payments → storage → floor-plan → customers
4. Copy Prisma schema and run migrations in new server
5. Test each module thoroughly before proceeding
6. Update Docker configuration to point to new server
7. Run smoke tests to verify all endpoints
8. Archive `/app/server-old/` as reference after successful migration
