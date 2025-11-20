export interface UploadResult {
    url: string;
    publicId?: string;
    filename: string;
    size: number;
    mimetype: string;
}

export interface IStorageService {
    uploadFile(
        file: Express.Multer.File,
        folder?: string,
    ): Promise<UploadResult>;
    deleteFile(identifier: string): Promise<void>;
    getFileUrl(identifier: string): string;
}
