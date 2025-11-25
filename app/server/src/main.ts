import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';
import { join } from 'path';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') || 8000;
    const apiVersion = configService.get<string>('apiVersion') || 'v1';
    const nodeEnv = configService.get<string>('nodeEnv') || 'development';
    const corsOriginString =
        configService.get<string>('corsOrigin') || 'http://localhost:3000';

    // Parse CORS origins (supports comma-separated list)
    const corsOrigins = corsOriginString
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);

    // Global prefix
    app.setGlobalPrefix(`api/${apiVersion}`);

    // Security middleware
    app.use(helmet());

    // CORS - use array of origins or function to handle dynamic origins
    app.enableCors({
        origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'X-Requested-With',
        ],
    });

    // Compression
    app.use(compression.default());

    // Cookie parser
    app.use(cookieParser.default());

    // Request logging middleware — captures timestamp, path, ip, user-agent, method and headers
    app.use((request: Request, response: Response, next: NextFunction) => {
        try {
            console.log({
                timestamp: new Date().toISOString(),
                path: request.path,
                ip: request.ip,
                userAgent: request.headers['user-agent'],
                method: request.method,
                headers: request.headers,
            });
        } catch (err) {
            // If logging fails, don't break the request flow
            // Use Nest logger fallback
            console.error('Request logging failed', err);
        }
        next();
    });

    // Static file serving for uploads
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Restaurant Management System API')
        .setDescription('API documentation for Restaurant Management System')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('staff', 'Staff management endpoints')
        .addTag('categories', 'Category management endpoints')
        .addTag('menu', 'Menu management endpoints')
        .addTag('tables', 'Table management endpoints')
        .addTag('floor-plans', 'Floor plan management endpoints')
        .addTag('reservations', 'Reservation management endpoints')
        .addTag('customers', 'Customer management endpoints')
        .addTag('orders', 'Order management endpoints')
        .addTag('kitchen', 'Kitchen management endpoints')
        .addTag('bills', 'Bill management endpoints')
        .addTag('payments', 'Payment management endpoints')
        .addTag('storage', 'File storage endpoints')
        .addTag('health', 'Health check endpoints')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    // Graceful shutdown
    app.enableShutdownHooks();

    await app.listen(port);

    logger.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🍽️  Restaurant Management System API 🍽️    ║
║                                               ║
║   Environment: ${nodeEnv.padEnd(31)}   ║
║   Port: ${port.toString().padEnd(37)}  ║
║   API Version: ${apiVersion.padEnd(30)}║
║                                               ║
║   Server: http://localhost:${port.toString().padEnd(19)}║
║   Health: http://localhost:${port}/api/${apiVersion}/health ║
║   Docs: http://localhost:${port}/api-docs${' '.repeat(16 - apiVersion.length)}║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
}

void bootstrap();
