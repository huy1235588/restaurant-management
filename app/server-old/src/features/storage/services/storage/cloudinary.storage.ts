/**
 * Cloudinary Storage Provider
 * Stores files on Cloudinary CDN
 * 
 * ⚠️ **DEPRECATED/LEGACY** ⚠️
 * This provider is maintained for backward compatibility only.
 * New uploads should use Cloudflare R2 (R2StorageProvider).
 * 
 * Will be removed in a future version after data migration to R2.
 * 
 * @deprecated Use R2StorageProvider instead
 */

import { StorageProvider, StorageUploadResult, StorageDeleteResult } from './storage.interface';
import logger from '@/config/logger';

// Type-safe Cloudinary v2 API
interface CloudinaryUploadResult {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    folder: string;
    original_filename: string;
}

interface CloudinaryDeleteResult {
    result: string;
}

export class CloudinaryStorageProvider implements StorageProvider {
    private cloudinary: any;
    private isInitialized: boolean = false;

    constructor() {
        this.initialize();
    }

    /**
     * Initialize Cloudinary SDK
     */
    private initialize(): void {
        try {
            if (!process.env['CLOUDINARY_CLOUD_NAME']) {
                logger.warn('Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME environment variable');
                return;
            }

            // Lazy load cloudinary
            const CloudinaryModule = require('cloudinary');
            this.cloudinary = CloudinaryModule.v2;

            this.cloudinary.config({
                cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
                api_key: process.env['CLOUDINARY_API_KEY'],
                api_secret: process.env['CLOUDINARY_API_SECRET'],
            });

            this.isInitialized = true;
            logger.info('Cloudinary initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize Cloudinary:', error);
        }
    }

    async upload(file: Express.Multer.File, folder: string = 'temp'): Promise<StorageUploadResult> {
        try {
            if (!this.isInitialized) {
                throw new Error('Cloudinary is not initialized');
            }

            // Map folder names to Cloudinary folders
            const folderMap: Record<string, string> = {
                'temp': 'restaurant/temp',
                'menu': 'restaurant/menu',
                'staff': 'restaurant/staff',
                'documents': 'restaurant/documents',
                'images': 'restaurant/images',
                'others': 'restaurant/others',
            };

            const cloudinaryFolder = folderMap[folder] || 'restaurant/temp';

            // Upload to Cloudinary
            const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
                const uploadStream = this.cloudinary.uploader.upload_stream(
                    {
                        folder: cloudinaryFolder,
                        resource_type: 'auto',
                        quality: 'auto',
                        fetch_format: 'auto',
                    },
                    (error: any, result: CloudinaryUploadResult) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                // Read file and pipe to upload stream
                require('fs').createReadStream(file.path).pipe(uploadStream);
            });

            logger.info(`File uploaded to Cloudinary: ${result.public_id}`);

            return {
                filename: result.public_id,
                originalName: result.original_filename,
                path: `cloudinary://${result.public_id}`,
                size: result.bytes,
                mimetype: file.mimetype,
                url: result.secure_url,
            };
        } catch (error) {
            logger.error('Cloudinary upload failed:', error);
            throw error;
        }
    }

    async delete(filePath: string): Promise<StorageDeleteResult> {
        try {
            if (!this.isInitialized) {
                return {
                    success: false,
                    message: 'Cloudinary is not initialized',
                };
            }

            // Extract public_id from path
            let publicId = filePath;
            if (filePath.startsWith('cloudinary://')) {
                publicId = filePath.replace('cloudinary://', '');
            }

            const result = await new Promise<CloudinaryDeleteResult>((resolve, reject) => {
                this.cloudinary.uploader.destroy(publicId, (error: any, result: CloudinaryDeleteResult) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });

            if (result.result === 'ok') {
                logger.info(`File deleted from Cloudinary: ${publicId}`);
                return {
                    success: true,
                    message: 'File deleted successfully',
                    deletedPath: filePath,
                };
            } else {
                return {
                    success: false,
                    message: `Failed to delete file. Result: ${result.result}`,
                };
            }
        } catch (error) {
            logger.error('Cloudinary delete failed:', error);
            return {
                success: false,
                message: 'Failed to delete file from Cloudinary',
            };
        }
    }

    async isAvailable(): Promise<boolean> {
        try {
            if (!this.isInitialized) {
                return false;
            }

            // Test API connection
            await new Promise((resolve, reject) => {
                this.cloudinary.api.resources_by_tag('test', (error: any, result: any) => {
                    if (error && error.http_code !== 404) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });

            return true;
        } catch (error) {
            logger.error('Cloudinary availability check failed:', error);
            return false;
        }
    }

    getName(): string {
        return 'cloudinary';
    }
}

export const cloudinaryStorageProvider = new CloudinaryStorageProvider();
