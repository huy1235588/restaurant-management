/**
 * Upload Service * Upload Service Exports
 * High-level service for file upload operations 
 **/

export * from './upload.service';

import fs from 'fs/promises';

import { storageManager } from './storage/storage.manager';
import { UploadedFileInfo } from '../types/upload.types';
import { AppError } from '@/shared/utils/errors';
import logger from '@/config/logger';

export class UploadService {
    /**
     * Upload single file
     */
    async uploadFile(
        file: Express.Multer.File,
        folder?: string
    ): Promise<UploadedFileInfo> {
        try {
            // Upload using storage manager (supports local + cloudinary with fallback)
            const result = await storageManager.upload(file, folder);

            // Clean up temp file if using Cloudinary
            if (storageManager.getStorageType() === 'cloudinary') {
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    logger.warn(`Failed to clean up temp file: ${file.path}`, unlinkError);
                }
            }

            return {
                filename: result.filename,
                originalName: result.originalName,
                path: result.path,
                size: result.size,
                mimetype: result.mimetype,
                url: result.url,
                uploadedAt: new Date(),
            };
        } catch (error) {
            logger.error('Upload service error:', error);
            throw new AppError('Failed to upload file', 500);
        }
    }

    /**
     * Upload multiple files
     */
    async uploadFiles(
        files: Express.Multer.File[],
        folder?: string
    ): Promise<UploadedFileInfo[]> {
        const uploadPromises = files.map(file => this.uploadFile(file, folder));
        return Promise.all(uploadPromises);
    }

    /**
     * Delete file
     */
    async deleteFile(filePath: string): Promise<boolean> {
        try {
            const result = await storageManager.delete(filePath);
            return result.success;
        } catch (error) {
            logger.error('Delete file error:', error);
            return false;
        }
    }

    /**
     * Delete multiple files
     */
    async deleteFiles(filePaths: string[]): Promise<void> {
        await Promise.all(filePaths.map(path => this.deleteFile(path)));
    }
}

export const uploadService = new UploadService();
