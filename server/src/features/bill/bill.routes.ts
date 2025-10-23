import { Router } from 'express';
import billController from '@/features/bill/bill.controller';
import { authenticate, authorize } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import { CreateBillSchema, ProcessPaymentSchema } from '@/features/bill/validators';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /bills:
 *   post:
 *     summary: Create a new bill from an order
 *     description: Generate a bill for an existing order (admin, manager, cashier only)
 *     tags: [Bills]
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
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: ID of the order to create bill for
 *               taxRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Tax rate percentage (optional, default from system)
 *               discountAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Discount amount in currency (optional)
 *               serviceCharge:
 *                 type: number
 *                 minimum: 0
 *                 description: Service charge amount (optional)
 *           examples:
 *             basic:
 *               summary: Basic bill
 *               value:
 *                 orderId: 1
 *             withDiscount:
 *               summary: Bill with discount
 *               value:
 *                 orderId: 1
 *                 taxRate: 10
 *                 discountAmount: 50000
 *                 serviceCharge: 20000
 *     responses:
 *       201:
 *         description: Bill created successfully
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
 *                   example: Bill created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     billId:
 *                       type: integer
 *                     billNumber:
 *                       type: string
 *                     orderId:
 *                       type: integer
 *                     subtotal:
 *                       type: number
 *                     taxAmount:
 *                       type: number
 *                     discountAmount:
 *                       type: number
 *                     serviceCharge:
 *                       type: number
 *                     finalAmount:
 *                       type: number
 *                     paymentStatus:
 *                       type: string
 *                       enum: [pending, paid, refunded, cancelled]
 *       400:
 *         description: Bad request - Order already has a bill or invalid order
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Order not found
 */
router.post(
    '/',
    authorize('admin', 'manager', 'cashier'),
    validate(CreateBillSchema),
    billController.createBill.bind(billController)
);

/**
 * @swagger
 * /bills/{id}:
 *   get:
 *     summary: Get bill details by ID
 *     description: Retrieve detailed information about a specific bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Bill retrieved successfully
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
 *                   example: Bill retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     billId:
 *                       type: integer
 *                     billNumber:
 *                       type: string
 *                     orderId:
 *                       type: integer
 *                     staffId:
 *                       type: integer
 *                     tableId:
 *                       type: integer
 *                     subtotal:
 *                       type: number
 *                       description: Total amount before tax and charges
 *                     taxRate:
 *                       type: number
 *                       description: Tax rate percentage
 *                     taxAmount:
 *                       type: number
 *                       description: Calculated tax amount
 *                     discountAmount:
 *                       type: number
 *                     serviceCharge:
 *                       type: number
 *                     finalAmount:
 *                       type: number
 *                       description: Final amount to pay
 *                     paidAmount:
 *                       type: number
 *                     changeAmount:
 *                       type: number
 *                     paymentStatus:
 *                       type: string
 *                       enum: [pending, paid, refunded, cancelled]
 *                     paymentMethod:
 *                       type: string
 *                       enum: [cash, card, momo, bank_transfer]
 *                     transactionId:
 *                       type: string
 *                     items:
 *                       type: array
 *                       description: Bill items with details
 *                     order:
 *                       type: object
 *                       description: Order information
 *                     table:
 *                       type: object
 *                       description: Table information
 *                     staff:
 *                       type: object
 *                       description: Staff information
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 */
router.get('/:id', billController.getBill.bind(billController));

/**
 * @swagger
 * /bills/{id}/payment:
 *   post:
 *     summary: Process payment for a bill
 *     description: Process and record payment for an existing bill (admin, manager, cashier only)
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *               - paidAmount
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, momo, bank_transfer]
 *                 description: Payment method used
 *               paidAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Amount paid by customer
 *               transactionId:
 *                 type: string
 *                 description: Transaction ID for card/digital payments (optional)
 *               cardNumber:
 *                 type: string
 *                 maxLength: 4
 *                 description: Last 4 digits of card number (optional)
 *               cardHolderName:
 *                 type: string
 *                 maxLength: 255
 *                 description: Card holder name (optional)
 *               notes:
 *                 type: string
 *                 description: Payment notes (optional)
 *           examples:
 *             cash:
 *               summary: Cash payment
 *               value:
 *                 paymentMethod: cash
 *                 paidAmount: 500000
 *             card:
 *               summary: Card payment
 *               value:
 *                 paymentMethod: card
 *                 paidAmount: 450000
 *                 transactionId: "TXN123456789"
 *                 cardNumber: "1234"
 *                 cardHolderName: "NGUYEN VAN A"
 *             momo:
 *               summary: MoMo payment
 *               value:
 *                 paymentMethod: momo
 *                 paidAmount: 450000
 *                 transactionId: "MOMO987654321"
 *     responses:
 *       200:
 *         description: Payment processed successfully
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
 *                   example: Payment processed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     billId:
 *                       type: integer
 *                     paymentStatus:
 *                       type: string
 *                       example: paid
 *                     paymentMethod:
 *                       type: string
 *                     paidAmount:
 *                       type: number
 *                     finalAmount:
 *                       type: number
 *                     changeAmount:
 *                       type: number
 *                       description: Change to return to customer
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid payment amount or bill already paid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Bill not found
 */
router.post(
    '/:id/payment',
    authorize('admin', 'manager', 'cashier'),
    validate(ProcessPaymentSchema),
    billController.processPayment.bind(billController)
);

/**
 * @swagger
 * /bills/revenue:
 *   get:
 *     summary: Get revenue statistics (Admin/Manager only)
 *     description: Retrieve revenue and sales statistics for a specified date range
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for revenue calculation (YYYY-MM-DD)
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for revenue calculation (YYYY-MM-DD)
 *         example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Revenue data retrieved successfully
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
 *                   example: Revenue retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       description: Total revenue for the period
 *                     totalBills:
 *                       type: integer
 *                       description: Number of bills in the period
 *                     totalOrders:
 *                       type: integer
 *                       description: Number of orders completed
 *                     averageBillAmount:
 *                       type: number
 *                       description: Average bill amount
 *                     totalDiscount:
 *                       type: number
 *                       description: Total discount given
 *                     totalTax:
 *                       type: number
 *                       description: Total tax collected
 *                     totalServiceCharge:
 *                       type: number
 *                       description: Total service charge
 *                     paymentMethods:
 *                       type: object
 *                       description: Breakdown by payment method
 *                       properties:
 *                         cash:
 *                           type: number
 *                         card:
 *                           type: number
 *                         momo:
 *                           type: number
 *                         bank_transfer:
 *                           type: number
 *                     dailyRevenue:
 *                       type: array
 *                       description: Daily revenue breakdown
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           revenue:
 *                             type: number
 *                           billCount:
 *                             type: integer
 *       400:
 *         description: Bad request - Invalid date range
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager access required
 */
router.get(
    '/revenue',
    authorize('admin', 'manager'),
    billController.getRevenue.bind(billController)
);

export default router;
