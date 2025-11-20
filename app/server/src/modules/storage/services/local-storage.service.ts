import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
    IStorageService,
    UploadResult,
} from '@/modules/storage/interfaces/storage-service.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
    private readonly logger = new Logger(LocalStorageService.name);
    private readonly uploadDir: string;
    private readonly baseUrl: string;

    constructor(private readonly configService: ConfigService) {
        this.uploadDir =
            this.configService.get<string>('storage.uploadDir') || 'uploads';
        this.baseUrl =
            this.configService.get<string>('app.url') ||
            'http://localhost:3000';
    }

    async uploadFile(
        file: Express.Multer.File,
        folder = 'general',
    ): Promise<UploadResult> {
        try {
            const uploadPath = join(this.uploadDir, folder);

            // Ensure directory exists
            await fs.mkdir(uploadPath, { recursive: true });

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.originalname}`;
            const filepath = join(uploadPath, filename);

            // Write file
            await fs.writeFile(filepath, file.buffer);

            this.logger.log(`File uploaded to local storage: ${filename}`);

            return {
                url: `${this.baseUrl}/uploads/${folder}/${filename}`,
                filename,
                size: file.size,
                mimetype: file.mimetype,
            };
        } catch (error) {
            this.logger.error('Failed to upload file to local storage', error);
            throw error;
        }
    }

    async deleteFile(identifier: string): Promise<void> {
        try {
            // Extract path from URL or use identifier directly
            const filePath = identifier.includes('/uploads/')
                ? join(this.uploadDir, identifier.split('/uploads/')[1])
                : join(this.uploadDir, identifier);

            await fs.unlink(filePath);

            this.logger.log(`File deleted from local storage: ${identifier}`);
        } catch (error) {
            this.logger.error(
                'Failed to delete file from local storage',
                error,
            );
            throw error;
        }
    }

    getFileUrl(identifier: string): string {
        if (identifier.startsWith('http')) {
            return identifier;
        }
        return `${this.baseUrl}/uploads/${identifier}`;
    }
}
