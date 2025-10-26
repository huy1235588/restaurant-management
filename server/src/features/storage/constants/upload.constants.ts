/**
 * Upload Service Constants
 * Defines file upload configurations and validation rules
 */

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZE = {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * Allowed MIME types for different file categories
 */
export const ALLOWED_MIME_TYPES = {
    IMAGE: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
    ],
    DOCUMENT: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
    ],
    VIDEO: [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
    ],
} as const;

/**
 * Allowed file extensions
 */
export const ALLOWED_EXTENSIONS = {
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    DOCUMENT: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
    VIDEO: ['.mp4', '.mpeg', '.mov', '.avi', '.webm'],
} as const;

/**
 * Upload directories
 */
export const UPLOAD_DIRS = {
    IMAGES: 'uploads/images',
    MENU: 'uploads/menu',
    STAFF: 'uploads/staff',
    DOCUMENTS: 'uploads/documents',
    TEMP: 'uploads/temp',
    OTHERS: 'uploads/others',
} as const;

/**
 * File categories
 */
export enum FileCategory {
    IMAGE = 'image',
    DOCUMENT = 'document',
    VIDEO = 'video',
}

/**
 * Upload error messages
 */
export const UPLOAD_ERRORS = {
    FILE_TOO_LARGE: 'File size exceeds the maximum limit',
    INVALID_FILE_TYPE: 'Invalid file type',
    INVALID_FILE_EXTENSION: 'Invalid file extension',
    NO_FILE_PROVIDED: 'No file provided',
    UPLOAD_FAILED: 'File upload failed',
    DELETE_FAILED: 'File deletion failed',
    MULTIPLE_FILES_NOT_ALLOWED: 'Multiple files are not allowed',
} as const;
