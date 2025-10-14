import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import logger from './config/logger';

export function createApp(): Application {
    const app = express();

    // Swagger configuration
    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Restaurant Management System API',
                version: '1.0.0',
                description: 'API documentation for Restaurant Management System',
            },
            servers: [
                {
                    url: `${config.apiBaseUrl}/api/${config.apiVersion}`,
                    description: 'Development server',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
        apis: ['./src/routes/*.ts'], // Path to the API routes
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);

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
