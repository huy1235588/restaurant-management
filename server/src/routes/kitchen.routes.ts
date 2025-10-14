import { Router } from 'express';
import { kitchenController } from '@/controllers/kitchen.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /kitchen:
 *   get:
 *     summary: Get all kitchen orders
 *     description: Retrieve a list of all kitchen orders
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kitchen orders retrieved successfully
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
 *                   example: Kitchen orders retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       orderId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [pending, preparing, completed, cancelled]
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high, urgent]
 *                       assignedChefId:
 *                         type: integer
 *                         nullable: true
 *                       startedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       estimatedTime:
 *                         type: integer
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
// GET /api/kitchen - Get all kitchen orders
router.get('/', kitchenController.getAll.bind(kitchenController));

/**
 * @swagger
 * /kitchen/pending:
 *   get:
 *     summary: Get pending kitchen orders
 *     description: Retrieve a list of all pending kitchen orders
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending kitchen orders retrieved successfully
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
 *                   example: Pending kitchen orders retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       orderId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [pending]
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high, urgent]
 *                       assignedChefId:
 *                         type: integer
 *                         nullable: true
 *                       estimatedTime:
 *                         type: integer
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
// GET /api/kitchen/pending - Get pending kitchen orders
router.get('/pending', kitchenController.getPending.bind(kitchenController));

/**
 * @swagger
 * /kitchen/chef/{staffId}:
 *   get:
 *     summary: Get kitchen orders by chef
 *     description: Retrieve kitchen orders assigned to a specific chef
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chef staff ID
 *     responses:
 *       200:
 *         description: Kitchen orders retrieved successfully
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
 *                   example: Kitchen orders retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       orderId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [pending, preparing, completed, cancelled]
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high, urgent]
 *                       assignedChefId:
 *                         type: integer
 *                       startedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       estimatedTime:
 *                         type: integer
 *                       notes:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chef not found
 *       500:
 *         description: Internal server error
 */
// GET /api/kitchen/chef/:staffId - Get kitchen orders by chef
router.get('/chef/:staffId', kitchenController.getByChef.bind(kitchenController));

/**
 * @swagger
 * /kitchen/{id}:
 *   get:
 *     summary: Get kitchen order by ID
 *     description: Retrieve a specific kitchen order by its ID
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kitchen order ID
 *     responses:
 *       200:
 *         description: Kitchen order retrieved successfully
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
 *                   example: Kitchen order retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [pending, preparing, completed, cancelled]
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high, urgent]
 *                     assignedChefId:
 *                       type: integer
 *                       nullable: true
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     estimatedTime:
 *                       type: integer
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
 *         description: Kitchen order not found
 *       500:
 *         description: Internal server error
 */
// GET /api/kitchen/:id - Get kitchen order by ID
router.get('/:id', kitchenController.getById.bind(kitchenController));

/**
 * @swagger
 * /kitchen:
 *   post:
 *     summary: Create a new kitchen order
 *     description: Create a new kitchen order for an existing order
 *     tags: [Kitchen]
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
 *                 description: Order ID to create kitchen order for
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Order priority
 *                 default: medium
 *               estimatedTime:
 *                 type: integer
 *                 minimum: 1
 *                 description: Estimated preparation time in minutes
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Special preparation notes
 *           example:
 *             orderId: 1
 *             priority: "high"
 *             estimatedTime: 30
 *             notes: "Extra spicy"
 *     responses:
 *       201:
 *         description: Kitchen order created successfully
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
 *                   example: Kitchen order created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [pending]
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high, urgent]
 *                     assignedChefId:
 *                       type: integer
 *                       nullable: true
 *                     estimatedTime:
 *                       type: integer
 *                     notes:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input or order already has kitchen order
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// POST /api/kitchen - Create new kitchen order
router.post('/', kitchenController.create.bind(kitchenController));

/**
 * @swagger
 * /kitchen/{id}:
 *   put:
 *     summary: Update a kitchen order
 *     description: Update an existing kitchen order
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kitchen order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Order priority
 *               estimatedTime:
 *                 type: integer
 *                 minimum: 1
 *                 description: Estimated preparation time in minutes
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Special preparation notes
 *           example:
 *             priority: "urgent"
 *             estimatedTime: 45
 *             notes: "Updated preparation notes"
 *     responses:
 *       200:
 *         description: Kitchen order updated successfully
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
 *                   example: Kitchen order updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [pending, preparing, completed, cancelled]
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high, urgent]
 *                     assignedChefId:
 *                       type: integer
 *                       nullable: true
 *                     estimatedTime:
 *                       type: integer
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
 *         description: Kitchen order not found
 *       500:
 *         description: Internal server error
 */
// PUT /api/kitchen/:id - Update kitchen order
router.put('/:id', kitchenController.update.bind(kitchenController));

/**
 * @swagger
 * /kitchen/{id}/start:
 *   patch:
 *     summary: Start preparing kitchen order
 *     description: Mark a kitchen order as started (chef begins preparation)
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kitchen order ID
 *     responses:
 *       200:
 *         description: Kitchen order preparation started successfully
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
 *                   example: Kitchen order preparation started successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [preparing]
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Kitchen order not found
 *       409:
 *         description: Kitchen order cannot be started (not pending or not assigned)
 *       500:
 *         description: Internal server error
 */
// PATCH /api/kitchen/:id/start - Start preparing kitchen order
router.patch('/:id/start', kitchenController.startPreparing.bind(kitchenController));

/**
 * @swagger
 * /kitchen/{id}/complete:
 *   patch:
 *     summary: Complete kitchen order
 *     description: Mark a kitchen order as completed
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kitchen order ID
 *     responses:
 *       200:
 *         description: Kitchen order completed successfully
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
 *                   example: Kitchen order completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [completed]
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Kitchen order not found
 *       409:
 *         description: Kitchen order cannot be completed (not preparing)
 *       500:
 *         description: Internal server error
 */
// PATCH /api/kitchen/:id/complete - Complete kitchen order
router.patch('/:id/complete', kitchenController.complete.bind(kitchenController));

/**
 * @swagger
 * /kitchen/{id}/priority:
 *   patch:
 *     summary: Update kitchen order priority
 *     description: Update the priority of a kitchen order
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kitchen order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priority
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: New priority level
 *           example:
 *             priority: "urgent"
 *     responses:
 *       200:
 *         description: Kitchen order priority updated successfully
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
 *                   example: Kitchen order priority updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high, urgent]
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid priority
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Kitchen order not found
 *       500:
 *         description: Internal server error
 */
// PATCH /api/kitchen/:id/priority - Update kitchen order priority
router.patch('/:id/priority', kitchenController.updatePriority.bind(kitchenController));

/**
 * @swagger
 * /kitchen/{id}/assign:
 *   patch:
 *     summary: Assign chef to kitchen order
 *     description: Assign a chef to a kitchen order
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kitchen order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffId
 *             properties:
 *               staffId:
 *                 type: integer
 *                 description: Chef staff ID to assign
 *           example:
 *             staffId: 5
 *     responses:
 *       200:
 *         description: Chef assigned to kitchen order successfully
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
 *                   example: Chef assigned to kitchen order successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     assignedChefId:
 *                       type: integer
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid staff ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Kitchen order or staff not found
 *       409:
 *         description: Staff is not a chef or already assigned
 *       500:
 *         description: Internal server error
 */
// PATCH /api/kitchen/:id/assign - Assign chef to kitchen order
router.patch('/:id/assign', kitchenController.assignChef.bind(kitchenController));

export default router;
