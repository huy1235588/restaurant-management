/**
 * Storage Feature Exports
 * Consolidated upload and storage functionality
 */

// Controllers
export { StorageController, storageController } from './storage.controller';

// Routes
export { default as storageRoutes } from './storage.routes';

// Services
export { uploadService } from './services/upload.service';
export { storageManager } from './services/storage/storage.manager';
export { localStorageProvider } from './services/storage/local.storage';
export { cloudinaryStorageProvider } from './services/storage/cloudinary.storage';

// Upload middlewares
export {
    uploadSingle,
    uploadMultiple,
    uploadFields,
    handleUploadError,
    getFileUrl,
    getFilePath,
    deleteFile,
    replaceFile,
    cleanupTempFiles,
    moveFileFromTemp,
} from './middlewares/upload.middleware';

// Types
export type { UploadedFileInfo, MultipleUploadResult, UploadConfig, FileValidationResult } from './types/upload.types';
export type { StorageUploadResult, StorageDeleteResult, StorageProvider, StorageType } from './services/storage/storage.interface';

// Constants
export { MAX_FILE_SIZE, ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, UPLOAD_DIRS, FileCategory, UPLOAD_ERRORS } from './constants/upload.constants';

