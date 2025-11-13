/**
 * Storage Routes
 * Endpoints for managing storage configuration
 */

import { Router } from 'express';
import { storageController } from '@/features/storage/storage.controller';
import { uploadController } from '@/features/storage/upload.controller';
import { authenticate } from '@/shared/middlewares/auth';
import { uploadSingle, uploadMultiple, handleUploadError } from '@/features/storage/middlewares/upload.middleware';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /storage/status:
 *   get:
 *     summary: Get storage status
 *     description: Get the current storage provider status and configuration
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Storage status retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     primary:
 *                       type: string
 *                       enum: [local, cloudinary]
 *                       example: local
 *                     primaryAvailable:
 *                       type: boolean
 *                       example: true
 *                     fallback:
 *                       type: string
 *                       enum: [local, cloudinary]
 *                       example: cloudinary
 *                     fallbackAvailable:
 *                       type: boolean
 *                       example: false
 *                     currentType:
 *                       type: string
 *                       enum: [local, cloudinary]
 *                       example: local
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/status', storageController.getStatus.bind(storageController));

/**
 * @swagger
 * /storage/current:
 *   get:
 *     summary: Get current storage type
 *     description: Get the current active storage type
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current storage type retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     storageType:
 *                       type: string
 *                       enum: [local, cloudinary]
 *       401:
 *         description: Unauthorized
 */
router.get('/current', storageController.getCurrentType.bind(storageController));

/**
 * @swagger
 * /storage/switch:
 *   post:
 *     summary: Switch storage provider
 *     description: Switch between local and Cloudinary storage providers
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [local, cloudinary]
 *                 description: The storage provider to switch to
 *                 example: cloudinary
 *     responses:
 *       200:
 *         description: Storage provider switched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Storage provider switched to cloudinary
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid provider or provider not available
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/switch', storageController.switchProvider.bind(storageController));

/**
 * @swagger
 * /storage/upload/single:
 *   post:
 *     summary: Upload single file
 *     description: Upload a single file to storage
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 enum: [temp, menu, staff, documents, images, others]
 *                 default: temp
 *               category:
 *                 type: string
 *                 enum: [image, document, video]
 *                 default: image
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file provided or invalid file
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/upload/single',
    uploadSingle('file'),
    handleUploadError,
    uploadController.uploadSingle.bind(uploadController)
);

/**
 * @swagger
 * /storage/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     description: Upload multiple files to storage
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 enum: [temp, menu, staff, documents, images, others]
 *                 default: temp
 *               category:
 *                 type: string
 *                 enum: [image, document, video]
 *                 default: image
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: No files provided
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/upload/multiple',
    uploadMultiple('files', 10),
    handleUploadError,
    uploadController.uploadMultiple.bind(uploadController)
);

/**
 * @swagger
 * /storage/upload:
 *   delete:
 *     summary: Delete file
 *     description: Delete a file from storage
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filePath
 *             properties:
 *               filePath:
 *                 type: string
 *                 example: uploads/menu/image-1234567890.jpg
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: File path is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to delete file
 */
router.delete(
    '/upload',
    uploadController.deleteFile.bind(uploadController)
);

export default router;
