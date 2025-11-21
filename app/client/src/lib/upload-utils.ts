/**
 * Upload Utilities and Examples
 * Các hàm tiện ích để sử dụng upload trong ứng dụng
 */

import { uploadApi, UploadFolder, UploadCategory } from '@/services/upload.service';

/**
 * Validate file trước upload
 * @param file - File cần validate
 * @param category - Loại file
 * @returns true nếu hợp lệ, false nếu không
 */
export function validateFile(
    file: File,
    category: UploadCategory = 'image'
): { valid: boolean; error?: string } {
    const MAX_SIZES: Record<UploadCategory, number> = {
        image: 5 * 1024 * 1024,    // 5MB
        document: 10 * 1024 * 1024, // 10MB
        video: 50 * 1024 * 1024,    // 50MB
    };

    const ALLOWED_TYPES: Record<UploadCategory, string[]> = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        document: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
        ],
        video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    };

    // Check size
    if (file.size > MAX_SIZES[category]) {
        return {
            valid: false,
            error: `File size exceeds ${MAX_SIZES[category] / 1024 / 1024}MB limit`,
        };
    }

    // Check type
    if (!ALLOWED_TYPES[category].includes(file.type)) {
        return {
            valid: false,
            error: `File type not allowed. Expected: ${ALLOWED_TYPES[category].join(', ')}`,
        };
    }

    return { valid: true };
}

/**
 * Format file size to readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "5.2 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file category from MIME type
 * @param mimeType - File MIME type
 * @returns Category: 'image' | 'document' | 'video'
 */
export function getCategoryFromMime(mimeType: string): UploadCategory {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
}

/**
 * Generate unique filename
 * @param originalName - Original filename
 * @returns Unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop() || 'file';
    return `${timestamp}_${random}.${extension}`;
}

/**
 * Upload with retry mechanism
 * @param file - File to upload
 * @param folder - Target folder
 * @param category - File category
 * @param maxRetries - Maximum retry attempts
 */
export async function uploadWithRetry(
    file: File,
    folder: UploadFolder = 'temp',
    category: UploadCategory = 'image',
    maxRetries: number = 3
) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Upload attempt ${attempt}/${maxRetries}...`);
            return await uploadApi.uploadSingle(file, folder, category);
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            // Wait before retry (exponential backoff)
            const waitTime = Math.pow(2, attempt - 1) * 1000;
            console.log(`Retrying after ${waitTime}ms...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    }
}

/**
 * Delete uploaded file
 * @param filePath - File path to delete
 */
export async function deleteUploadedFile(filePath: string): Promise<void> {
    try {
        await uploadApi.deleteFile(filePath);
        console.log('File deleted successfully:', filePath);
    } catch (error) {
        console.error('Failed to delete file:', error);
        throw error;
    }
}

/**
 * Convert data URL to File
 * Useful for canvas or cropped images
 * @param dataUrl - Data URL string
 * @param filename - Filename
 * @returns File object
 */
export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
}

/**
 * Batch upload multiple files with progress tracking
 * @param files - Files to upload
 * @param folder - Target folder
 * @param category - File category
 * @param onProgress - Callback for progress (current, total)
 */
export async function batchUpload(
    files: File[],
    folder: UploadFolder = 'temp',
    category: UploadCategory = 'image',
    onProgress?: (current: number, total: number) => void
) {
    const results = [];

    for (let i = 0; i < files.length; i++) {
        try {
            const uploadedFile = await uploadApi.uploadSingle(files[i], folder, category);
            results.push({
                success: true,
                file: uploadedFile,
                error: null,
            });
        } catch (error) {
            results.push({
                success: false,
                file: null,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }

        onProgress?.(i + 1, files.length);
    }

    return results;
}

/**
 * Get file info from uploaded file info
 * @param uploadedFileInfo - Uploaded file info from API
 */
export function getFileInfo(uploadedFileInfo: any) {
    return {
        url: uploadedFileInfo.url,
        path: uploadedFileInfo.path,
        size: formatFileSize(uploadedFileInfo.size),
        name: uploadedFileInfo.originalName,
        uploadedAt: new Date(uploadedFileInfo.uploadedAt).toLocaleString(),
    };
}

/**
 * Type for upload result
 */
export type UploadResult = {
    success: boolean;
    file?: any;
    error?: string;
};

/**
 * Type for batch upload results
 */
export type BatchUploadResults = UploadResult[];
