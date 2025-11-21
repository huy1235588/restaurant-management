import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import {
    IStorageService,
    UploadResult,
} from '@/modules/storage/interfaces/storage-service.interface';

@Injectable()
export class R2StorageService implements IStorageService {
    private readonly logger = new Logger(R2StorageService.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly publicUrl: string;

    constructor(private readonly configService: ConfigService) {
        const accountId = this.configService.get<string>(
            'storage.r2.accountId',
        );
        const accessKeyId = this.configService.get<string>(
            'storage.r2.accessKeyId',
        );
        const secretAccessKey = this.configService.get<string>(
            'storage.r2.secretAccessKey',
        );

        this.bucketName =
            this.configService.get<string>('storage.r2.bucketName') || '';
        this.publicUrl =
            this.configService.get<string>('storage.r2.publicUrl') || '';

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: accessKeyId || '',
                secretAccessKey: secretAccessKey || '',
            },
        });
    }

    async uploadFile(
        file: Express.Multer.File,
        folder = 'general',
    ): Promise<UploadResult> {
        try {
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.originalname}`;
            const key = `${folder}/${filename}`;

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3Client.send(command);

            this.logger.log(`File uploaded to R2: ${filename}`);

            return {
                filename,
                originalName: file.originalname,
                path: key,
                size: file.size,
                mimetype: file.mimetype,
                url: `${this.publicUrl}/${key}`,
                uploadedAt: new Date().toISOString(),
                publicId: key,
            };
        } catch (error) {
            this.logger.error('Failed to upload file to R2', error);
            throw error;
        }
    }

    async deleteFile(identifier: string): Promise<void> {
        try {
            // Extract key from URL or use identifier directly
            const key = identifier.includes(this.publicUrl)
                ? identifier.split(this.publicUrl + '/')[1]
                : identifier;

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);

            this.logger.log(`File deleted from R2: ${identifier}`);
        } catch (error) {
            this.logger.error('Failed to delete file from R2', error);
            throw error;
        }
    }

    getFileUrl(identifier: string): string {
        if (identifier.startsWith('http')) {
            return identifier;
        }
        return `${this.publicUrl}/${identifier}`;
    }
}
