# Backend Framework Specification

## ADDED Requirements

### Requirement: NestJS Framework Foundation
The backend server SHALL be built using NestJS 10.x framework with TypeScript 5+ to provide standardized architectural patterns, dependency injection, and modular organization for the restaurant management system API.

#### Scenario: Application bootstraps successfully
- **GIVEN** the NestJS application is configured in `src/main.ts`
- **WHEN** the server starts
- **THEN** the application SHALL initialize all modules, connect to the database, and listen on the configured port
- **AND** the startup SHALL complete within 5 seconds under normal conditions

#### Scenario: Global configuration is available
- **GIVEN** environment variables are loaded via @nestjs/config
- **WHEN** any service or module needs configuration values
- **THEN** the configuration SHALL be accessible through dependency injection
- **AND** all required environment variables SHALL be validated at startup

### Requirement: Modular Architecture
The backend SHALL be organized into feature modules following NestJS best practices with clear separation between business domains (auth, orders, menu, tables, reservations, kitchen, staff, payments, storage, floor-plan, customers).

#### Scenario: Feature module registers dependencies
- **GIVEN** a feature module (e.g., OrderModule)
- **WHEN** the module is imported into the application
- **THEN** all controllers, services, and providers SHALL be automatically registered in the dependency injection container
- **AND** the module's dependencies SHALL be resolved and injected correctly

#### Scenario: Shared functionality is globally available
- **GIVEN** the PrismaService is marked as @Global() in DatabaseModule
- **WHEN** any feature module needs database access
- **THEN** the PrismaService SHALL be injectable without explicit module imports
- **AND** the database connection SHALL be managed centrally

### Requirement: Dependency Injection
The application SHALL use NestJS dependency injection container to manage all service instances, repositories, and utilities with proper lifecycle management and automatic resolution.

#### Scenario: Service receives injected dependencies
- **GIVEN** a service class with constructor dependencies
- **WHEN** the service is instantiated by the DI container
- **THEN** all dependencies SHALL be automatically injected
- **AND** circular dependencies SHALL be prevented or resolved via forwardRef()

#### Scenario: Singleton services are reused
- **GIVEN** a service marked as @Injectable() with default scope
- **WHEN** the service is injected into multiple consumers
- **THEN** the same instance SHALL be provided to all consumers
- **AND** the service state SHALL be shared across the application

### Requirement: Request Lifecycle Management
The application SHALL process HTTP requests through a structured pipeline including guards (authentication/authorization), interceptors (logging/transformation), pipes (validation), and exception filters (error handling).

#### Scenario: Authenticated request passes through guards
- **GIVEN** a route protected with @UseGuards(JwtAuthGuard)
- **WHEN** a request includes a valid JWT token
- **THEN** the JwtAuthGuard SHALL validate the token and attach user info to the request
- **AND** the request SHALL proceed to the route handler

#### Scenario: Unauthorized request is rejected
- **GIVEN** a route protected with @UseGuards(JwtAuthGuard)
- **WHEN** a request has no token or an invalid token
- **THEN** the JwtAuthGuard SHALL throw UnauthorizedException
- **AND** the exception filter SHALL return HTTP 401 with error details

#### Scenario: Role-based access is enforced
- **GIVEN** a route with @Roles('admin', 'manager') decorator
- **WHEN** a user with role 'waiter' attempts to access the route
- **THEN** the RolesGuard SHALL throw ForbiddenException
- **AND** the exception filter SHALL return HTTP 403 with error details

### Requirement: Validation Pipeline
The application SHALL validate all incoming request data using class-validator decorators and ValidationPipe to ensure type safety and data integrity before processing.

#### Scenario: Valid DTO passes validation
- **GIVEN** a DTO class with validation decorators (e.g., @IsEmail(), @MinLength())
- **WHEN** a request body matches all validation rules
- **THEN** the ValidationPipe SHALL transform the plain object to a DTO instance
- **AND** the request SHALL proceed to the controller handler

#### Scenario: Invalid DTO is rejected
- **GIVEN** a DTO class with @IsEmail() on the email field
- **WHEN** a request body contains an invalid email format
- **THEN** the ValidationPipe SHALL throw BadRequestException with validation errors
- **AND** the response SHALL include specific field-level error messages

#### Scenario: DTO transformation applies type coercion
- **GIVEN** a DTO with @Transform() and @Type() decorators
- **WHEN** a request includes string values that should be numbers
- **THEN** the ValidationPipe SHALL automatically convert types
- **AND** the controller SHALL receive properly typed DTO instances

### Requirement: Exception Handling
The application SHALL handle all errors through a global exception filter that catches framework exceptions, custom business errors, and unexpected errors, returning consistent JSON error responses.

#### Scenario: HTTP exception is formatted
- **GIVEN** a controller throws NotFoundException
- **WHEN** the exception filter catches the error
- **THEN** the response SHALL be HTTP 404 with JSON body containing status, message, and timestamp
- **AND** the error SHALL be logged with appropriate severity

#### Scenario: Custom business error is mapped
- **GIVEN** a service throws a custom UnauthorizedError
- **WHEN** the exception filter catches the error
- **THEN** the filter SHALL map the error to HttpException
- **AND** the response SHALL follow the standard error format

#### Scenario: Unexpected error is handled safely
- **GIVEN** an unhandled JavaScript error occurs in a service
- **WHEN** the exception filter catches the error
- **THEN** the filter SHALL log the full error details
- **AND** the response SHALL be HTTP 500 with a generic message (hiding internal details)

### Requirement: Authentication Strategy
The application SHALL implement JWT-based authentication using Passport with @nestjs/passport and @nestjs/jwt, supporting access tokens (15min expiry) and refresh tokens (7 day expiry).

#### Scenario: JWT strategy validates access token
- **GIVEN** a request with Bearer token in Authorization header
- **WHEN** the JwtAuthGuard is applied
- **THEN** the JWT strategy SHALL verify the token signature and expiration
- **AND** the decoded payload SHALL be attached to request.user

#### Scenario: Expired token is rejected
- **GIVEN** a request with an expired access token
- **WHEN** the JWT strategy validates the token
- **THEN** the strategy SHALL throw UnauthorizedException with "Token has expired" message
- **AND** the client SHALL be prompted to refresh the token

#### Scenario: Refresh token generates new access token
- **GIVEN** a valid refresh token stored in the database
- **WHEN** the client sends POST /auth/refresh-token
- **THEN** the auth service SHALL validate the refresh token
- **AND** a new access token SHALL be generated and returned

### Requirement: Authorization with Guards
The application SHALL enforce role-based access control through RolesGuard, which checks if the authenticated user's role matches the required roles specified by @Roles() decorator.

#### Scenario: Admin access to protected route
- **GIVEN** a route decorated with @Roles('admin')
- **WHEN** a user with role 'admin' accesses the route
- **THEN** the RolesGuard SHALL allow the request to proceed

#### Scenario: Insufficient privileges blocked
- **GIVEN** a route decorated with @Roles('admin', 'manager')
- **WHEN** a user with role 'waiter' attempts access
- **THEN** the RolesGuard SHALL throw ForbiddenException
- **AND** the response SHALL indicate required roles and user's current role

#### Scenario: Multiple allowed roles
- **GIVEN** a route decorated with @Roles('manager', 'cashier')
- **WHEN** a user with role 'cashier' accesses the route
- **THEN** the RolesGuard SHALL allow the request to proceed

### Requirement: API Documentation
The application SHALL generate OpenAPI 3.0 documentation automatically using @nestjs/swagger decorators, providing interactive API explorer at /api-docs with request/response schemas for all endpoints.

#### Scenario: Swagger UI is accessible
- **GIVEN** the application is running
- **WHEN** a user navigates to /api-docs
- **THEN** the Swagger UI SHALL display all API endpoints organized by tags
- **AND** each endpoint SHALL show request parameters, body schemas, and response types

#### Scenario: DTO generates schema
- **GIVEN** a DTO class with class-validator decorators
- **WHEN** the Swagger module processes the DTO
- **THEN** the OpenAPI schema SHALL include field types, required flags, and validation constraints
- **AND** example values SHALL be generated from decorators

#### Scenario: Response types are documented
- **GIVEN** a controller method with @ApiResponse({ status: 200, type: UserDto })
- **WHEN** the Swagger documentation is generated
- **THEN** the 200 response SHALL show the UserDto schema
- **AND** all possible status codes SHALL be documented

### Requirement: Database Integration
The application SHALL use PrismaService as a global provider for type-safe database access with automatic connection management through NestJS lifecycle hooks (onModuleInit, onModuleDestroy).

#### Scenario: Prisma connects on startup
- **GIVEN** the PrismaService is registered in DatabaseModule
- **WHEN** the application initializes
- **THEN** PrismaService.onModuleInit() SHALL call $connect()
- **AND** the database connection SHALL be established before accepting requests

#### Scenario: Prisma disconnects on shutdown
- **GIVEN** the application receives a shutdown signal
- **WHEN** NestJS begins graceful shutdown
- **THEN** PrismaService.onModuleDestroy() SHALL call $disconnect()
- **AND** the database connection SHALL close cleanly

#### Scenario: Repository pattern with Prisma
- **GIVEN** a feature service needs database access
- **WHEN** PrismaService is injected into the service
- **THEN** the service SHALL use Prisma client methods (findMany, create, update, delete)
- **AND** all queries SHALL be type-safe based on Prisma schema

### Requirement: WebSocket Support
The application SHALL provide real-time bidirectional communication using @nestjs/platform-socket.io with WebSocket gateways for kitchen order notifications and table status updates.

#### Scenario: Gateway initializes with Socket.io
- **GIVEN** a KitchenGateway class decorated with @WebSocketGateway()
- **WHEN** the application starts
- **THEN** the Socket.io server SHALL be initialized with CORS support
- **AND** the gateway SHALL be ready to accept WebSocket connections

#### Scenario: Server emits event to clients
- **GIVEN** a new order is created
- **WHEN** the OrderService calls kitchenGateway.notifyNewOrder(order)
- **THEN** the gateway SHALL emit 'new-order' event to all connected kitchen clients
- **AND** the event payload SHALL include the complete order details

#### Scenario: Gateway handles client disconnection
- **GIVEN** a client is connected to the WebSocket gateway
- **WHEN** the client disconnects
- **THEN** the gateway SHALL clean up the client connection
- **AND** no errors SHALL be thrown

### Requirement: Scheduled Tasks
The application SHALL support cron-based scheduled tasks using @nestjs/schedule module for periodic operations like token cleanup (daily at midnight) and upload cleanup (daily at 2 AM).

#### Scenario: Cron job executes on schedule
- **GIVEN** a method decorated with @Cron('0 0 * * *')
- **WHEN** the scheduled time arrives (midnight UTC)
- **THEN** the method SHALL execute automatically
- **AND** the execution SHALL be logged with timestamp

#### Scenario: Async cron job completes safely
- **GIVEN** a cron job performs async database operations
- **WHEN** the scheduled task runs
- **THEN** the job SHALL await all async operations before completing
- **AND** errors SHALL be caught and logged without crashing the server

#### Scenario: Token cleanup job runs
- **GIVEN** the cleanupExpiredTokens() method is scheduled daily
- **WHEN** the cron triggers
- **THEN** expired refresh tokens SHALL be deleted from the database
- **AND** the count of deleted tokens SHALL be logged

### Requirement: File Upload Handling
The application SHALL handle multipart file uploads using @nestjs/platform-express with Multer interceptors, supporting image, document, and video uploads with configurable size limits (10MB) and type validation.

#### Scenario: Single file upload
- **GIVEN** a route with @UseInterceptors(FileInterceptor('file'))
- **WHEN** a client uploads a file via multipart/form-data
- **THEN** the file SHALL be accessible via @UploadedFile() decorator
- **AND** the file object SHALL include originalname, mimetype, size, and buffer

#### Scenario: File type validation
- **GIVEN** a file upload route configured to accept only images
- **WHEN** a client uploads a PDF file
- **THEN** the upload SHALL be rejected with BadRequestException
- **AND** the error message SHALL indicate allowed file types

#### Scenario: File size limit enforcement
- **GIVEN** a file upload with 10MB size limit
- **WHEN** a client uploads a 15MB file
- **THEN** the upload SHALL be rejected with PayloadTooLargeException
- **AND** the error message SHALL indicate the maximum allowed size

### Requirement: Logging
The application SHALL use NestJS built-in Logger for consistent logging across all modules with context-aware log messages, supporting log levels (log, error, warn, debug, verbose) and automatic request logging.

#### Scenario: Service logs with context
- **GIVEN** a service class with `private readonly logger = new Logger(ServiceName.name)`
- **WHEN** the service logs a message with `this.logger.log('Message')`
- **THEN** the log output SHALL include timestamp, log level, context (ServiceName), and message

#### Scenario: Error logging with stack trace
- **GIVEN** an error occurs in a service
- **WHEN** the service logs with `this.logger.error('Error occurred', error.stack)`
- **THEN** the log SHALL include the error message and full stack trace
- **AND** the log level SHALL be ERROR

#### Scenario: HTTP request logging
- **GIVEN** the application receives an HTTP request
- **WHEN** logging is enabled
- **THEN** the request SHALL be logged with method, URL, status code, and response time

### Requirement: Security Middleware
The application SHALL apply security best practices through helmet middleware (security headers), CORS configuration (allow client origin with credentials), rate limiting (max 100 requests per 15min per IP), and cookie security.

#### Scenario: Security headers are set
- **GIVEN** any HTTP response
- **WHEN** the response is sent to the client
- **THEN** security headers SHALL be present (X-Frame-Options, X-Content-Type-Options, etc.)
- **AND** the headers SHALL be configured via helmet()

#### Scenario: CORS allows client requests
- **GIVEN** a request from the configured client origin
- **WHEN** the request includes credentials (cookies)
- **THEN** CORS headers SHALL allow the request
- **AND** the response SHALL include Access-Control-Allow-Credentials: true

#### Scenario: Rate limiting blocks excessive requests
- **GIVEN** a client makes 101 requests within 15 minutes
- **WHEN** the 101st request is received
- **THEN** the request SHALL be blocked with HTTP 429 Too Many Requests
- **AND** the response SHALL include Retry-After header

### Requirement: Static File Serving
The application SHALL serve uploaded files from the /uploads directory with proper CORS headers, caching (1 day max-age), ETags, and Cross-Origin-Resource-Policy headers for client access.

#### Scenario: Static file is served
- **GIVEN** an uploaded file exists at /uploads/images/food-123.jpg
- **WHEN** a client requests http://server/uploads/images/food-123.jpg
- **THEN** the file SHALL be served with Content-Type: image/jpeg
- **AND** Cache-Control header SHALL be set to max-age=86400

#### Scenario: CORS headers for static files
- **GIVEN** a client from the configured origin requests a static file
- **WHEN** the request is processed
- **THEN** CORS headers SHALL allow the request
- **AND** Cross-Origin-Resource-Policy SHALL be set to cross-origin

#### Scenario: Non-existent file returns 404
- **GIVEN** a request for a non-existent file /uploads/missing.jpg
- **WHEN** the static file middleware processes the request
- **THEN** the response SHALL be HTTP 404 Not Found

### Requirement: Graceful Shutdown
The application SHALL handle SIGTERM and SIGINT signals to perform graceful shutdown, closing database connections, completing in-flight requests, and cleaning up resources within 30 seconds before forcing exit.

#### Scenario: Application receives shutdown signal
- **GIVEN** the application is running with active connections
- **WHEN** a SIGTERM signal is received
- **THEN** the application SHALL stop accepting new requests
- **AND** existing requests SHALL be allowed to complete

#### Scenario: Database disconnects on shutdown
- **GIVEN** the graceful shutdown process has started
- **WHEN** the PrismaService receives onModuleDestroy() hook
- **THEN** the database connection SHALL be closed
- **AND** no new queries SHALL be accepted

#### Scenario: Forced shutdown after timeout
- **GIVEN** the graceful shutdown has started
- **WHEN** 30 seconds have elapsed without clean exit
- **THEN** the process SHALL force exit with code 1
- **AND** a warning SHALL be logged

### Requirement: Health Check Endpoint
The application SHALL provide a health check endpoint at GET /api/v1/health returning application status, uptime, timestamp, environment, and service health (database connection) for monitoring and load balancer integration.

#### Scenario: Healthy system returns 200
- **GIVEN** the application is running normally
- **WHEN** a health check request is received
- **THEN** the response SHALL be HTTP 200 with status: 'healthy'
- **AND** the database service SHALL be reported as 'healthy'

#### Scenario: Database failure returns 503
- **GIVEN** the database connection is lost
- **WHEN** a health check request is received
- **THEN** the response SHALL be HTTP 503 with status: 'unhealthy'
- **AND** the database service SHALL be reported as 'unhealthy'

#### Scenario: Health check includes system info
- **GIVEN** a health check request
- **WHEN** the endpoint responds
- **THEN** the response SHALL include uptime (process.uptime())
- **AND** the response SHALL include current timestamp and environment name
