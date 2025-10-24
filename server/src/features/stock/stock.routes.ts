import { Router } from 'express';
import stockController from './stock.controller';
import { authenticate, authorize } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import {
    createStockTransactionSchema,
    stockAdjustmentSchema,
    resolveStockAlertSchema,
} from '@/features/stock/validators/stock.validator';

const router = Router();

// ============================================
// STOCK TRANSACTION ROUTES
// ============================================

/**
 * @swagger
 * /stock/transactions:
 *   get:
 *     summary: Get all stock transactions
 *     description: Retrieve a list of all stock transactions with optional filters
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: ingredientId
 *         schema:
 *           type: integer
 *         description: Filter by ingredient ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [in, out, adjustment]
 *         description: Filter by transaction type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Stock transactions retrieved successfully
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
 *                   example: Stock transactions retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       ingredientId:
 *                         type: integer
 *                       type:
 *                         type: string
 *                         enum: [in, out, adjustment]
 *                       quantity:
 *                         type: number
 *                       reason:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/transactions',
    authenticate,
    authorize('admin', 'manager'),
    stockController.getAllTransactions.bind(stockController)
);

/**
 * @swagger
 * /stock/transactions:
 *   post:
 *     summary: Create manual stock transaction
 *     description: Create a manual stock transaction (in/out/adjustment)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ingredientId
 *               - type
 *               - quantity
 *               - reason
 *             properties:
 *               ingredientId:
 *                 type: integer
 *                 description: Ingredient ID
 *               type:
 *                 type: string
 *                 enum: [in, out, adjustment]
 *                 description: Transaction type
 *               quantity:
 *                 type: number
 *                 description: Quantity (positive for in, negative for out)
 *               reason:
 *                 type: string
 *                 description: Reason for the transaction
 *     responses:
 *       201:
 *         description: Stock transaction created successfully
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
 *                   example: Stock transaction created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     ingredientId:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     reason:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    '/transactions',
    authenticate,
    authorize('admin', 'manager'),
    validate(createStockTransactionSchema),
    stockController.createTransaction.bind(stockController)
);

/**
 * @swagger
 * /stock/adjust:
 *   post:
 *     summary: Adjust stock
 *     description: Perform stock adjustment (inventory count)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adjustments
 *             properties:
 *               adjustments:
 *                 type: array
 *                 description: List of stock adjustments
 *                 items:
 *                   type: object
 *                   required:
 *                     - ingredientId
 *                     - actualStock
 *                   properties:
 *                     ingredientId:
 *                       type: integer
 *                       description: Ingredient ID
 *                     actualStock:
 *                       type: number
 *                       description: Actual stock count
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
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
 *                   example: Stock adjusted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    '/adjust',
    authenticate,
    authorize('admin', 'manager'),
    validate(stockAdjustmentSchema),
    stockController.adjustStock.bind(stockController)
);

/**
 * @swagger
 * /stock/deduct:
 *   post:
 *     summary: Deduct stock for order
 *     description: Deduct stock quantities for an order (usually automatic)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - items
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: Order ID
 *               items:
 *                 type: array
 *                 description: List of items to deduct
 *                 items:
 *                   type: object
 *                   required:
 *                     - ingredientId
 *                     - quantity
 *                   properties:
 *                     ingredientId:
 *                       type: integer
 *                       description: Ingredient ID
 *                     quantity:
 *                       type: number
 *                       description: Quantity to deduct
 *     responses:
 *       200:
 *         description: Stock deducted successfully
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
 *                   example: Stock deducted successfully
 *       400:
 *         description: Bad request or insufficient stock
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    '/deduct',
    authenticate,
    authorize('admin', 'manager', 'waiter'),
    stockController.deductStock.bind(stockController)
);

// ============================================
// BATCH ROUTES
// ============================================

/**
 * @swagger
 * /stock/batches:
 *   get:
 *     summary: Get all ingredient batches
 *     description: Retrieve a list of all ingredient batches
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: ingredientId
 *         schema:
 *           type: integer
 *         description: Filter by ingredient ID
 *     responses:
 *       200:
 *         description: Ingredient batches retrieved successfully
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
 *                   example: Ingredient batches retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       ingredientId:
 *                         type: integer
 *                       batchNumber:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       expiryDate:
 *                         type: string
 *                         format: date
 *                       receivedDate:
 *                         type: string
 *                         format: date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/batches',
    authenticate,
    authorize('admin', 'manager'),
    stockController.getAllBatches.bind(stockController)
);

/**
 * @swagger
 * /stock/batches/expiring:
 *   get:
 *     summary: Get expiring batches
 *     description: Retrieve batches that are expiring within the next N days
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to check for expiring batches
 *     responses:
 *       200:
 *         description: Expiring batches retrieved successfully
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
 *                   example: Expiring batches retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       ingredientId:
 *                         type: integer
 *                       batchNumber:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       expiryDate:
 *                         type: string
 *                         format: date
 *                       daysUntilExpiry:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/batches/expiring',
    authenticate,
    authorize('admin', 'manager'),
    stockController.getExpiringBatches.bind(stockController)
);

/**
 * @swagger
 * /stock/batches/expired:
 *   get:
 *     summary: Get expired batches
 *     description: Retrieve batches that have already expired
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired batches retrieved successfully
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
 *                   example: Expired batches retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       ingredientId:
 *                         type: integer
 *                       batchNumber:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       expiryDate:
 *                         type: string
 *                         format: date
 *                       daysExpired:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/batches/expired',
    authenticate,
    authorize('admin', 'manager'),
    stockController.getExpiredBatches.bind(stockController)
);

// ============================================
// ALERT ROUTES
// ============================================

/**
 * @swagger
 * /stock/alerts:
 *   get:
 *     summary: Get all stock alerts
 *     description: Retrieve a list of all stock alerts
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [low_stock, expiry, expired]
 *         description: Filter by alert type
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: boolean
 *         description: Filter by resolved status
 *     responses:
 *       200:
 *         description: Stock alerts retrieved successfully
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
 *                   example: Stock alerts retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       ingredientId:
 *                         type: integer
 *                       type:
 *                         type: string
 *                         enum: [low_stock, expiry, expired]
 *                       message:
 *                         type: string
 *                       resolved:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       resolvedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/alerts',
    authenticate,
    authorize('admin', 'manager'),
    stockController.getAllAlerts.bind(stockController)
);

/**
 * @swagger
 * /stock/alerts/{id}/resolve:
 *   post:
 *     summary: Resolve stock alert
 *     description: Mark a stock alert as resolved
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 description: Action taken to resolve the alert
 *                 example: "Restocked ingredient"
 *     responses:
 *       200:
 *         description: Alert resolved successfully
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
 *                   example: Alert resolved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Alert not found
 */
router.post(
    '/alerts/:id/resolve',
    authenticate,
    authorize('admin', 'manager'),
    validate(resolveStockAlertSchema),
    stockController.resolveAlert.bind(stockController)
);

/**
 * @swagger
 * /stock/alerts/check:
 *   post:
 *     summary: Check and create alerts
 *     description: Check stock levels and expiry dates, create alerts if necessary (can be run as cron job)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alerts checked successfully
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
 *                   example: Alerts checked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     alertsCreated:
 *                       type: integer
 *                       description: Number of new alerts created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    '/alerts/check',
    authenticate,
    authorize('admin'),
    stockController.checkAlerts.bind(stockController)
);

export default router;
