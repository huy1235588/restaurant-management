import http from 'http';
import { createApp } from './app';
import config from '@/config/index';
import DatabaseClient from '@/config/database';
import socketService from '@/shared/utils/socket';
import logger from '@/config/logger';
import { scheduleTokenCleanup } from './jobs/cleanupTokens';
import { startCleanupUploadsJob } from './jobs/cleanupUploads';

async function startServer() {
    try {
        // Connect to database
        await DatabaseClient.connect();

        // Create Express app
        const app = createApp();

        // Create HTTP server
        const httpServer = http.createServer(app);

        // Initialize Socket.IO
        socketService.initialize(httpServer);
        logger.info('✅ Socket.IO initialized');

        // Schedule token cleanup job
        scheduleTokenCleanup();
        logger.info('✅ Token cleanup job scheduled');

        // Schedule uploads cleanup job
        startCleanupUploadsJob();
        logger.info('✅ Uploads cleanup job scheduled');

        // Start server
        httpServer.listen(config.port, () => {
            logger.info(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🍽️  Restaurant Management System API 🍽️    ║
║                                               ║
║   Environment: ${config.nodeEnv.padEnd(31)}   ║
║   Port: ${config.port.toString().padEnd(37)}  ║
║   API Version: ${config.apiVersion.padEnd(30)}║
║                                               ║
║   Server: http://localhost:${config.port.toString().padEnd(19)}║
║   Health: http://localhost:${config.port}/api/${config.apiVersion}/health ║
║   Docs: http://localhost:${config.port}/api-docs${' '.repeat(16 - config.apiVersion.length)}║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string) => {
            logger.info(`\n${signal} received. Starting graceful shutdown...`);

            httpServer.close(async () => {
                logger.info('HTTP server closed');

                await DatabaseClient.disconnect();

                logger.info('Graceful shutdown completed');
                process.exit(0);
            });

            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 30000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught errors
        process.on('uncaughtException', (error: Error) => {
            logger.error('Uncaught Exception:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason: unknown) => {
            logger.error('Unhandled Rejection:', reason);
            process.exit(1);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
