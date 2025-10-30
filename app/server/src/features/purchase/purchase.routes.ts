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

const router: Router = Router();

// ============================================
// PURCHASE ORDER ROUTES
// ============================================

/**
 * @swagger
 * /purchase-orders:
 *   get:
 *     summary: Get all purchase orders with pagination
 *     description: Retrieve a paginated list of purchase orders with optional filters and sorting
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, received, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: supplierId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by supplier ID
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by (e.g., createdAt, totalAmount, status)
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (asc for ascending, desc for descending)
 *     responses:
 *       200:
 *         description: Purchase orders retrieved successfully
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
 *                   example: Purchase orders retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           purchaseOrderId:
 *                             type: integer
 *                           purchaseOrderCode:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [pending, received, cancelled]
 *                           totalAmount:
 *                             type: number
 *                           supplierId:
 *                             type: integer
 *                           orderDate:
 *                             type: string
 *                             format: date-time
 *                           expectedDeliveryDate:
 *                             type: string
 *                             format: date
 *                           notes:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             ingredientId:
 *                               type: integer
 *                             quantity:
 *                               type: number
 *                             unitPrice:
 *                               type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getAllPurchaseOrders.bind(purchaseController)
);

/**
 * @swagger
 * /purchase-orders/pending:
 *   get:
 *     summary: Get pending purchase orders
 *     description: Retrieve purchase orders that are still pending
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending purchase orders retrieved successfully
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
 *                   example: Pending purchase orders retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       orderNumber:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: pending
 *                       totalAmount:
 *                         type: number
 *                       supplier:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/pending',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getPendingOrders.bind(purchaseController)
);

/**
 * @swagger
 * /purchase-orders/number/{orderNumber}:
 *   get:
 *     summary: Get purchase order by order number
 *     description: Retrieve a specific purchase order by its order number
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order number
 *     responses:
 *       200:
 *         description: Purchase order retrieved successfully
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
 *                   example: Purchase order retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *                     supplier:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ingredientId:
 *                             type: integer
 *                           quantity:
 *                             type: number
 *                           unitPrice:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Purchase order not found
 */
router.get(
    '/number/:orderNumber',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getPurchaseOrderByNumber.bind(purchaseController)
);

/**
 * @swagger
 * /purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     description: Retrieve a specific purchase order by its ID
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order retrieved successfully
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
 *                   example: Purchase order retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *                     supplier:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ingredientId:
 *                             type: integer
 *                           quantity:
 *                             type: number
 *                           unitPrice:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Purchase order not found
 */
router.get(
    '/:id',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getPurchaseOrderById.bind(purchaseController)
);

/**
 * @swagger
 * /purchase-orders:
 *   post:
 *     summary: Create new purchase order
 *     description: Create a new purchase order
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *               - items
 *             properties:
 *               supplierId:
 *                 type: integer
 *                 description: Supplier ID
 *               items:
 *                 type: array
 *                 description: List of items to purchase
 *                 items:
 *                   type: object
 *                   required:
 *                     - ingredientId
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     ingredientId:
 *                       type: integer
 *                       description: Ingredient ID
 *                     quantity:
 *                       type: number
 *                       description: Quantity to purchase
 *                     unitPrice:
 *                       type: number
 *                       description: Unit price
 *     responses:
 *       201:
 *         description: Purchase order created successfully
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
 *                   example: Purchase order created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    '/',
    authenticate,
    authorize('admin', 'manager'),
    validate(createPurchaseOrderSchema),
    purchaseController.createPurchaseOrder.bind(purchaseController)
);

/**
 * @swagger
 * /purchase-orders/{id}:
 *   patch:
 *     summary: Update purchase order
 *     description: Update an existing purchase order
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplierId:
 *                 type: integer
 *                 description: Supplier ID
 *               items:
 *                 type: array
 *                 description: List of items to purchase
 *                 items:
 *                   type: object
 *                   properties:
 *                     ingredientId:
 *                       type: integer
 *                       description: Ingredient ID
 *                     quantity:
 *                       type: number
 *                       description: Quantity to purchase
 *                     unitPrice:
 *                       type: number
 *                       description: Unit price
 *     responses:
 *       200:
 *         description: Purchase order updated successfully
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
 *                   example: Purchase order updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Purchase order not found
 */
router.patch(
    '/:id',
    authenticate,
    authorize('admin', 'manager'),
    validate(updatePurchaseOrderSchema),
    purchaseController.updatePurchaseOrder.bind(purchaseController)
);

/**
 * @swagger
 * /purchase-orders/{id}/receive:
 *   post:
 *     summary: Receive purchase order
 *     description: Mark a purchase order as received and update stock levels
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receivedItems
 *             properties:
 *               receivedItems:
 *                 type: array
 *                 description: List of received items with actual quantities
 *                 items:
 *                   type: object
 *                   required:
 *                     - ingredientId
 *                     - receivedQuantity
 *                   properties:
 *                     ingredientId:
 *                       type: integer
 *                       description: Ingredient ID
 *                     receivedQuantity:
 *                       type: number
 *                       description: Actual received quantity
 *     responses:
 *       200:
 *         description: Purchase order received successfully
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
 *                   example: Purchase order received successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Purchase order not found
 */
router.post(
    '/:id/receive',
    authenticate,
    authorize('admin', 'manager'),
    validate(receivePurchaseOrderSchema),
    purchaseController.receivePurchaseOrder.bind(purchaseController)
);

/**
 * @swagger
 * /purchase-orders/{id}/cancel:
 *   post:
 *     summary: Cancel purchase order
 *     description: Cancel a pending purchase order
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order cancelled successfully
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
 *                   example: Purchase order cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Purchase order not found
 */
router.post(
    '/:id/cancel',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.cancelPurchaseOrder.bind(purchaseController)
);

/**
 * @swagger
 * /purchase-orders/{id}:
 *   delete:
 *     summary: Delete purchase order
 *     description: Delete a pending purchase order
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order deleted successfully
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
 *                   example: Purchase order deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Purchase order not found
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
 * @swagger
 * /suppliers:
 *   get:
 *     summary: Get all suppliers
 *     description: Retrieve a list of all suppliers with optional filters
 *     tags: [Purchase]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Suppliers retrieved successfully
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
 *                   example: Suppliers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       contactPerson:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       address:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/suppliers',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getAllSuppliers.bind(purchaseController)
);

/**
 * @swagger
 * /suppliers/active:
 *   get:
 *     summary: Get active suppliers
 *     description: Retrieve suppliers that are currently active
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active suppliers retrieved successfully
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
 *                   example: Active suppliers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       contactPerson:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       address:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/suppliers/active',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getActiveSuppliers.bind(purchaseController)
);

/**
 * @swagger
 * /suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     description: Retrieve a specific supplier by its ID
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier retrieved successfully
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
 *                   example: Supplier retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     contactPerson:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Supplier not found
 */
router.get(
    '/suppliers/:id',
    authenticate,
    authorize('admin', 'manager'),
    purchaseController.getSupplierById.bind(purchaseController)
);

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Create new supplier
 *     description: Create a new supplier
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contactPerson
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Supplier name
 *               contactPerson:
 *                 type: string
 *                 description: Contact person name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact email
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *               address:
 *                 type: string
 *                 description: Supplier address
 *               isActive:
 *                 type: boolean
 *                 description: Whether the supplier is active
 *                 default: true
 *     responses:
 *       201:
 *         description: Supplier created successfully
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
 *                   example: Supplier created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     contactPerson:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    '/suppliers',
    authenticate,
    authorize('admin', 'manager'),
    validate(createSupplierSchema),
    purchaseController.createSupplier.bind(purchaseController)
);

/**
 * @swagger
 * /suppliers/{id}:
 *   patch:
 *     summary: Update supplier
 *     description: Update an existing supplier
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Supplier name
 *               contactPerson:
 *                 type: string
 *                 description: Contact person name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact email
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *               address:
 *                 type: string
 *                 description: Supplier address
 *               isActive:
 *                 type: boolean
 *                 description: Whether the supplier is active
 *     responses:
 *       200:
 *         description: Supplier updated successfully
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
 *                   example: Supplier updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     contactPerson:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Supplier not found
 */
router.patch(
    '/suppliers/:id',
    authenticate,
    authorize('admin', 'manager'),
    validate(updateSupplierSchema),
    purchaseController.updateSupplier.bind(purchaseController)
);

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Delete supplier
 *     description: Delete a supplier from the system
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
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
 *                   example: Supplier deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Supplier not found
 */
router.delete(
    '/suppliers/:id',
    authenticate,
    authorize('admin'),
    purchaseController.deleteSupplier.bind(purchaseController)
);

export default router;
