export interface UploadResult {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    url: string;
    uploadedAt: string;
    publicId?: string; // For cloud storage providers
}

export interface IStorageService {
    uploadFile(
        file: Express.Multer.File,
        folder?: string,
    ): Promise<UploadResult>;
    deleteFile(identifier: string): Promise<void>;
    getFileUrl(identifier: string): string;
}
