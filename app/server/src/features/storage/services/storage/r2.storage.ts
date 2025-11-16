/**
 * Cloudflare R2 Storage Provider
 * Implements S3-compatible storage using AWS SDK
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { StorageProvider, StorageUploadResult, StorageDeleteResult } from './storage.interface';
import logger from '@/config/logger';
import config from '@/config';
import * as fs from 'fs';

export class R2StorageProvider implements StorageProvider {
    private s3Client: S3Client | null = null;
    private bucketName: string;
    private publicUrl: string;
    private isInitialized: boolean = false;

    constructor() {
        this.bucketName = config.r2.bucketName;
        this.publicUrl = config.r2.publicUrl;
        this.initialize();
    }

    /**
     * Initialize AWS S3 client with R2 endpoint
     */
    private initialize(): void {
        try {
            if (!config.r2.accountId) {
                logger.warn('R2 not configured. Set R2_ACCOUNT_ID environment variable');
                return;
            }

            if (!config.r2.bucketName || !config.r2.accessKeyId || !config.r2.secretAccessKey) {
                logger.warn('R2 configuration incomplete. Required: R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
                return;
            }

            // Initialize S3 client with R2 endpoint
            this.s3Client = new S3Client({
                region: 'auto',
                endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: config.r2.accessKeyId,
                    secretAccessKey: config.r2.secretAccessKey,
                },
            });

            this.isInitialized = true;
            logger.info('R2 initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize R2:', error);
        }
    }

    async upload(file: Express.Multer.File, folder: string = 'temp'): Promise<StorageUploadResult> {
        try {
            if (!this.isInitialized || !this.s3Client) {
                throw new Error('R2 is not initialized');
            }

            // Map folder names to R2 key prefixes
            const folderMap: Record<string, string> = {
                'temp': 'restaurant/temp',
                'menu': 'restaurant/menu',
                'staff': 'restaurant/staff',
                'documents': 'restaurant/documents',
                'images': 'restaurant/images',
                'others': 'restaurant/others',
            };

            const r2Folder = folderMap[folder] || 'restaurant/temp';
            const key = `${r2Folder}/${file.filename}`;

            // Read file contents
            const fileContent = fs.readFileSync(file.path);

            // Upload to R2
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: fileContent,
                ContentType: file.mimetype,
            });

            await this.s3Client.send(command);

            logger.info(`File uploaded to R2: ${key}`);

            // Construct public URL
            const url = this.publicUrl ? `${this.publicUrl}/${key}` : `r2://${key}`;

            return {
                filename: file.filename,
                originalName: file.originalname,
                path: `r2://${key}`,
                size: file.size,
                mimetype: file.mimetype,
                url: url,
            };
        } catch (error) {
            logger.error('R2 upload failed:', error);
            throw error;
        }
    }

    async delete(filePath: string): Promise<StorageDeleteResult> {
        try {
            if (!this.isInitialized || !this.s3Client) {
                return {
                    success: false,
                    message: 'R2 is not initialized',
                };
            }

            // Extract key from path
            let key = filePath;
            if (filePath.startsWith('r2://')) {
                key = filePath.replace('r2://', '');
            } else if (this.publicUrl && filePath.startsWith(this.publicUrl)) {
                key = filePath.replace(`${this.publicUrl}/`, '');
            }

            // Delete from R2
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);

            logger.info(`File deleted from R2: ${key}`);

            return {
                success: true,
                message: 'File deleted successfully',
                deletedPath: filePath,
            };
        } catch (error) {
            logger.error('R2 delete failed:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete file',
            };
        }
    }

    async isAvailable(): Promise<boolean> {
        try {
            if (!this.isInitialized || !this.s3Client) {
                return false;
            }

            // Check bucket accessibility
            const command = new HeadBucketCommand({
                Bucket: this.bucketName,
            });

            await this.s3Client.send(command);
            return true;
        } catch (error) {
            logger.error('R2 availability check failed:', error);
            return false;
        }
    }

    getName(): string {
        return 'r2';
    }
}

// Export singleton instance
export const r2StorageProvider = new R2StorageProvider();
