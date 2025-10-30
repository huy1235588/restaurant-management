import { Router } from 'express';
import { paymentController } from '@/features/payment/payment.controller';
import { authenticate } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import {
    createPaymentSchema,
    updatePaymentStatusSchema,
} from '@/features/payment/validators';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments with pagination
 *     description: Retrieve a paginated list of payments with filtering and sorting options
 *     tags: [Payments]
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
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: billId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by bill ID
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded, cancelled]
 *         description: Filter by payment status
 *       - in: query
 *         name: paymentMethod
 *         required: false
 *         schema:
 *           type: string
 *           enum: [cash, card, digital_wallet, bank_transfer]
 *         description: Filter by payment method
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           default: paymentDate
 *         description: Field to sort by (e.g., paymentDate, amount, createdAt)
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
 *         description: Payments retrieved successfully
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
 *                   example: Payments retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           paymentId:
 *                             type: integer
 *                           billId:
 *                             type: integer
 *                           amount:
 *                             type: number
 *                           paymentMethod:
 *                             type: string
 *                             enum: [cash, card, digital_wallet, bank_transfer]
 *                           status:
 *                             type: string
 *                             enum: [pending, completed, failed, refunded, cancelled]
 *                           transactionId:
 *                             type: string
 *                             nullable: true
 *                           cardNumber:
 *                             type: string
 *                             nullable: true
 *                           cardHolderName:
 *                             type: string
 *                             nullable: true
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// GET /api/payments - Get all payments
router.get('/', paymentController.getAll.bind(paymentController));

/**
 * @swagger
 * /payments/bill/{billId}:
 *   get:
 *     summary: Get payments by bill
 *     description: Retrieve all payments for a specific bill
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
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
 *                   example: Payments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       billId:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                       method:
 *                         type: string
 *                         enum: [cash, card, digital_wallet, bank_transfer]
 *                       status:
 *                         type: string
 *                         enum: [pending, completed, failed, refunded, cancelled]
 *                       transactionId:
 *                         type: string
 *                         nullable: true
 *                       processedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Internal server error
 */
// GET /api/payments/bill/:billId - Get payments by bill
router.get('/bill/:billId', paymentController.getByBill.bind(paymentController));

/**
 * @swagger
 * /payments/transaction/{transactionId}:
 *   get:
 *     summary: Verify payment transaction
 *     description: Verify the status of a payment transaction
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction verified successfully
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
 *                   example: Transaction verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, completed, failed, refunded, cancelled]
 *                     amount:
 *                       type: number
 *                     verified:
 *                       type: boolean
 *                     verificationTime:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
// GET /api/payments/transaction/:transactionId - Verify payment transaction
router.get('/transaction/:transactionId', paymentController.verifyTransaction.bind(paymentController));

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     description: Retrieve a specific payment by its ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
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
 *                   example: Payment retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     billId:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                     method:
 *                       type: string
 *                       enum: [cash, card, digital_wallet, bank_transfer]
 *                     status:
 *                       type: string
 *                       enum: [pending, completed, failed, refunded, cancelled]
 *                     transactionId:
 *                       type: string
 *                       nullable: true
 *                     processedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     refundedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
// GET /api/payments/:id - Get payment by ID
router.get('/:id', paymentController.getById.bind(paymentController));

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     description: Create a new payment for a bill
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - billId
 *               - amount
 *               - method
 *             properties:
 *               billId:
 *                 type: integer
 *                 description: Bill ID to pay for
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Payment amount
 *               method:
 *                 type: string
 *                 enum: [cash, card, digital_wallet, bank_transfer]
 *                 description: Payment method
 *               transactionId:
 *                 type: string
 *                 description: External transaction ID (for digital payments)
 *           example:
 *             billId: 1
 *             amount: 150000
 *             method: "cash"
 *             transactionId: "TXN123456"
 *     responses:
 *       201:
 *         description: Payment created successfully
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
 *                   example: Payment created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     billId:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                     method:
 *                       type: string
 *                       enum: [cash, card, digital_wallet, bank_transfer]
 *                     status:
 *                       type: string
 *                       enum: [pending]
 *                     transactionId:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input or bill already paid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Internal server error
 */
// POST /api/payments - Create new payment
router.post('/', validate(createPaymentSchema), paymentController.create.bind(paymentController));

/**
 * @swagger
 * /payments/process:
 *   post:
 *     summary: Process payment
 *     description: Process a pending payment (mark as completed)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: integer
 *                 description: Payment ID to process
 *               transactionId:
 *                 type: string
 *                 description: Transaction ID from payment processor
 *           example:
 *             paymentId: 1
 *             transactionId: "TXN789012"
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
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [completed]
 *                     processedAt:
 *                       type: string
 *                       format: date-time
 *                     transactionId:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 *       409:
 *         description: Payment cannot be processed (not pending)
 *       500:
 *         description: Internal server error
 */
// POST /api/payments/process - Process payment
router.post('/process', validate(createPaymentSchema), paymentController.process.bind(paymentController));

/**
 * @swagger
 * /payments/{id}/refund:
 *   patch:
 *     summary: Refund payment
 *     description: Refund a completed payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refundAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Amount to refund (partial refund), defaults to full amount
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Refund reason
 *           example:
 *             refundAmount: 50000
 *             reason: "Customer request"
 *     responses:
 *       200:
 *         description: Payment refunded successfully
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
 *                   example: Payment refunded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [refunded]
 *                     refundedAt:
 *                       type: string
 *                       format: date-time
 *                     refundAmount:
 *                       type: number
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid refund amount
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 *       409:
 *         description: Payment cannot be refunded (not completed or already refunded)
 *       500:
 *         description: Internal server error
 */
// PATCH /api/payments/:id/refund - Refund payment
router.patch('/:id/refund', validate(updatePaymentStatusSchema), paymentController.refund.bind(paymentController));

/**
 * @swagger
 * /payments/{id}/cancel:
 *   patch:
 *     summary: Cancel payment
 *     description: Cancel a pending payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Cancellation reason
 *           example:
 *             reason: "Payment timeout"
 *     responses:
 *       200:
 *         description: Payment cancelled successfully
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
 *                   example: Payment cancelled successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [cancelled]
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 *       409:
 *         description: Payment cannot be cancelled (not pending)
 *       500:
 *         description: Internal server error
 */
// PATCH /api/payments/:id/cancel - Cancel payment
router.patch('/:id/cancel', validate(updatePaymentStatusSchema), paymentController.cancel.bind(paymentController));

export default router;
