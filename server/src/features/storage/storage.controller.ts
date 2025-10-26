/**
 * Storage Controller
 * Manages storage provider switching and monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { storageManager } from '@/features/storage/services/storage/storage.manager';
import type { StorageType } from '@/features/storage/services/storage/storage.interface';
import { ApiResponse } from '@/shared/utils/response';
import logger from '@/config/logger';

export class StorageController {
    /**
     * Get storage status
     */
    async getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const status = await storageManager.getStatus();
            res.json(ApiResponse.success(status, 'Storage status retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Switch storage provider
     */
    async switchProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { provider } = req.body;

            if (!provider || !['local', 'cloudinary'].includes(provider)) {
                res.status(400).json(ApiResponse.error('Invalid provider. Must be "local" or "cloudinary"'));
                return;
            }

            const success = await storageManager.switchProvider(provider as StorageType);

            if (success) {
                const status = await storageManager.getStatus();
                res.json(ApiResponse.success(status, `Storage provider switched to ${provider}`));
                logger.info(`Storage provider switched to ${provider}`);
            } else {
                res.status(400).json(ApiResponse.error(`Failed to switch to ${provider}. Provider may not be available.`));
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current storage type
     */
    async getCurrentType(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const type = storageManager.getStorageType();
            res.json(ApiResponse.success({ storageType: type }, 'Current storage type retrieved'));
        } catch (error) {
            next(error);
        }
    }
}

export const storageController = new StorageController();
