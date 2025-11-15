import express, { Application } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './shared/middlewares';
import logger from './config/logger';
import DatabaseClient from './config/database';

export function createApp(): Application {
    const app = express();

    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Security middleware
    app.use(helmet());

    // CORS
    app.use(
        cors({
            origin: config.corsOrigin,
            credentials: true,
        })
    );

    // Compression
    app.use(compression());

    // Body parser
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parser
    app.use(cookieParser());

    // Logging
    if (config.nodeEnv === 'development') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined', {
            stream: {
                write: (message: string) => logger.info(message.trim()),
            },
        }));
    }

    // Rate limiting
    const limiter = rateLimit({
        windowMs: config.rateLimitWindowMs,
        max: config.rateLimitMaxRequests,
        message: 'Too many requests from this IP, please try again later.',
    });
    app.use('/api', limiter);

    // Serve static files - uploads folder
    app.use('/uploads', cors({ origin: config.corsOrigin, credentials: true }));
    app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
        maxAge: '1d', // Cache for 1 day
        etag: true,
        lastModified: true,
        setHeaders: (res) => {
            res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        },
    }));

    // Health check endpoint (before API routes, no auth required)
    app.get('/api/health', async (_req, res) => {
        const health: {
            status: 'healthy' | 'unhealthy';
            uptime: number;
            timestamp: string;
            environment: string;
            services: {
                database: string;
            };
        } = {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: process.env['NODE_ENV'] || 'development',
            services: {
                database: 'unknown',
            },
        };

        try {
            await DatabaseClient.getInstance().$queryRaw`SELECT 1`;
            health.services.database = 'healthy';
        } catch (error) {
            health.services.database = 'unhealthy';
            health.status = 'unhealthy';
        }

        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    });

    // API Routes
    app.use(`/api/${config.apiVersion}`, routes);

    // Root route
    app.get('/', (_req, res) => {
        res.json({
            success: true,
            message: 'Restaurant Management System API',
            version: config.apiVersion,
            timestamp: new Date().toISOString(),
        });
    });

    // Error handlers
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
