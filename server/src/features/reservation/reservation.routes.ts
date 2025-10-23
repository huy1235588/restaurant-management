import { Router } from 'express';
import { reservationController } from '@/features/reservation/reservation.controller';
import { authenticate } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import {
    createReservationSchema,
    updateReservationSchema,
    updateReservationStatusSchema,
} from '@/features/reservation/validators';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Get all reservations
 *     description: Retrieve a list of all reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservations retrieved successfully
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
 *                   example: Reservations retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       code:
 *                         type: string
 *                       customerName:
 *                         type: string
 *                       customerPhone:
 *                         type: string
 *                       tableId:
 *                         type: integer
 *                       partySize:
 *                         type: integer
 *                       reservationDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [pending, confirmed, cancelled, seated, completed]
 *                       notes:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// GET /api/reservations - Get all reservations
router.get('/', reservationController.getAll.bind(reservationController));

/**
 * @swagger
 * /reservations/check-availability:
 *   get:
 *     summary: Check table availability
 *     description: Check available tables for a specific date and time
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Reservation date and time
 *       - in: query
 *         name: partySize
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of guests
 *     responses:
 *       200:
 *         description: Available tables retrieved successfully
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
 *                   example: Available tables retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       number:
 *                         type: integer
 *                       capacity:
 *                         type: integer
 *                       location:
 *                         type: string
 *       400:
 *         description: Bad request - Missing or invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// GET /api/reservations/check-availability - Check table availability
router.get('/check-availability', reservationController.checkAvailability.bind(reservationController));

/**
 * @swagger
 * /reservations/phone/{phone}:
 *   get:
 *     summary: Get reservations by phone
 *     description: Retrieve reservations by customer phone number
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer phone number
 *     responses:
 *       200:
 *         description: Reservations retrieved successfully
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
 *                   example: Reservations retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       code:
 *                         type: string
 *                       customerName:
 *                         type: string
 *                       customerPhone:
 *                         type: string
 *                       tableId:
 *                         type: integer
 *                       partySize:
 *                         type: integer
 *                       reservationDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [pending, confirmed, cancelled, seated, completed]
 *                       notes:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No reservations found for this phone number
 *       500:
 *         description: Internal server error
 */
// GET /api/reservations/phone/:phone - Get reservations by phone
router.get('/phone/:phone', reservationController.getByPhone.bind(reservationController));

/**
 * @swagger
 * /reservations/code/{code}:
 *   get:
 *     summary: Get reservation by code
 *     description: Retrieve a reservation by its unique code
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation code
 *     responses:
 *       200:
 *         description: Reservation retrieved successfully
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
 *                   example: Reservation retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     customerName:
 *                       type: string
 *                     customerPhone:
 *                       type: string
 *                     tableId:
 *                       type: integer
 *                     partySize:
 *                       type: integer
 *                     reservationDate:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       enum: [pending, confirmed, cancelled, seated, completed]
 *                     notes:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Internal server error
 */
// GET /api/reservations/code/:code - Get reservation by code
router.get('/code/:code', reservationController.getByCode.bind(reservationController));

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Get reservation by ID
 *     description: Retrieve a specific reservation by its ID
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation retrieved successfully
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
 *                   example: Reservation retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     customerName:
 *                       type: string
 *                     customerPhone:
 *                       type: string
 *                     tableId:
 *                       type: integer
 *                     partySize:
 *                       type: integer
 *                     reservationDate:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       enum: [pending, confirmed, cancelled, seated, completed]
 *                     notes:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Internal server error
 */
// GET /api/reservations/:id - Get reservation by ID
router.get('/:id', reservationController.getById.bind(reservationController));

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Create a new reservation
 *     description: Create a new table reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerPhone
 *               - tableId
 *               - partySize
 *               - reservationDate
 *             properties:
 *               customerName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Customer full name
 *               customerPhone:
 *                 type: string
 *                 pattern: '^[0-9]{10,11}$'
 *                 description: Customer phone number
 *               tableId:
 *                 type: integer
 *                 description: Table ID
 *               partySize:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of guests
 *               reservationDate:
 *                 type: string
 *                 format: date-time
 *                 description: Reservation date and time
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional notes
 *           example:
 *             customerName: "John Doe"
 *             customerPhone: "0123456789"
 *             tableId: 1
 *             partySize: 4
 *             reservationDate: "2025-10-15T19:00:00Z"
 *             notes: "Birthday celebration"
 *     responses:
 *       201:
 *         description: Reservation created successfully
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
 *                   example: Reservation created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     customerName:
 *                       type: string
 *                     customerPhone:
 *                       type: string
 *                     tableId:
 *                       type: integer
 *                     partySize:
 *                       type: integer
 *                     reservationDate:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       enum: [pending]
 *                     notes:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input or table not available
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// POST /api/reservations - Create new reservation
router.post('/', validate(createReservationSchema), reservationController.create.bind(reservationController));

/**
 * @swagger
 * /reservations/{id}:
 *   put:
 *     summary: Update a reservation
 *     description: Update an existing reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Customer full name
 *               customerPhone:
 *                 type: string
 *                 pattern: '^[0-9]{10,11}$'
 *                 description: Customer phone number
 *               tableId:
 *                 type: integer
 *                 description: Table ID
 *               partySize:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of guests
 *               reservationDate:
 *                 type: string
 *                 format: date-time
 *                 description: Reservation date and time
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional notes
 *           example:
 *             customerName: "Jane Doe"
 *             customerPhone: "0987654321"
 *             tableId: 2
 *             partySize: 6
 *             reservationDate: "2025-10-15T20:00:00Z"
 *             notes: "Updated notes"
 *     responses:
 *       200:
 *         description: Reservation updated successfully
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
 *                   example: Reservation updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     customerName:
 *                       type: string
 *                     customerPhone:
 *                       type: string
 *                     tableId:
 *                       type: integer
 *                     partySize:
 *                       type: integer
 *                     reservationDate:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       enum: [pending, confirmed, cancelled, seated, completed]
 *                     notes:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Internal server error
 */
// PUT /api/reservations/:id - Update reservation
router.put('/:id', validate(updateReservationSchema), reservationController.update.bind(reservationController));

/**
 * @swagger
 * /reservations/{id}/cancel:
 *   patch:
 *     summary: Cancel a reservation
 *     description: Cancel an existing reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
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
 *                   example: Reservation cancelled successfully
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
 *         description: Reservation not found
 *       500:
 *         description: Internal server error
 */
// PATCH /api/reservations/:id/cancel - Cancel reservation
router.patch('/:id/cancel', validate(updateReservationStatusSchema), reservationController.cancel.bind(reservationController));

/**
 * @swagger
 * /reservations/{id}/confirm:
 *   patch:
 *     summary: Confirm a reservation
 *     description: Confirm a pending reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation confirmed successfully
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
 *                   example: Reservation confirmed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [confirmed]
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *       409:
 *         description: Reservation cannot be confirmed (not pending or table conflict)
 *       500:
 *         description: Internal server error
 */
// PATCH /api/reservations/:id/confirm - Confirm reservation
router.patch('/:id/confirm', validate(updateReservationStatusSchema), reservationController.confirm.bind(reservationController));

/**
 * @swagger
 * /reservations/{id}/seated:
 *   patch:
 *     summary: Mark reservation as seated
 *     description: Mark a confirmed reservation as seated (customer has arrived)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation marked as seated successfully
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
 *                   example: Reservation marked as seated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [seated]
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *       409:
 *         description: Reservation cannot be marked as seated (not confirmed)
 *       500:
 *         description: Internal server error
 */
// PATCH /api/reservations/:id/seated - Mark reservation as seated
router.patch('/:id/seated', validate(updateReservationStatusSchema), reservationController.markSeated.bind(reservationController));

export default router;
