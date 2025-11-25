import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    IStorageService,
    UploadResult,
} from '@/modules/storage/interfaces/storage-service.interface';
import { StorageProvider } from '@/modules/storage/enums';
import { LocalStorageService } from '@/modules/storage/services/local-storage.service';
import { R2StorageService } from '@/modules/storage/services/r2-storage.service';
import { CloudinaryStorageService } from '@/modules/storage/services/cloudinary-storage.service';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly storageService: IStorageService;
    private readonly provider: StorageProvider;

    constructor(
        private readonly configService: ConfigService,
        private readonly localStorageService: LocalStorageService,
        private readonly r2StorageService: R2StorageService,
        private readonly cloudinaryStorageService: CloudinaryStorageService,
    ) {
        this.provider =
            (this.configService.get<string>(
                'storage.provider',
            ) as StorageProvider) || StorageProvider.R2;

        // Select storage service based on provider
        switch (this.provider) {
            case StorageProvider.R2:
                this.storageService = this.r2StorageService;
                break;
            case StorageProvider.CLOUDINARY:
                this.storageService = this.cloudinaryStorageService;
                break;
            case StorageProvider.LOCAL:
            default:
                this.storageService = this.localStorageService;
                break;
        }

        this.logger.log(`Using storage provider: ${this.provider}`);
    }

    /**
     * Upload a file
     */
    async uploadFile(
        file: Express.Multer.File,
        folder?: string,
    ): Promise<UploadResult> {
        this.validateFile(file);
        return this.storageService.uploadFile(file, folder);
    }

    /**
     * Upload multiple files
     */
    async uploadFiles(
        files: Express.Multer.File[],
        folder?: string,
    ): Promise<UploadResult[]> {
        return Promise.all(files.map((file) => this.uploadFile(file, folder)));
    }

    /**
     * Delete a file
     */
    async deleteFile(identifier: string): Promise<void> {
        return this.storageService.deleteFile(identifier);
    }

    /**
     * Get file URL
     */
    getFileUrl(identifier: string): string {
        return this.storageService.getFileUrl(identifier);
    }

    /**
     * Validate uploaded file
     */
    private validateFile(file: Express.Multer.File): void {
        const maxSize =
            this.configService.get<number>('storage.maxFileSize') ||
            10 * 1024 * 1024; // 10MB default

        if (file.size > maxSize) {
            throw new BadRequestException(
                `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
            );
        }

        const allowedMimetypes = this.configService.get<string[]>(
            'storage.allowedMimetypes',
        ) || [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ];

        if (!allowedMimetypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `File type ${file.mimetype} is not allowed`,
            );
        }
    }
}
