import { Router } from 'express';
import purchaseController from './purchase.controller';
import { authenticate, authorize } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import {
    createPurchaseOrderSchema,
    updatePurchaseOrderSchema,
    receivePurchaseOrderSchema,
} from '@/features/purchase/validators/purchase-order.validator';
import {
    createSupplierSchema,
    updateSupplierSchema,
} from '@/features/purchase/validators/supplier.validator';

const router = Router();

// ============================================
// PURCHASE ORDER ROUTES
// ============================================

/**
 * @route   GET /api/purchase-orders
 * @desc    Get all purchase orders with filters
 * @access  Private (manager, admin)
 */
router.get(
    '/',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getAllPurchaseOrders.bind(purchaseController)
);

/**
 * @route   GET /api/purchase-orders/pending
 * @desc    Get pending purchase orders
 * @access  Private (manager, admin)
 */
router.get(
    '/pending',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getPendingOrders.bind(purchaseController)
);

/**
 * @route   GET /api/purchase-orders/number/:orderNumber
 * @desc    Get purchase order by order number
 * @access  Private (manager, admin)
 */
router.get(
    '/number/:orderNumber',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getPurchaseOrderByNumber.bind(purchaseController)
);

/**
 * @route   GET /api/purchase-orders/:id
 * @desc    Get purchase order by ID
 * @access  Private (manager, admin)
 */
router.get(
    '/:id',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getPurchaseOrderById.bind(purchaseController)
);

/**
 * @route   POST /api/purchase-orders
 * @desc    Create new purchase order
 * @access  Private (manager, admin)
 */
router.post(
    '/',
    authenticate,
    authorize('admin', 'manager'),
    validate(createPurchaseOrderSchema),
    purchaseController.createPurchaseOrder.bind(purchaseController)
);

/**
 * @route   PATCH /api/purchase-orders/:id
 * @desc    Update purchase order
 * @access  Private (manager, admin)
 */
router.patch(
    '/:id',
    authenticate,
    authorize('admin', 'manager'),
    validate(updatePurchaseOrderSchema),
    purchaseController.updatePurchaseOrder.bind(purchaseController)
);

/**
 * @route   POST /api/purchase-orders/:id/receive
 * @desc    Receive purchase order (mark as received and update stock)
 * @access  Private (manager, admin)
 */
router.post(
    '/:id/receive',
    authenticate,
    authorize('admin', 'manager'),
    validate(receivePurchaseOrderSchema),
    purchaseController.receivePurchaseOrder.bind(purchaseController)
);

/**
 * @route   POST /api/purchase-orders/:id/cancel
 * @desc    Cancel purchase order
 * @access  Private (manager, admin)
 */
router.post(
    '/:id/cancel',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.cancelPurchaseOrder.bind(purchaseController)
);

/**
 * @route   DELETE /api/purchase-orders/:id
 * @desc    Delete purchase order (only pending orders)
 * @access  Private (admin)
 */
router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    purchaseController.deletePurchaseOrder.bind(purchaseController)
);

// ============================================
// SUPPLIER ROUTES
// ============================================

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers with filters
 * @access  Private (manager, admin)
 */
router.get(
    '/suppliers',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getAllSuppliers.bind(purchaseController)
);

/**
 * @route   GET /api/suppliers/active
 * @desc    Get active suppliers
 * @access  Private (manager, admin)
 */
router.get(
    '/suppliers/active',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getActiveSuppliers.bind(purchaseController)
);

/**
 * @route   GET /api/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Private (manager, admin)
 */
router.get(
    '/suppliers/:id',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getSupplierById.bind(purchaseController)
);

/**
 * @route   POST /api/suppliers
 * @desc    Create new supplier
 * @access  Private (manager, admin)
 */
router.post(
    '/suppliers',
    authenticate,
    authorize('admin', 'manager'),
    validate(createSupplierSchema),
    purchaseController.createSupplier.bind(purchaseController)
);

/**
 * @route   PATCH /api/suppliers/:id
 * @desc    Update supplier
 * @access  Private (manager, admin)
 */
router.patch(
    '/suppliers/:id',
    authenticate,
    authorize('admin', 'manager'),
    validate(updateSupplierSchema),
    purchaseController.updateSupplier.bind(purchaseController)
);

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Delete supplier
 * @access  Private (admin)
 */
router.delete(
    '/suppliers/:id',
    authenticate,
    authorize('admin'),
    purchaseController.deleteSupplier.bind(purchaseController)
);

export default router;
