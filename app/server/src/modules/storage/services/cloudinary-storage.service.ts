import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import {
    IStorageService,
    UploadResult,
} from '@/modules/storage/interfaces/storage-service.interface';

@Injectable()
export class CloudinaryStorageService implements IStorageService {
    private readonly logger = new Logger(CloudinaryStorageService.name);

    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>(
                'storage.cloudinary.cloudName',
            ),
            api_key: this.configService.get<string>(
                'storage.cloudinary.apiKey',
            ),
            api_secret: this.configService.get<string>(
                'storage.cloudinary.apiSecret',
            ),
        });
    }

    async uploadFile(
        file: Express.Multer.File,
        folder = 'general',
    ): Promise<UploadResult> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'auto',
                },
                (error, result: UploadApiResponse | undefined) => {
                    if (error) {
                        this.logger.error(
                            'Failed to upload file to Cloudinary',
                            error,
                        );
                        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                        return reject(error);
                    }

                    if (!result) {
                        return reject(new Error('Upload result is undefined'));
                    }

                    this.logger.log(
                        `File uploaded to Cloudinary: ${result.public_id}`,
                    );

                    resolve({
                        filename: result.original_filename || file.originalname,
                        originalName: file.originalname,
                        path: result.public_id,
                        size: result.bytes,
                        mimetype: file.mimetype,
                        url: result.secure_url,
                        uploadedAt: new Date().toISOString(),
                        publicId: result.public_id,
                    });
                },
            );

            uploadStream.end(file.buffer);
        });
    }

    async deleteFile(identifier: string): Promise<void> {
        try {
            // identifier should be the public_id
            await cloudinary.uploader.destroy(identifier);

            this.logger.log(`File deleted from Cloudinary: ${identifier}`);
        } catch (error) {
            this.logger.error('Failed to delete file from Cloudinary', error);
            throw error;
        }
    }

    getFileUrl(identifier: string): string {
        // If identifier is already a URL, return it
        if (identifier.startsWith('http')) {
            return identifier;
        }

        // Otherwise, construct Cloudinary URL
        const cloudName = this.configService.get<string>(
            'storage.cloudinary.cloudName',
        );
        return `https://res.cloudinary.com/${cloudName}/image/upload/${identifier}`;
    }
}
