import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/types';

export interface UploadedFileInfo {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    url: string;
    uploadedAt: string;
}

export interface UploadResponse {
    success: boolean;
    message: string;
    data: UploadedFileInfo | { files: UploadedFileInfo[]; count: number };
}

export type UploadFolder = 'temp' | 'menu' | 'staff' | 'documents' | 'images' | 'others';
export type UploadCategory = 'image' | 'document' | 'video';

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
     * @param category - File category (default: 'image')
     * @returns UploadedFileInfo with file details and URL
     */
    uploadSingle: async (
        file: File,
        folder: UploadFolder = 'temp',
        category: UploadCategory = 'image'
    ): Promise<UploadedFileInfo> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        formData.append('category', category);

        try {
            const response = await axiosInstance.post<UploadResponse>(
                '/storage/upload/single',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Upload failed');
            }

            return response.data.data as UploadedFileInfo;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
            throw new Error(errorMessage);
        }
    },

    /**
     * Upload multiple files
     * @param files - Files to upload (max 10 files)
     * @param folder - Target folder (default: 'temp')
     * @param category - File category (default: 'image')
     * @returns Array of UploadedFileInfo for each uploaded file
     */
    uploadMultiple: async (
        files: File[],
        folder: UploadFolder = 'temp',
        category: UploadCategory = 'image'
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
        formData.append('category', category);

        try {
            const response = await axiosInstance.post<UploadResponse>(
                '/api/storage/upload/multiple',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Upload failed');
            }

            const data = response.data.data as { files: UploadedFileInfo[]; count: number };
            return data.files;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
            throw new Error(errorMessage);
        }
    },

    /**
     * Delete a file
     * @param filePath - File path to delete (e.g., 'uploads/menu/file.jpg')
     */
    deleteFile: async (filePath: string): Promise<void> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(
                '/api/storage/upload',
                {
                    data: { filePath },
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Delete failed');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Delete failed';
            throw new Error(errorMessage);
        }
    },

    /**
     * Get current storage status
     */
    getStatus: async () => {
        try {
            const response = await axiosInstance.get<ApiResponse<any>>(
                '/api/storage/status'
            );
            return response.data.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message;
            throw new Error(errorMessage);
        }
    },

    /**
     * Get current storage type (local or cloudinary)
     */
    getCurrentType: async () => {
        try {
            const response = await axiosInstance.get<ApiResponse<{ storageType: string }>>(
                '/api/storage/current'
            );
            return response.data.data.storageType;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message;
            throw new Error(errorMessage);
        }
    },
};
