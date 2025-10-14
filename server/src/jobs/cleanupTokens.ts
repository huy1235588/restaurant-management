import authService from '@/services/auth.service';
import logger from '@/config/logger';

/**
 * Cleanup expired refresh tokens
 * Should be run periodically (e.g., daily via cron)
 */
export async function cleanupExpiredTokens() {
    try {
        logger.info('Starting cleanup of expired refresh tokens...');
        const result = await authService.cleanupExpiredTokens();
        logger.info(`Cleaned up ${result.count} expired refresh tokens`);
        return result;
    } catch (error) {
        logger.error('Error cleaning up expired tokens:', error);
        throw error;
    }
}

/**
 * Schedule cleanup to run daily at 2 AM
 */
export function scheduleTokenCleanup() {
    // Run cleanup every 24 hours (86400000 ms)
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;

    // Calculate time until next 2 AM
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(2, 0, 0, 0);

    // If 2 AM has already passed today, schedule for tomorrow
    if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
    }

    const timeUntilNextRun = nextRun.getTime() - now.getTime();

    // Schedule first run
    setTimeout(() => {
        cleanupExpiredTokens();

        // Schedule recurring cleanup
        setInterval(cleanupExpiredTokens, CLEANUP_INTERVAL);
    }, timeUntilNextRun);

    logger.info(`Token cleanup scheduled to run at ${nextRun.toLocaleString()}`);
}
