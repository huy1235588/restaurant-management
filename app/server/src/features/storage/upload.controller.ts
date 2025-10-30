/**
 * Upload Controller
 * Handles file upload endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { uploadService } from '@/features/storage/services/upload.service';
import { ApiResponse } from '@/shared/utils/response';
import { AppError } from '@/shared/utils/errors';

export class UploadController {
    /**
     * Upload single file
     */
    async uploadSingle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                throw new AppError('No file provided', 400);
            }

            const folder = req.body.folder || 'temp';
            const fileInfo = await uploadService.uploadFile(req.file, folder);

            res.status(201).json(
                ApiResponse.success(fileInfo, 'File uploaded successfully')
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload multiple files
     */
    async uploadMultiple(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                throw new AppError('No files provided', 400);
            }

            const folder = req.body.folder || 'temp';
            const filesInfo = await uploadService.uploadFiles(req.files, folder);

            res.status(201).json(
                ApiResponse.success(
                    { files: filesInfo, count: filesInfo.length },
                    'Files uploaded successfully'
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete file
     */
    async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { filePath } = req.body;

            if (!filePath) {
                throw new AppError('File path is required', 400);
            }

            const success = await uploadService.deleteFile(filePath);

            if (success) {
                res.json(ApiResponse.success(null, 'File deleted successfully'));
            } else {
                throw new AppError('Failed to delete file', 500);
            }
        } catch (error) {
            next(error);
        }
    }
}

export const uploadController = new UploadController();
