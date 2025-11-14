import { Router } from 'express';
import { floorPlanController } from '@/features/floor-plan/floor-plan.controller';
import { authenticate } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import {
    createFloorPlanLayoutSchema,
    updateFloorPlanLayoutSchema,
    createFloorPlanBackgroundSchema,
    updateFloorPlanBackgroundSchema,
    getFloorPlanLayoutsByFloorSchema,
    getFloorPlanBackgroundSchema,
    floorPlanLayoutIdSchema,
    floorPlanBackgroundIdSchema,
} from '@/features/floor-plan/validators';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /floor-plans/layouts/{floor}:
 *   get:
 *     summary: Get all layouts for a specific floor
 *     description: Retrieve all floor plan layouts for a given floor number
 *     tags: [Floor Plans - Layouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: floor
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Floor number
 *     responses:
 *       200:
 *         description: Floor plan layouts retrieved successfully
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
 *                   example: Floor plan layouts retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       layoutId:
 *                         type: integer
 *                         example: 1
 *                       restaurant:
 *                         type: integer
 *                         example: 1
 *                       floor:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Main Hall Layout
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         example: Layout for the main dining area
 *                       data:
 *                         type: object
 *                         properties:
 *                           tables:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 tableId:
 *                                   type: integer
 *                                 x:
 *                                   type: number
 *                                 y:
 *                                   type: number
 *                                 width:
 *                                   type: number
 *                                 height:
 *                                   type: number
 *                                 rotation:
 *                                   type: number
 *                                 shape:
 *                                   type: string
 *                           gridSize:
 *                             type: number
 *                           zoom:
 *                             type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request - Invalid floor number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    '/layouts/:floor',
    validate(getFloorPlanLayoutsByFloorSchema),
    floorPlanController.getLayoutsByFloor.bind(floorPlanController)
);

/**
 * @swagger
 * /floor-plans/layouts/{layoutId}/detail:
 *   get:
 *     summary: Get layout by ID
 *     description: Retrieve a specific floor plan layout by its ID
 *     tags: [Floor Plans - Layouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: layoutId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Layout ID
 *     responses:
 *       200:
 *         description: Floor plan layout retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     layoutId:
 *                       type: integer
 *                     restaurant:
 *                       type: integer
 *                     floor:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     data:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid layout ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Layout not found
 *       500:
 *         description: Internal server error
 */
router.get(
    '/layouts/:layoutId/detail',
    validate(floorPlanLayoutIdSchema),
    floorPlanController.getLayoutById.bind(floorPlanController)
);

/**
 * @swagger
 * /floor-plans/layouts:
 *   post:
 *     summary: Create a new floor plan layout
 *     description: Create a new floor plan layout with table positions and grid configuration
 *     tags: [Floor Plans - Layouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - floor
 *               - name
 *               - data
 *             properties:
 *               floor:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Floor number
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Main Hall Layout
 *                 description: Layout name
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: Layout for the main dining area
 *                 description: Optional layout description
 *               data:
 *                 type: object
 *                 required:
 *                   - tables
 *                   - gridSize
 *                   - zoom
 *                 properties:
 *                   tables:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - tableId
 *                         - x
 *                         - y
 *                         - width
 *                         - height
 *                       properties:
 *                         tableId:
 *                           type: integer
 *                         x:
 *                           type: number
 *                         y:
 *                           type: number
 *                         width:
 *                           type: number
 *                           minimum: 0
 *                         height:
 *                           type: number
 *                           minimum: 0
 *                         rotation:
 *                           type: number
 *                         shape:
 *                           type: string
 *                   gridSize:
 *                     type: number
 *                     minimum: 1
 *                     example: 10
 *                   zoom:
 *                     type: number
 *                     minimum: 0.1
 *                     example: 1
 *           example:
 *             floor: 1
 *             name: Main Hall Layout
 *             description: Main dining area layout
 *             data:
 *               tables:
 *                 - tableId: 1
 *                   x: 100
 *                   y: 100
 *                   width: 80
 *                   height: 80
 *               gridSize: 10
 *               zoom: 1
 *     responses:
 *       201:
 *         description: Floor plan layout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid input or duplicate layout name
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Unprocessable entity - Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
    '/layouts',
    validate(createFloorPlanLayoutSchema),
    floorPlanController.createLayout.bind(floorPlanController)
);

/**
 * @swagger
 * /floor-plans/layouts/{layoutId}:
 *   put:
 *     summary: Update a floor plan layout
 *     description: Update an existing floor plan layout
 *     tags: [Floor Plans - Layouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: layoutId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Layout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Updated Layout Name
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               data:
 *                 type: object
 *                 properties:
 *                   tables:
 *                     type: array
 *                   gridSize:
 *                     type: number
 *                   zoom:
 *                     type: number
 *           example:
 *             name: Updated Main Hall
 *             data:
 *               tables: []
 *               gridSize: 10
 *               zoom: 1.5
 *     responses:
 *       200:
 *         description: Floor plan layout updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Layout not found
 *       422:
 *         description: Unprocessable entity - Validation error
 *       500:
 *         description: Internal server error
 */
router.put(
    '/layouts/:layoutId',
    validate(floorPlanLayoutIdSchema),
    validate(updateFloorPlanLayoutSchema),
    floorPlanController.updateLayout.bind(floorPlanController)
);

/**
 * @swagger
 * /floor-plans/layouts/{layoutId}:
 *   delete:
 *     summary: Delete a floor plan layout
 *     description: Delete an existing floor plan layout
 *     tags: [Floor Plans - Layouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: layoutId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Layout ID
 *     responses:
 *       200:
 *         description: Floor plan layout deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid layout ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Layout not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    '/layouts/:layoutId',
    validate(floorPlanLayoutIdSchema),
    floorPlanController.deleteLayout.bind(floorPlanController)
);

/**
 * @swagger
 * /floor-plans/backgrounds/{floor}:
 *   get:
 *     summary: Get background for a specific floor
 *     description: Retrieve the background image configuration for a given floor
 *     tags: [Floor Plans - Backgrounds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: floor
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Floor number
 *     responses:
 *       200:
 *         description: Floor plan background retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     backgroundId:
 *                       type: integer
 *                     restaurant:
 *                       type: integer
 *                     floor:
 *                       type: integer
 *                     fileUrl:
 *                       type: string
 *                       format: uri
 *                     fileName:
 *                       type: string
 *                     fileSize:
 *                       type: integer
 *                     mimeType:
 *                       type: string
 *                     opacity:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 1
 *                     positionX:
 *                       type: number
 *                     positionY:
 *                       type: number
 *                     scaleX:
 *                       type: number
 *                     scaleY:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid floor number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    '/backgrounds/:floor',
    validate(getFloorPlanBackgroundSchema),
    floorPlanController.getBackground.bind(floorPlanController)
);

/**
 * @swagger
 * /floor-plans/backgrounds/{backgroundId}/detail:
 *   get:
 *     summary: Get background by ID
 *     description: Retrieve a specific floor plan background by its ID
 *     tags: [Floor Plans - Backgrounds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backgroundId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Background ID
 *     responses:
 *       200:
 *         description: Floor plan background retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid background ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Background not found
 *       500:
 *         description: Internal server error
 */
router.get(
    '/backgrounds/:backgroundId/detail',
    validate(floorPlanBackgroundIdSchema),
    floorPlanController.getBackgroundById.bind(floorPlanController)
);

/**
 * @swagger
 * /floor-plans/backgrounds:
 *   post:
 *     summary: Upload background image for a floor
 *     description: Upload or replace the background image for a specific floor
 *     tags: [Floor Plans - Backgrounds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - floor
 *               - fileUrl
 *               - fileName
 *               - fileSize
 *               - mimeType
 *             properties:
 *               floor:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Floor number
 *               fileUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://cdn.example.com/backgrounds/floor1.png
 *                 description: URL of the background image
 *               fileName:
 *                 type: string
 *                 maxLength: 255
 *                 example: floor1_layout.png
 *                 description: Original file name
 *               fileSize:
 *                 type: integer
 *                 maximum: 52428800
 *                 example: 1024000
 *                 description: File size in bytes (max 50MB)
 *               mimeType:
 *                 type: string
 *                 enum: [image/jpeg, image/png, image/gif, image/webp]
 *                 example: image/png
 *                 description: File MIME type
 *           example:
 *             floor: 1
 *             fileUrl: https://cdn.example.com/backgrounds/floor1.png
 *             fileName: floor1.png
 *             fileSize: 1024000
 *             mimeType: image/png
 *     responses:
 *       201:
 *         description: Background image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid input or file too large
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Unprocessable entity - Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
    '/backgrounds',
    validate(createFloorPlanBackgroundSchema),
    floorPlanController.uploadBackground.bind(floorPlanController)
);

/**
 * @swagger
 * /floor-plans/backgrounds/{backgroundId}:
 *   put:
 *     summary: Update background properties
 *     description: Update positioning and visual properties of a background image
 *     tags: [Floor Plans - Backgrounds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backgroundId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Background ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL of the background image
 *               fileName:
 *                 type: string
 *                 maxLength: 255
 *                 description: Original file name
 *               fileSize:
 *                 type: integer
 *                 maximum: 52428800
 *                 description: File size in bytes
 *               mimeType:
 *                 type: string
 *                 enum: [image/jpeg, image/png, image/gif, image/webp]
 *                 description: File MIME type
 *               opacity:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.8
 *                 description: Opacity level (0-1)
 *               positionX:
 *                 type: number
 *                 example: 0
 *                 description: Horizontal position
 *               positionY:
 *                 type: number
 *                 example: 0
 *                 description: Vertical position
 *               scaleX:
 *                 type: number
 *                 minimum: 0.1
 *                 example: 1
 *                 description: Horizontal scale
 *               scaleY:
 *                 type: number
 *                 minimum: 0.1
 *                 example: 1
 *                 description: Vertical scale
 *           example:
 *             opacity: 0.9
 *             positionX: 10
 *             positionY: 10
 *             scaleX: 1.2
 *             scaleY: 1.2
 *     responses:
 *       200:
 *         description: Background properties updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Background not found
 *       422:
 *         description: Unprocessable entity - Validation error
 *       500:
 *         description: Internal server error
 */
router.put(
    '/backgrounds/:backgroundId',
    validate(floorPlanBackgroundIdSchema),
    validate(updateFloorPlanBackgroundSchema),
    floorPlanController.updateBackground.bind(floorPlanController)
);

/**
 * @swagger
 * /floor-plans/backgrounds/{backgroundId}:
 *   delete:
 *     summary: Delete background image
 *     description: Delete a floor plan background image
 *     tags: [Floor Plans - Backgrounds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backgroundId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Background ID
 *     responses:
 *       200:
 *         description: Background image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid background ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Background not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    '/backgrounds/:backgroundId',
    validate(floorPlanBackgroundIdSchema),
    floorPlanController.deleteBackground.bind(floorPlanController)
);

/**
 * @swagger
 * /floor-plans/positions:
 *   patch:
 *     summary: Update table positions in bulk
 *     description: Update positions of multiple tables in a floor plan
 *     tags: [Floor Plans - Table Positions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - positions
 *             properties:
 *               positions:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - tableId
 *                     - x
 *                     - y
 *                     - width
 *                     - height
 *                   properties:
 *                     tableId:
 *                       type: integer
 *                       example: 1
 *                       description: Table ID
 *                     x:
 *                       type: number
 *                       example: 100
 *                       description: X coordinate
 *                     y:
 *                       type: number
 *                       example: 100
 *                       description: Y coordinate
 *                     width:
 *                       type: number
 *                       minimum: 0
 *                       example: 80
 *                       description: Table width
 *                     height:
 *                       type: number
 *                       minimum: 0
 *                       example: 80
 *                       description: Table height
 *                     rotation:
 *                       type: number
 *                       example: 0
 *                       description: Rotation angle in degrees
 *                     shape:
 *                       type: string
 *                       example: round
 *                       description: Table shape (e.g., round, square)
 *           example:
 *             positions:
 *               - tableId: 1
 *                 x: 100
 *                 y: 100
 *                 width: 80
 *                 height: 80
 *                 rotation: 0
 *               - tableId: 2
 *                 x: 200
 *                 y: 100
 *                 width: 80
 *                 height: 80
 *                 rotation: 45
 *     responses:
 *       200:
 *         description: Table positions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: integer
 *                       example: 2
 *                       description: Number of tables updated
 *                     tables:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Unprocessable entity - Validation error
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/positions',
    floorPlanController.updateTablePositions.bind(floorPlanController)
);

export default router;
