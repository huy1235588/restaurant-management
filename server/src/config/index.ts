import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
    // Server
    nodeEnv: string;
    port: number;
    apiVersion: string;
    apiBaseUrl: string;

    // Database
    databaseUrl: string;

    // JWT
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;

    // CORS
    corsOrigin: string[];

    // Rate Limiting
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;

    // Logging
    logLevel: string;
}

const config: Config = {
    // Server
    nodeEnv: process.env['NODE_ENV'] || 'development',
    port: parseInt(process.env['PORT'] || '5000', 10),
    apiVersion: process.env['API_VERSION'] || 'v1',
    apiBaseUrl: process.env['API_BASE_URL'] || 'http://localhost:5000',

    // Database
    databaseUrl: process.env['DATABASE_URL'] || '',

    // JWT
    jwtSecret: process.env['JWT_SECRET'] || 'your-secret-key',
    jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '15m',
    jwtRefreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',

    // CORS
    corsOrigin: process.env['CLIENT_URL'] ? process.env['CLIENT_URL'].split(',').map(url => url.trim()) : ['http://localhost:3000'],

    // Rate Limiting
    rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),

    // Logging
    logLevel: process.env['LOG_LEVEL'] || 'info',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default config;
