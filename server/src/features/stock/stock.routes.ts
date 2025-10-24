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
 * @route   GET /api/stock/transactions
 * @desc    Get all stock transactions with filters
 * @access  Private (manager, admin)
 */
router.get(
    '/transactions',
    authenticate,
    authorize('admin', 'manager'),
    stockController.getAllTransactions.bind(stockController)
);

/**
 * @route   POST /api/stock/transactions
 * @desc    Create manual stock transaction
 * @access  Private (manager, admin)
 */
router.post(
    '/transactions',
    authenticate,
    authorize('admin', 'manager'),
    validate(createStockTransactionSchema),
    stockController.createTransaction.bind(stockController)
);

/**
 * @route   POST /api/stock/adjust
 * @desc    Adjust stock (inventory count/kiểm kê)
 * @access  Private (manager, admin)
 */
router.post(
    '/adjust',
    authenticate,
    authorize('admin', 'manager'),
    validate(stockAdjustmentSchema),
    stockController.adjustStock.bind(stockController)
);

/**
 * @route   POST /api/stock/deduct
 * @desc    Deduct stock for order (usually automatic)
 * @access  Private (manager, admin, waiter)
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
 * @route   GET /api/stock/batches
 * @desc    Get all ingredient batches
 * @access  Private (manager, admin)
 */
router.get(
    '/batches',
    authenticate,
    authorize('admin', 'manager'),
    stockController.getAllBatches.bind(stockController)
);

/**
 * @route   GET /api/stock/batches/expiring
 * @desc    Get expiring batches (next N days)
 * @access  Private (manager, admin)
 */
router.get(
    '/batches/expiring',
    authenticate,
    authorize('admin', 'manager'),
    stockController.getExpiringBatches.bind(stockController)
);

/**
 * @route   GET /api/stock/batches/expired
 * @desc    Get expired batches
 * @access  Private (manager, admin)
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
 * @route   GET /api/stock/alerts
 * @desc    Get all stock alerts
 * @access  Private (manager, admin)
 */
router.get(
    '/alerts',
    authenticate,
    authorize('admin', 'manager'),
    stockController.getAllAlerts.bind(stockController)
);

/**
 * @route   POST /api/stock/alerts/:id/resolve
 * @desc    Resolve stock alert
 * @access  Private (manager, admin)
 */
router.post(
    '/alerts/:id/resolve',
    authenticate,
    authorize('admin', 'manager'),
    validate(resolveStockAlertSchema),
    stockController.resolveAlert.bind(stockController)
);

/**
 * @route   POST /api/stock/alerts/check
 * @desc    Check and create alerts (can be run as cron job)
 * @access  Private (admin)
 */
router.post(
    '/alerts/check',
    authenticate,
    authorize('admin'),
    stockController.checkAlerts.bind(stockController)
);

export default router;
