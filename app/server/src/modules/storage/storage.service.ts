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
    private storageService: IStorageService;
    private provider: StorageProvider;

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
     * Return current storage provider
     */
    getProvider(): StorageProvider {
        return this.provider;
    }

    /**
     * Change storage provider at runtime
     */
    setProvider(provider: StorageProvider): void {
        if (this.provider === provider) {
            this.logger.log(`Storage provider already set to ${provider}`);
            return;
        }

        this.provider = provider;

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

        this.logger.log(`Switched storage provider to: ${this.provider}`);
    }

    /**
     * Upload a file
     */
    async uploadFile(
        file: Express.Multer.File,
        folder?: string,
    ): Promise<UploadResult> {
        // Sanitize filename before validation/upload
        file.originalname = this.sanitizeFileName(file.originalname);

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

    /**
     * Sanitize filename: trim, remove diacritics, replace spaces with underscores,
     * remove unsafe chars, collapse multiple underscores, and lowercase.
     */
    private sanitizeFileName(originalName: string): string {
        if (!originalName) return originalName;

        const lastDot = originalName.lastIndexOf('.');
        const namePart =
            lastDot === -1 ? originalName : originalName.slice(0, lastDot);
        const extPart = lastDot === -1 ? '' : originalName.slice(lastDot);

        // Remove diacritics and normalize
        let sanitized = namePart
            .normalize('NFD')
            .replace(/[\u0300-\u036F]/g, ''); // Remove combining diacritical marks

        // Replace whitespace and non-safe characters with hyphen
        sanitized = sanitized
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9._-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
            .toLowerCase();

        const ext = extPart ? extPart.toLowerCase() : '';
        return sanitized + ext;
    }
}
