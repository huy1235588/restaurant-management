/**
 * Storage Manager
 * Manages storage providers and switching between them
 */

import { StorageProvider, StorageUploadResult, StorageDeleteResult, StorageType } from './storage.interface';
import { localStorageProvider } from './local.storage';
import { cloudinaryStorageProvider } from './cloudinary.storage';
import logger from '@/config/logger';

export class StorageManager {
    private static instance: StorageManager;
    private primaryProvider: StorageProvider;
    private fallbackProvider: StorageProvider;
    private storageType: StorageType;

    private constructor() {
        this.storageType = (process.env['STORAGE_TYPE'] || 'local') as StorageType;
        this.primaryProvider = this.getProvider(this.storageType);
        this.fallbackProvider = this.getProvider(this.storageType === 'cloudinary' ? 'local' : 'cloudinary');

        logger.info(`Storage initialized with primary provider: ${this.primaryProvider.getName()}`);
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): StorageManager {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }

    /**
     * Get provider by type
     */
    private getProvider(type: StorageType): StorageProvider {
        switch (type) {
            case 'cloudinary':
                return cloudinaryStorageProvider;
            case 'local':
            default:
                return localStorageProvider;
        }
    }

    /**
     * Upload file using primary provider (with fallback)
     */
    async upload(file: Express.Multer.File, folder?: string): Promise<StorageUploadResult> {
        try {
            // Check if primary provider is available
            const isPrimaryAvailable = await this.primaryProvider.isAvailable();

            if (isPrimaryAvailable) {
                return await this.primaryProvider.upload(file, folder);
            } else {
                logger.warn(`Primary provider (${this.primaryProvider.getName()}) not available, using fallback`);
                return await this.fallbackProvider.upload(file, folder);
            }
        } catch (error) {
            logger.error(`Upload with ${this.primaryProvider.getName()} failed, trying fallback:`, error);

            try {
                return await this.fallbackProvider.upload(file, folder);
            } catch (fallbackError) {
                logger.error('Both upload providers failed:', fallbackError);
                throw new Error('Failed to upload file with all available providers');
            }
        }
    }

    /**
     * Delete file using appropriate provider
     */
    async delete(filePath: string): Promise<StorageDeleteResult> {
        try {
            // Determine which provider to use based on path
            if (filePath.startsWith('cloudinary://')) {
                return await cloudinaryStorageProvider.delete(filePath);
            } else {
                return await localStorageProvider.delete(filePath);
            }
        } catch (error) {
            logger.error('Delete operation failed:', error);
            return {
                success: false,
                message: 'Failed to delete file',
            };
        }
    }

    /**
     * Switch storage provider at runtime
     */
    async switchProvider(type: StorageType): Promise<boolean> {
        try {
            const newProvider = this.getProvider(type);
            const isAvailable = await newProvider.isAvailable();

            if (isAvailable) {
                this.primaryProvider = newProvider;
                this.storageType = type;
                logger.info(`Switched to ${type} storage provider`);
                return true;
            } else {
                logger.warn(`Cannot switch to ${type}: provider not available`);
                return false;
            }
        } catch (error) {
            logger.error('Failed to switch storage provider:', error);
            return false;
        }
    }

    /**
     * Get current primary provider
     */
    getPrimaryProvider(): StorageProvider {
        return this.primaryProvider;
    }

    /**
     * Get current storage type
     */
    getStorageType(): StorageType {
        return this.storageType;
    }

    /**
     * Get provider status
     */
    async getStatus(): Promise<{
        primary: string;
        primaryAvailable: boolean;
        fallback: string;
        fallbackAvailable: boolean;
        currentType: StorageType;
    }> {
        return {
            primary: this.primaryProvider.getName(),
            primaryAvailable: await this.primaryProvider.isAvailable(),
            fallback: this.fallbackProvider.getName(),
            fallbackAvailable: await this.fallbackProvider.isAvailable(),
            currentType: this.storageType,
        };
    }
}

export const storageManager = StorageManager.getInstance();
