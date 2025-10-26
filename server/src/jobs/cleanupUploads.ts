/**
 * Cleanup Uploads Job
 * Automatically clean up old temporary files
 */

import cron from 'node-cron';
import logger from '@/config/logger';
import { cleanupTempFiles } from '@/features/storage';

/**
 * Schedule cleanup of temp files every day at 2 AM
 * Cron format: minute hour day month weekday
 */
export const startCleanupUploadsJob = () => {
    // Run every day at 2:00 AM
    cron.schedule('0 2 * * *', () => {
        logger.info('Running scheduled cleanup of temp files...');
        
        try {
            const deletedCount = cleanupTempFiles(24); // Clean files older than 24 hours
            logger.info(`Cleanup completed: ${deletedCount} temp files deleted`);
        } catch (error) {
            logger.error('Error during temp files cleanup:', error);
        }
    });

    logger.info('Cleanup uploads job scheduled (runs daily at 2:00 AM)');
};

/**
 * Manually trigger cleanup (useful for testing or manual cleanup)
 */
export const manualCleanup = async (hoursOld: number = 24): Promise<number> => {
    try {
        logger.info(`Manual cleanup triggered for files older than ${hoursOld} hours`);
        const deletedCount = cleanupTempFiles(hoursOld);
        logger.info(`Manual cleanup completed: ${deletedCount} files deleted`);
        return deletedCount;
    } catch (error) {
        logger.error('Error during manual cleanup:', error);
        throw error;
    }
};
