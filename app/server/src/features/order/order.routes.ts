import { Router } from 'express';
import orderController from '@/features/order/order.controller';
import { authenticate, authorize } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import { CreateOrderSchema, UpdateOrderSchema } from '@/features/order/validators';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableId
 *               - items
 *             properties:
 *               tableId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the table
 *               staffId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the staff (optional, can be extracted from token)
 *               reservationId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the reservation (optional)
 *               customerName:
 *                 type: string
 *                 maxLength: 255
 *                 description: Customer name (optional)
 *               customerPhone:
 *                 type: string
 *                 pattern: '^[0-9]{10,11}$'
 *                 description: Customer phone number (optional)
 *               headCount:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of people (optional)
 *               notes:
 *                 type: string
 *                 description: Order notes (optional)
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - quantity
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                       minimum: 1
 *                       description: Menu item ID
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Item quantity
 *                     specialRequest:
 *                       type: string
 *                       description: Special request for this item (optional)
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                   example: Order created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     tableId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [pending, confirmed, preparing, ready, served, cancelled]
 *                     totalAmount:
 *                       type: number
 *                     items:
 *                       type: array
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Table or menu item not found
 */
router.post(
    '/',
    authorize('admin', 'manager', 'waiter'),
    validate(CreateOrderSchema),
    orderController.createOrder.bind(orderController)
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders with filtering, pagination and sorting
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tableId
 *         schema:
 *           type: integer
 *         description: Filter by table ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, served, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders to this date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by (e.g., createdAt, status, tableId)
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
 *         description: Orders retrieved successfully
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
 *                   example: Orders retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', orderController.getAllOrders.bind(orderController));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
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
 *                   example: Order retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     tableId:
 *                       type: integer
 *                     staffId:
 *                       type: integer
 *                       minimum: 1
 *                     status:
 *                       type: string
 *                       enum: [pending, confirmed, preparing, ready, served, cancelled]
 *                     customerName:
 *                       type: string
 *                     customerPhone:
 *                       type: string
 *                     headCount:
 *                       type: integer
 *                     notes:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     table:
 *                       type: object
 *                     staff:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:id', orderController.getOrder.bind(orderController));

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update order information
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, ready, served, cancelled]
 *                 description: Order status (optional)
 *               notes:
 *                 type: string
 *                 description: Order notes (optional)
 *     responses:
 *       200:
 *         description: Order updated successfully
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
 *                   example: Order updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Order not found
 */
router.put(
    '/:id',
    authorize('admin', 'manager', 'waiter'),
    validate(UpdateOrderSchema),
    orderController.updateOrder.bind(orderController)
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     description: Update the status of an existing order (admin, manager, waiter only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, ready, served, cancelled]
 *                 description: New order status
 *           examples:
 *             confirm:
 *               summary: Confirm order
 *               value:
 *                 status: confirmed
 *             preparing:
 *               summary: Mark as preparing
 *               value:
 *                 status: preparing
 *             ready:
 *               summary: Mark as ready
 *               value:
 *                 status: ready
 *             served:
 *               summary: Mark as served
 *               value:
 *                 status: served
 *     responses:
 *       200:
 *         description: Order status updated successfully
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
 *                   example: Order status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Order not found
 */
router.patch(
    '/:id/status',
    authorize('admin', 'manager', 'waiter'),
    orderController.updateOrderStatus.bind(orderController)
);

/**
 * @swagger
 * /orders/{id}/items:
 *   post:
 *     summary: Add items to an existing order
 *     description: Add new items to an existing order (admin, manager, waiter only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - quantity
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                       minimum: 1
 *                       description: Menu item ID
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Item quantity
 *                     specialRequest:
 *                       type: string
 *                       description: Special request for this item (optional)
 *           examples:
 *             addItems:
 *               summary: Add multiple items
 *               value:
 *                 items:
 *                   - itemId: 1
 *                     quantity: 2
 *                     specialRequest: "No onions"
 *                   - itemId: 3
 *                     quantity: 1
 *     responses:
 *       200:
 *         description: Items added to order successfully
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
 *                   example: Items added to order successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                     items:
 *                       type: array
 *                     totalAmount:
 *                       type: number
 *       400:
 *         description: Bad request - Invalid items or order cannot be modified
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Order or menu item not found
 */
router.post(
    '/:id/items',
    authorize('admin', 'manager', 'waiter'),
    orderController.addOrderItems.bind(orderController)
);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancel an order
 *     description: Cancel an existing order (admin, manager, waiter only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
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
 *                   example: Order cancelled successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: cancelled
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Order cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Order not found
 */
router.post(
    '/:id/cancel',
    authorize('admin', 'manager', 'waiter'),
    orderController.cancelOrder.bind(orderController)
);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order (Admin/Manager only)
 *     description: Permanently delete an order from the system. Only accessible by admin and manager roles.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Order ID
 *     responses:
 *       204:
 *         description: Order deleted successfully (No content)
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin/Manager access required
 *       404:
 *         description: Order not found
 */
router.delete(
    '/:id',
    authorize('admin', 'manager'),
    orderController.deleteOrder.bind(orderController)
);

export default router;
