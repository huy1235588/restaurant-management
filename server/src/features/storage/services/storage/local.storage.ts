/**
 * Local Storage Provider
 * Stores files locally on the server
 */

import path from 'path';
import fs from 'fs/promises';
import { StorageProvider, StorageUploadResult, StorageDeleteResult } from './storage.interface';
import logger from '@/config/logger';
import { UPLOAD_DIRS } from '../../constants/upload.constants';

export class LocalStorageProvider implements StorageProvider {
    async upload(file: Express.Multer.File, folder: string = 'temp'): Promise<StorageUploadResult> {
        try {
            const uploadDir = this.getUploadDir(folder);

            // Ensure directory exists
            await fs.mkdir(uploadDir, { recursive: true });

            // File is already saved by multer with diskStorage
            // We just need to return the info
            const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');
            const baseUrl = process.env['BASE_URL'] || 'http://localhost:3000';
            const url = `${baseUrl}/${relativePath}`;

            return {
                filename: file.filename,
                originalName: file.originalname,
                path: relativePath,
                size: file.size,
                mimetype: file.mimetype,
                url,
            };
        } catch (error) {
            logger.error('Local storage upload failed:', error);
            throw error;
        }
    }

    async delete(filePath: string): Promise<StorageDeleteResult> {
        try {
            const fullPath = path.join(process.cwd(), filePath);

            // Security check
            if (!fullPath.includes('uploads')) {
                return {
                    success: false,
                    message: 'Invalid file path',
                };
            }

            await fs.unlink(fullPath);
            logger.info(`Local file deleted: ${filePath}`);

            return {
                success: true,
                message: 'File deleted successfully',
                deletedPath: filePath,
            };
        } catch (error) {
            logger.error('Local storage delete failed:', error);
            return {
                success: false,
                message: 'Failed to delete file',
            };
        }
    }

    async isAvailable(): Promise<boolean> {
        try {
            // Check if uploads directory is writable
            const testDir = path.join(process.cwd(), UPLOAD_DIRS.TEMP);
            await fs.mkdir(testDir, { recursive: true });
            return true;
        } catch (error) {
            logger.error('Local storage not available:', error);
            return false;
        }
    }

    getName(): string {
        return 'local';
    }

    /**
     * Get full upload directory path
     */
    private getUploadDir(folder: string): string {
        const folderMap: Record<string, string> = {
            'temp': UPLOAD_DIRS.TEMP,
            'menu': UPLOAD_DIRS.MENU,
            'staff': UPLOAD_DIRS.STAFF,
            'documents': UPLOAD_DIRS.DOCUMENTS,
            'images': UPLOAD_DIRS.IMAGES,
            'others': UPLOAD_DIRS.OTHERS,
        };

        return path.join(process.cwd(), folderMap[folder] || UPLOAD_DIRS.TEMP);
    }
}

export const localStorageProvider = new LocalStorageProvider();
