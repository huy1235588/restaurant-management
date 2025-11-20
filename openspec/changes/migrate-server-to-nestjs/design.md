# NestJS Migration Design

## Context

The current backend is built with Express 5.1 and follows a feature-based modular architecture with manual dependency management. The system handles 13 feature domains (auth, orders, bills, categories, menu, tables, floor-plans, reservations, kitchen, staff, payments, storage, customers) with shared utilities, middleware, and services.

**Current Architecture Characteristics:**
- Manual class instantiation and singleton patterns
- Express middleware for auth/validation/error handling
- Zod schemas for request validation
- Manual route registration
- Prisma ORM with manual connection management
- Socket.io for real-time kitchen orders
- Swagger documentation via JSDoc comments
- Winston logger with Morgan for HTTP logging
- node-cron for scheduled tasks (token cleanup, file cleanup)
- Multer for file uploads with Cloudflare R2 integration

**Constraints:**
- Must maintain all API contracts (endpoints, request/response formats)
- Cannot break compatibility with existing Next.js client and Tauri desktop app
- Database schema must remain unchanged
- Development environment uses Docker
- Single-tenant demo project (no multi-tenancy requirements)

**Stakeholders:**
- Developer (thesis project owner)
- Academic reviewers (thesis evaluation)
- End users (demo purposes only)

## Goals / Non-Goals

### Goals
- Adopt industry-standard NestJS framework with built-in DI container
- Implement proper architectural patterns (Guards, Interceptors, Pipes, Filters)
- Improve code organization with NestJS module system
- Enhance testability with built-in testing utilities (though tests are not implemented for this thesis)
- Demonstrate knowledge of modern Node.js backend frameworks for academic evaluation
- Maintain 100% API compatibility with existing clients
- Preserve all existing business logic and database operations

### Non-Goals
- Adding new features or changing API behavior
- Implementing automated tests (out of scope for thesis project)
- Performance optimization or benchmarking Express vs NestJS
- Implementing GraphQL or microservices architecture
- Adding authentication strategies beyond JWT (e.g., OAuth, SAML)
- Multi-tenancy or advanced security features beyond current implementation
- Production deployment or scalability concerns (development demo only)

## Decisions

### Decision 1: NestJS Framework Version
**Choice**: NestJS 10.x (latest stable)

**Rationale**:
- Supports Node.js 20+ (current project requirement)
- Mature ecosystem with extensive documentation
- TypeScript 5+ compatibility
- Active community and regular updates
- Built-in support for all required integrations (Prisma, Socket.io, Swagger, etc.)

**Alternatives Considered**:
- Stay with Express: Lacks architectural patterns and DI; doesn't demonstrate modern framework knowledge
- Fastify: Less mature ecosystem; fewer learning resources for academic demonstration

### Decision 2: Module Structure
**Choice**: Feature-based modules mirroring current structure

**Architecture**:
```
app/server/src/
├── main.ts                    # Bootstrap application
├── app.module.ts              # Root module
├── common/                    # Shared cross-cutting concerns
│   ├── guards/               # Auth, role guards
│   ├── interceptors/         # Logging, transform interceptors
│   ├── filters/              # Exception filters
│   ├── pipes/                # Validation pipes
│   ├── decorators/           # Custom decorators (@CurrentUser, @Roles, etc.)
│   └── constants/            # Application constants
├── config/                   # Configuration module
│   ├── config.module.ts
│   └── configuration.ts      # Environment config
├── database/                 # Prisma module
│   ├── database.module.ts
│   └── prisma.service.ts
├── modules/                  # Feature modules
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/       # JWT strategy
│   │   └── dto/              # Login, register, etc.
│   ├── orders/
│   ├── bills/
│   ├── menu/
│   ├── tables/
│   ├── reservations/
│   ├── kitchen/
│   ├── staff/
│   ├── payments/
│   ├── storage/
│   ├── floor-plan/
│   └── customers/
└── shared/                   # Shared business logic
    ├── types/
    └── utils/
```

**Rationale**:
- Maintains familiarity with current codebase structure
- Clear separation of concerns (common vs modules vs shared)
- Aligns with NestJS best practices
- Easy to navigate for academic reviewers

**Alternatives Considered**:
- Monolithic app.module with all controllers/services: Poor organization; doesn't demonstrate modular design
- Domain-driven design (DDD) layers: Overcomplicated for thesis scope; too much refactoring

### Decision 3: Validation Strategy
**Choice**: Migrate Zod schemas to class-validator DTOs

**Implementation**:
```typescript
// Before (Zod):
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// After (class-validator):
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

**Rationale**:
- Native NestJS integration with ValidationPipe
- Better TypeScript inference and IDE support
- Decorator-based approach aligns with NestJS philosophy
- Automatic Swagger schema generation via @nestjs/swagger

**Alternatives Considered**:
- Keep Zod with custom pipe: Extra complexity; loses NestJS ecosystem benefits
- Joi: Less TypeScript-friendly than class-validator

### Decision 4: Authentication & Authorization
**Choice**: NestJS Guards with Passport JWT Strategy

**Implementation**:
- `JwtAuthGuard` replaces `authenticate` middleware
- `RolesGuard` replaces `authorize()` middleware
- `@CurrentUser()` decorator for extracting user from request
- `@Roles(...roles)` decorator for role-based access
- JWT configuration via @nestjs/jwt module

**Rationale**:
- Standard NestJS pattern for authentication
- Passport integration is well-documented
- Guards provide better composability than middleware
- Declarative role-based access control

**Alternatives Considered**:
- Custom middleware: Not idiomatic NestJS; loses Guard benefits
- CASL for authorization: Overkill for simple role-based access

### Decision 5: Error Handling
**Choice**: Global Exception Filter with custom error classes

**Implementation**:
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Map custom errors (UnauthorizedError, ValidationError, etc.) to HTTP exceptions
    // Log errors with NestJS Logger
    // Return consistent error response format
  }
}
```

**Rationale**:
- Centralized error handling (replaces errorHandler middleware)
- NestJS built-in HTTP exceptions
- Consistent error response format maintained

**Alternatives Considered**:
- Per-route try-catch: Repetitive; doesn't demonstrate framework patterns
- Keep Express error middleware: Not compatible with NestJS

### Decision 6: Swagger Documentation
**Choice**: @nestjs/swagger with decorator-based documentation

**Implementation**:
```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(@Body() loginDto: LoginDto) { }
}
```

**Rationale**:
- Auto-generates OpenAPI spec from decorators
- No manual JSDoc comments required
- DTO classes automatically generate request/response schemas
- Better maintainability than swagger-jsdoc

**Alternatives Considered**:
- Keep swagger-jsdoc: Incompatible with NestJS; manual maintenance burden

### Decision 7: Socket.io Integration
**Choice**: @nestjs/platform-socket.io with Gateway pattern

**Implementation**:
```typescript
@WebSocketGateway({ cors: true })
export class KitchenGateway {
  @WebSocketServer()
  server: Server;

  notifyNewOrder(order: Order) {
    this.server.emit('new-order', order);
  }
}
```

**Rationale**:
- Native NestJS integration for WebSocket
- Dependency injection for gateways
- Event-driven architecture
- Maintains current Socket.io functionality

**Alternatives Considered**:
- Manual Socket.io setup: Not idiomatic NestJS; loses DI benefits

### Decision 8: Prisma Integration
**Choice**: PrismaService as global module

**Implementation**:
```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
```

**Rationale**:
- Standard NestJS pattern for Prisma integration
- Automatic connection lifecycle management
- Global availability without repeated imports
- Type-safe database access

**Alternatives Considered**:
- Keep DatabaseClient singleton: Not compatible with NestJS DI

### Decision 9: Configuration Management
**Choice**: @nestjs/config with typed configuration

**Implementation**:
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().required(),
        PORT: Joi.number().default(8000),
        // ... other env vars
      }),
    }),
  ],
})
```

**Rationale**:
- Type-safe access to environment variables
- Validation at startup
- Global availability
- Better than manual dotenv loading

**Alternatives Considered**:
- Manual config object: Loses validation and type safety

### Decision 10: Logging
**Choice**: NestJS built-in Logger with Winston transport (optional)

**Implementation**:
```typescript
// Use built-in logger for simplicity
@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  someMethod() {
    this.logger.log('Doing something');
    this.logger.error('Error occurred', error.stack);
  }
}
```

**Rationale**:
- Built-in NestJS logger sufficient for thesis demo
- Context-aware logging (class name)
- Can integrate Winston if needed via custom logger
- Simpler than maintaining separate Winston config

**Alternatives Considered**:
- Full Winston integration: Adds complexity for minimal benefit in demo project

### Decision 11: Scheduled Tasks
**Choice**: @nestjs/schedule with cron decorators

**Implementation**:
```typescript
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('0 0 * * *') // Daily at midnight
  async cleanupExpiredTokens() {
    this.logger.log('Running token cleanup');
    // ... cleanup logic
  }
}
```

**Rationale**:
- Declarative cron syntax
- Built-in NestJS module
- Better than manual node-cron setup
- Automatic job registration

**Alternatives Considered**:
- Keep node-cron: Not idiomatic NestJS; manual registration

### Decision 12: File Upload
**Choice**: @nestjs/platform-express with Multer interceptor

**Implementation**:
```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // Upload to Cloudflare R2
}
```

**Rationale**:
- Built-in Multer integration
- Decorator-based file handling
- Maintains Cloudflare R2 and Cloudinary support
- Stream-based upload preserved

**Alternatives Considered**:
- Manual Multer setup: Not idiomatic NestJS

## Risks / Trade-offs

### Risk 1: Learning Curve
**Description**: Developer may need time to understand NestJS patterns and decorators

**Mitigation**:
- Refer to official NestJS documentation and examples
- Migrate one module at a time with testing at each step
- Preserve server-old directory as reference

**Impact**: Medium (time investment for learning)

### Risk 2: Migration Bugs
**Description**: Subtle behavior differences between Express middleware and NestJS guards/interceptors

**Mitigation**:
- Maintain API contract testing via Swagger/Postman
- Incremental migration with validation after each module
- Run manual smoke tests on all endpoints

**Impact**: Medium (fixable with thorough testing)

### Risk 3: Dependency Version Conflicts
**Description**: NestJS dependencies may conflict with existing packages (e.g., Prisma, Socket.io versions)

**Mitigation**:
- Review NestJS compatibility matrix before migration
- Use pnpm for strict dependency resolution
- Create new package.json from scratch

**Impact**: Low (manageable via version pinning)

### Risk 4: Docker Build Changes
**Description**: NestJS build process differs from current ts-node-dev setup

**Mitigation**:
- Update Dockerfile with proper NestJS build steps (npm run build)
- Test Docker builds locally before updating docker-compose
- Document new build process

**Impact**: Low (one-time Docker configuration)

### Trade-off 1: Code Volume
**Addition**: Boilerplate for modules, decorators, DTOs
**Benefit**: Better organization, type safety, maintainability

### Trade-off 2: Framework Lock-in
**Addition**: Tight coupling to NestJS ecosystem
**Benefit**: Access to mature ecosystem, best practices, and patterns for thesis demonstration

### Trade-off 3: Build Step Required
**Addition**: Must run `npm run build` for production (vs direct ts-node)
**Benefit**: Optimized production bundle, proper compilation checks

## Migration Plan

### Phase 1: Project Setup (Estimated: 2-4 hours)
1. Create `/app/server/` directory
2. Initialize NestJS project: `nest new server --package-manager pnpm`
3. Install dependencies: Prisma, Socket.io, Swagger, class-validator, Passport, etc.
4. Copy Prisma schema and generate client
5. Setup ConfigModule with environment variables
6. Create PrismaService and DatabaseModule
7. Setup global exception filter
8. Configure Swagger module

### Phase 2: Core Infrastructure (Estimated: 3-5 hours)
1. Create common guards (JwtAuthGuard, RolesGuard)
2. Implement JWT strategy with Passport
3. Create custom decorators (@CurrentUser, @Roles, @Public)
4. Setup validation pipe globally
5. Create exception filter for custom errors
6. Setup NestJS Logger
7. Configure CORS, Helmet, Rate Limiting

### Phase 3: Feature Migration (Estimated: 15-20 hours)
Migrate modules in dependency order:

**Priority 1: Foundation**
1. Auth module (login, register, refresh token, change password)
2. Staff module (depends on auth)

**Priority 2: Content Management**
3. Category module
4. Menu module (depends on category)
5. Storage module (file uploads)

**Priority 3: Operations**
6. Table module
7. Floor-plan module (depends on table)
8. Reservation module (depends on table)
9. Customer module

**Priority 4: Order Flow**
10. Order module (depends on table, menu, staff)
11. Kitchen module (depends on order, Socket.io gateway)
12. Bill module (depends on order)
13. Payment module (depends on bill)

**For each module:**
- Create module, controller, service files
- Convert Zod schemas to class-validator DTOs
- Migrate route handlers to controller methods with decorators
- Apply guards and decorators for auth/authorization
- Migrate business logic (preserve as-is)
- Add Swagger decorators
- Test endpoints manually

### Phase 4: Real-time & Jobs (Estimated: 2-3 hours)
1. Implement KitchenGateway with @nestjs/platform-socket.io
2. Migrate Socket.io events (new-order, update-order, etc.)
3. Migrate cron jobs using @nestjs/schedule
4. Test WebSocket connections
5. Verify scheduled tasks run correctly

### Phase 5: Docker & Documentation (Estimated: 2-3 hours)
1. Update Dockerfile for NestJS build process
2. Update docker-compose.yml to use new server
3. Update entrypoint.sh if needed
4. Test Docker build and run
5. Update `/docs/technical/` documentation
6. Create migration guide

### Phase 6: Validation & Cleanup (Estimated: 3-4 hours)
1. Run smoke tests on all endpoints
2. Verify authentication and authorization
3. Test file uploads
4. Test WebSocket functionality
5. Check database operations
6. Verify environment variables work
7. Archive `/app/server-old/` directory

### Total Estimated Time: 27-39 hours

### Rollback Strategy
If critical issues arise:
1. Revert docker-compose.yml to point back to `/app/server-old/`
2. Rebuild containers with original setup
3. Investigate issues in `/app/server/` without affecting running system
4. Fix issues and re-test before re-attempting migration

### Success Criteria
- All API endpoints respond with same contracts
- Authentication and authorization work correctly
- WebSocket events trigger as expected
- File uploads work with Cloudflare R2
- Database operations execute without errors
- Docker containers build and run successfully
- Swagger documentation generates correctly
- Cron jobs execute on schedule
- No client-side changes required

## Open Questions

1. **Should we implement automated tests during migration?**
   - **Answer**: No, tests are out of scope for this thesis project. Manual testing via Swagger/Postman is sufficient for demonstration purposes.

2. **Should we upgrade Prisma version during migration?**
   - **Answer**: Keep Prisma 6.18.0 (current version) to avoid schema compatibility issues. Focus on framework migration only.

3. **Should we implement health check improvements?**
   - **Answer**: Maintain current health check logic. NestJS Terminus module is optional and not required for demo.

4. **Should we refactor business logic while migrating?**
   - **Answer**: No. Preserve all business logic as-is. Only migrate the framework layer. Refactoring is a separate concern.

5. **Should we implement request/response interceptors for logging?**
   - **Answer**: Optional. Can add LoggingInterceptor if time permits, but not critical for thesis demonstration.
