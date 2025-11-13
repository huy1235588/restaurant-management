import { Router } from 'express';
import { tableController } from '@/features/table/table.controller';
import { authenticate } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import {
    createTableSchema,
    updateTableSchema,
    updateTableStatusSchema,
} from '@/features/table/validators';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /tables:
 *   get:
 *     summary: Get all tables with pagination
 *     description: Retrieve a paginated list of restaurant tables with filtering and sorting options
 *     tags: [Tables]
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
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [available, occupied, reserved, maintenance]
 *         description: Filter by table status
 *       - in: query
 *         name: floor
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by floor number
 *       - in: query
 *         name: isActive
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by active status (true/false)
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           default: tableNumber
 *         description: Field to sort by (e.g., tableNumber, capacity, floor)
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (asc for ascending, desc for descending)
 *     responses:
 *       200:
 *         description: Tables retrieved successfully
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
 *                   example: Tables retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tableId:
 *                             type: integer
 *                           tableNumber:
 *                             type: string
 *                           tableName:
 *                             type: string
 *                           capacity:
 *                             type: integer
 *                           minCapacity:
 *                             type: integer
 *                           floor:
 *                             type: integer
 *                           section:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [available, occupied, reserved, maintenance]
 *                           isActive:
 *                             type: boolean
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
// GET /api/tables - Get all tables
router.get('/', tableController.getAll.bind(tableController));

/**
 * @swagger
 * /tables/stats:
 *   get:
 *     summary: Get table statistics
 *     description: Retrieve statistics about all tables including counts by status
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// GET /api/tables/stats - Get table statistics
router.get('/stats', tableController.getStats.bind(tableController));

/**
 * @swagger
 * /tables/available:
 *   get:
 *     summary: Get available tables
 *     description: Retrieve a list of all available tables
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
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
 *                       status:
 *                         type: string
 *                         enum: [available]
 *                       location:
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
// GET /api/tables/available - Get available tables
router.get('/available', tableController.getAvailable.bind(tableController));

/**
 * @swagger
 * /tables/number/{number}:
 *   get:
 *     summary: Get table by number
 *     description: Retrieve a table by its number
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table number
 *     responses:
 *       200:
 *         description: Table retrieved successfully
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
 *                   example: Table retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     number:
 *                       type: integer
 *                     capacity:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [available, occupied, reserved, cleaning]
 *                     location:
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
 *         description: Table not found
 *       500:
 *         description: Internal server error
 */
// GET /api/tables/number/:number - Get table by number
router.get('/number/:number', tableController.getByNumber.bind(tableController));

/**
 * @swagger
 * /tables/bulk:
 *   patch:
 *     summary: Bulk update tables
 *     description: Update multiple tables at once
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tableId:
 *                       type: integer
 *                     data:
 *                       type: object
 *     responses:
 *       200:
 *         description: Bulk update completed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// PATCH /api/tables/bulk - Bulk update tables
router.patch('/bulk', tableController.bulkUpdate.bind(tableController));

/**
 * @swagger
 * /tables/bulk-status:
 *   patch:
 *     summary: Bulk update table status
 *     description: Update status for multiple tables at once
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, maintenance]
 *     responses:
 *       200:
 *         description: Bulk status update completed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// PATCH /api/tables/bulk-status - Bulk update table status
router.patch('/bulk-status', tableController.bulkUpdateStatus.bind(tableController));

/**
 * @swagger
 * /tables/{id}:
 *   get:
 *     summary: Get table by ID
 *     description: Retrieve a specific table by its ID
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table retrieved successfully
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
 *                   example: Table retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     number:
 *                       type: integer
 *                     capacity:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [available, occupied, reserved, cleaning]
 *                     location:
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
 *         description: Table not found
 *       500:
 *         description: Internal server error
 */
// GET /api/tables/:id - Get table by ID
router.get('/:id', tableController.getById.bind(tableController));

/**
 * @swagger
 * /tables/{id}/current-order:
 *   get:
 *     summary: Get table with current order
 *     description: Retrieve a table along with its current active order
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table with current order retrieved successfully
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
 *                   example: Table with current order retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     number:
 *                       type: integer
 *                     capacity:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [available, occupied, reserved, cleaning]
 *                     location:
 *                       type: string
 *                     currentOrder:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         orderNumber:
 *                           type: string
 *                         status:
 *                           type: string
 *                         totalAmount:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Table not found
 *       500:
 *         description: Internal server error
 */
// GET /api/tables/:id/current-order - Get table with current order
router.get('/:id/current-order', tableController.getWithCurrentOrder.bind(tableController));

/**
 * @swagger
 * /tables:
 *   post:
 *     summary: Create a new table
 *     description: Create a new restaurant table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - capacity
 *             properties:
 *               number:
 *                 type: integer
 *                 minimum: 1
 *                 description: Unique table number
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Maximum number of seats
 *               location:
 *                 type: string
 *                 maxLength: 100
 *                 description: Table location (e.g., "Main Hall", "Patio")
 *           example:
 *             number: 5
 *             capacity: 4
 *             location: "Main Hall"
 *     responses:
 *       201:
 *         description: Table created successfully
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
 *                   example: Table created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     number:
 *                       type: integer
 *                     capacity:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [available]
 *                     location:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input or duplicate table number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// POST /api/tables - Create new table
router.post('/', validate(createTableSchema), tableController.create.bind(tableController));

/**
 * @swagger
 * /tables/{id}:
 *   put:
 *     summary: Update a table
 *     description: Update an existing restaurant table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: integer
 *                 minimum: 1
 *                 description: Unique table number
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Maximum number of seats
 *               location:
 *                 type: string
 *                 maxLength: 100
 *                 description: Table location
 *           example:
 *             number: 5
 *             capacity: 6
 *             location: "VIP Area"
 *     responses:
 *       200:
 *         description: Table updated successfully
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
 *                   example: Table updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     number:
 *                       type: integer
 *                     capacity:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [available, occupied, reserved, cleaning]
 *                     location:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input or duplicate table number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Table not found
 *       500:
 *         description: Internal server error
 */
// PUT /api/tables/:id - Update table
router.put('/:id', validate(updateTableSchema), tableController.update.bind(tableController));

/**
 * @swagger
 * /tables/{id}/status:
 *   patch:
 *     summary: Update table status
 *     description: Update the status of a restaurant table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
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
 *                 enum: [available, occupied, reserved, cleaning]
 *                 description: New table status
 *           example:
 *             status: "cleaning"
 *     responses:
 *       200:
 *         description: Table status updated successfully
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
 *                   example: Table status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [available, occupied, reserved, cleaning]
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Table not found
 *       500:
 *         description: Internal server error
 */
// PATCH /api/tables/:id/status - Update table status
router.patch('/:id/status', validate(updateTableStatusSchema), tableController.updateStatus.bind(tableController));

/**
 * @swagger
 * /tables/{id}:
 *   delete:
 *     summary: Delete a table
 *     description: Delete an existing restaurant table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table deleted successfully
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
 *                   example: Table deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Table not found
 *       500:
 *         description: Internal server error
 */
// DELETE /api/tables/:id - Delete table
router.delete('/:id', tableController.delete.bind(tableController));

export default router;
