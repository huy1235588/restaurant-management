/**
 * Upload Middleware
 * Handles file uploads with Multer
 * Optimized for better performance and maintainability
 */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import {
    UPLOAD_DIRS,
    ALLOWED_MIME_TYPES,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    FileCategory
} from '../constants/upload.constants';
import { AppError } from '@/shared/utils/errors';

// Ensure all upload directories exist on startup
Object.values(UPLOAD_DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});


/**
 * Generate unique filename with better format
 */
const generateFileName = (originalName: string): string => {
    const ext = path.extname(originalName).toLowerCase();
    return `${randomUUID()}${ext}`;
};

/**
 * Configure storage
 */
const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        // Always save to temp first, then LocalStorageProvider will move to the correct folder
        // This is because req.body is not fully parsed when multer processes the file
        const uploadPath = UPLOAD_DIRS.TEMP;

        // Directory already exists from initialization above
        cb(null, uploadPath);
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const fileName = generateFileName(file.originalname);
        cb(null, fileName);
    }
});

/**
 * File filter - validate file type
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const category = (req.body.category || 'image') as FileCategory;

    // Get allowed types based on category
    let allowedMimeTypes: readonly string[] = [];
    let allowedExtensions: readonly string[] = [];

    switch (category) {
        case FileCategory.IMAGE:
            allowedMimeTypes = ALLOWED_MIME_TYPES.IMAGE;
            allowedExtensions = ALLOWED_EXTENSIONS.IMAGE;
            break;
        case FileCategory.DOCUMENT:
            allowedMimeTypes = ALLOWED_MIME_TYPES.DOCUMENT;
            allowedExtensions = ALLOWED_EXTENSIONS.DOCUMENT;
            break;
        case FileCategory.VIDEO:
            allowedMimeTypes = ALLOWED_MIME_TYPES.VIDEO;
            allowedExtensions = ALLOWED_EXTENSIONS.VIDEO;
            break;
        default:
            // Default to image
            allowedMimeTypes = ALLOWED_MIME_TYPES.IMAGE;
            allowedExtensions = ALLOWED_EXTENSIONS.IMAGE;
    }

    // Check mime type
    const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype);

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const isExtensionValid = allowedExtensions.includes(ext);

    if (isMimeTypeValid && isExtensionValid) {
        cb(null, true);
    } else {
        cb(new AppError(
            `Invalid file type. Allowed types for ${category}: ${allowedExtensions.join(', ')}`,
            400
        ));
    }
};

/**
 * Multer configuration with dynamic limits based on category
 */
const createUpload = (category?: FileCategory) => {
    let maxFileSize = MAX_FILE_SIZE.IMAGE; // Default

    if (category) {
        switch (category) {
            case FileCategory.IMAGE:
                maxFileSize = MAX_FILE_SIZE.IMAGE;
                break;
            case FileCategory.DOCUMENT:
                maxFileSize = MAX_FILE_SIZE.DOCUMENT;
                break;
            case FileCategory.VIDEO:
                maxFileSize = MAX_FILE_SIZE.VIDEO;
                break;
        }
    }

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxFileSize,
            files: 10, // Max 10 files per request
        },
    });
};

/**
 * Upload single file middleware
 */
export const uploadSingle = (fieldName: string = 'file', category?: FileCategory) => {
    return createUpload(category).single(fieldName);
};

/**
 * Upload multiple files middleware
 */
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 10, category?: FileCategory) => {
    return createUpload(category).array(fieldName, maxCount);
};

/**
 * Upload fields (multiple fields with different names)
 */
export const uploadFields = (fields: { name: string; maxCount: number }[], category?: FileCategory) => {
    return createUpload(category).fields(fields);
};

/**
 * Middleware to handle multer errors
 */
export const handleUploadError = (error: any, _req: Request, _res: Response, next: NextFunction) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('File size exceeds the maximum limit', 400));
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError('Too many files uploaded', 400));
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new AppError('Unexpected field in upload', 400));
        }
    }
    next(error);
};

/**
 * Helper: Get file URL from file path
 */
export const getFileUrl = (filePath: string): string => {
    if (!filePath) return '';

    // If already a URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('/uploads/')) {
        return filePath;
    }

    // Extract relative path from uploads directory
    const uploadsIndex = filePath.indexOf('uploads');
    if (uploadsIndex !== -1) {
        const relativePath = filePath.substring(uploadsIndex).replace(/\\/g, '/');
        return `/${relativePath}`;
    }

    return filePath;
};

/**
 * Helper: Get full file path from URL or relative path
 */
export const getFilePath = (fileUrl: string): string => {
    if (!fileUrl) return '';

    // Remove /uploads/ prefix if exists
    const relativePath = fileUrl.replace(/^\/uploads\//, '');
    return path.join(UPLOAD_DIRS.IMAGES, '..', relativePath);
};

/**
 * Helper: Delete a file
 */
export const deleteFile = (filePath: string): boolean => {
    try {
        const fullPath = path.isAbsolute(filePath) ? filePath : getFilePath(filePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

/**
 * Helper: Replace old file with new one (delete old, keep new)
 */
export const replaceFile = (oldFilePath: string | null | undefined, newFilePath: string): void => {
    if (oldFilePath && oldFilePath !== newFilePath) {
        deleteFile(oldFilePath);
    }
};

/**
 * Helper: Cleanup temporary files older than specified hours
 */
export const cleanupTempFiles = (hoursOld: number = 24): number => {
    try {
        const files = fs.readdirSync(UPLOAD_DIRS.TEMP);
        const now = Date.now();
        const maxAge = hoursOld * 60 * 60 * 1000;
        let deletedCount = 0;

        files.forEach(file => {
            const filePath = path.join(UPLOAD_DIRS.TEMP, file);
            const stats = fs.statSync(filePath);
            const age = now - stats.mtimeMs;

            if (age > maxAge) {
                if (deleteFile(filePath)) {
                    deletedCount++;
                }
            }
        });

        return deletedCount;
    } catch (error) {
        console.error('Error cleaning up temp files:', error);
        return 0;
    }
};

/**
 * Helper: Move file from temp to permanent location
 */
export const moveFileFromTemp = (tempFileName: string, targetFolder: keyof typeof UPLOAD_DIRS): string | null => {
    try {
        const sourcePath = path.join(UPLOAD_DIRS.TEMP, tempFileName);
        const targetDir = UPLOAD_DIRS[targetFolder];
        const targetPath = path.join(targetDir, tempFileName);

        if (!fs.existsSync(sourcePath)) {
            console.error('Source file does not exist:', sourcePath);
            return null;
        }

        // Ensure target directory exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Move file
        fs.renameSync(sourcePath, targetPath);

        return getFileUrl(targetPath);
    } catch (error) {
        console.error('Error moving file from temp:', error);
        return null;
    }
};
