/**
 * Upload Service Types
 * Type definitions for file upload operations
 */

/**
 * Upload configuration options
 */
export interface UploadConfig {
    maxFileSize?: number;
    allowedMimeTypes?: readonly string[];
    allowedExtensions?: readonly string[];
    destination?: string;
    fileNamePrefix?: string;
    preserveOriginalName?: boolean;
}

/**
 * File validation result
 */
export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Uploaded file information
 */
export interface UploadedFileInfo {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    url: string;
    uploadedAt: Date;
}

/**
 * Multiple files upload result
 */
export interface MultipleUploadResult {
    files: UploadedFileInfo[];
    errors: Array<{
        filename: string;
        error: string;
    }>;
}
