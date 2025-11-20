/**
 * Storage Provider Interface
 * Defines contract for different storage providers (Local, Cloudinary, R2, etc)
 */

export interface StorageUploadResult {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    url: string;
}

export interface StorageDeleteResult {
    success: boolean;
    message: string;
    deletedPath?: string;
}

export interface StorageProvider {
    /**
     * Upload file to storage
     */
    upload(file: Express.Multer.File, folder?: string): Promise<StorageUploadResult>;

    /**
     * Delete file from storage
     */
    delete(filePath: string): Promise<StorageDeleteResult>;

    /**
     * Check if provider is available/connected
     */
    isAvailable(): Promise<boolean>;

    /**
     * Get provider name
     */
    getName(): string;
}

// 'cloudinary' is legacy/outdated, use 'r2' instead
export type StorageType = 'local' | 'cloudinary' | 'r2';
