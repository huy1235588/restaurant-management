import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/types';

/**
 * Upload result interface - matches backend UploadResult
 * Contains all information about an uploaded file
 */
export interface UploadedFileInfo {
    filename: string;        // Generated unique filename
    originalName: string;    // Original filename from user
    path: string;           // Relative path or cloud storage identifier
    size: number;           // File size in bytes
    mimetype: string;       // MIME type (e.g., 'image/jpeg')
    url: string;            // Full URL to access the file
    uploadedAt: string;     // ISO timestamp of upload
    publicId?: string;      // Cloud storage public ID (Cloudinary/R2)
}

export type UploadFolder = 'temp' | 'menu' | "categories" | 'staff' | 'documents' | 'images' | 'others';

/**
 * Upload service for handling file uploads to the server
 * Supports both single and multiple file uploads
 * Integrates with the storage system (local or Cloudinary)
 */
export const uploadApi = {
    /**
     * Upload a single file
     * @param file - File to upload
     * @param folder - Target folder (default: 'temp')
     * @returns UploadedFileInfo with file details and URL
     */
    uploadSingle: async (
        file: File,
        folder: UploadFolder = 'temp'
    ): Promise<UploadedFileInfo> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const response = await axiosInstance.post<ApiResponse<UploadedFileInfo>>(
                '/storage/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
            throw new Error(errorMessage);
        }
    },

    /**
     * Upload multiple files
     * @param files - Files to upload (max 10 files)
     * @param folder - Target folder (default: 'temp')
     * @returns Array of UploadedFileInfo for each uploaded file
     */
    uploadMultiple: async (
        files: File[],
        folder: UploadFolder = 'temp'
    ): Promise<UploadedFileInfo[]> => {
        if (files.length === 0) {
            throw new Error('No files provided');
        }

        if (files.length > 10) {
            throw new Error('Maximum 10 files can be uploaded at once');
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('folder', folder);

        try {
            const response = await axiosInstance.post<ApiResponse<UploadedFileInfo[]>>(
                '/storage/upload-multiple',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
            throw new Error(errorMessage);
        }
    },

    /**
     * Delete a file
     * @param filePath - File path to delete (e.g., 'uploads/menu/file.jpg')
     */
    deleteFile: async (identifier: string): Promise<void> => {
        try {
            // URL encode the identifier to handle special characters
            const encodedIdentifier = encodeURIComponent(identifier);
            const response = await axiosInstance.delete<ApiResponse<null>>(
                `/storage/${encodedIdentifier}`
            );
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Delete failed';
            throw new Error(errorMessage);
        }
    },
};
