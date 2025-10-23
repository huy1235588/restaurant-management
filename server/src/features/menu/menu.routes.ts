import { Router } from 'express';
import { menuController } from '@/features/menu/menu.controller';
import { authenticate } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import {
    createMenuItemSchema,
    updateMenuItemSchema,
    updateMenuItemAvailabilitySchema,
} from '@/features/menu/validators';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /menu:
 *   get:
 *     summary: Get all menu items
 *     description: Retrieve a list of all menu items
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu items retrieved successfully
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
 *                   example: Menu items retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       categoryId:
 *                         type: integer
 *                       isAvailable:
 *                         type: boolean
 *                       imageUrl:
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
// GET /api/menu - Get all menu items
router.get('/', menuController.getAll.bind(menuController));

/**
 * @swagger
 * /menu/code/{code}:
 *   get:
 *     summary: Get menu item by code
 *     description: Retrieve a menu item by its unique code
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item code
 *     responses:
 *       200:
 *         description: Menu item retrieved successfully
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
 *                   example: Menu item retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     categoryId:
 *                       type: integer
 *                     isAvailable:
 *                       type: boolean
 *                     imageUrl:
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
 *         description: Menu item not found
 *       500:
 *         description: Internal server error
 */
// GET /api/menu/code/:code - Get menu item by code
router.get('/code/:code', menuController.getByCode.bind(menuController));

/**
 * @swagger
 * /menu/category/{categoryId}:
 *   get:
 *     summary: Get menu items by category
 *     description: Retrieve all menu items belonging to a specific category
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Menu items retrieved successfully
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
 *                   example: Menu items retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       categoryId:
 *                         type: integer
 *                       isAvailable:
 *                         type: boolean
 *                       imageUrl:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
// GET /api/menu/category/:categoryId - Get menu items by category
router.get('/category/:categoryId', menuController.getByCategory.bind(menuController));

/**
 * @swagger
 * /menu/{id}:
 *   get:
 *     summary: Get menu item by ID
 *     description: Retrieve a specific menu item by its ID
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item retrieved successfully
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
 *                   example: Menu item retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     categoryId:
 *                       type: integer
 *                     isAvailable:
 *                       type: boolean
 *                     imageUrl:
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
 *         description: Menu item not found
 *       500:
 *         description: Internal server error
 */
// GET /api/menu/:id - Get menu item by ID
router.get('/:id', menuController.getById.bind(menuController));

/**
 * @swagger
 * /menu:
 *   post:
 *     summary: Create a new menu item
 *     description: Create a new menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - price
 *               - categoryId
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Unique menu item code
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Menu item name
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Menu item description
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Menu item price
 *               categoryId:
 *                 type: integer
 *                 description: Category ID
 *               isAvailable:
 *                 type: boolean
 *                 description: Whether the item is available
 *                 default: true
 *               imageUrl:
 *                 type: string
 *                 description: Image URL for the menu item
 *           example:
 *             code: "MC001"
 *             name: "Grilled Chicken"
 *             description: "Tender grilled chicken with herbs"
 *             price: 150000
 *             categoryId: 1
 *             isAvailable: true
 *     responses:
 *       201:
 *         description: Menu item created successfully
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
 *                   example: Menu item created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     categoryId:
 *                       type: integer
 *                     isAvailable:
 *                       type: boolean
 *                     imageUrl:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input or duplicate code
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// POST /api/menu - Create new menu item
router.post('/', validate(createMenuItemSchema), menuController.create.bind(menuController));

/**
 * @swagger
 * /menu/{id}:
 *   put:
 *     summary: Update a menu item
 *     description: Update an existing menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Unique menu item code
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Menu item name
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Menu item description
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Menu item price
 *               categoryId:
 *                 type: integer
 *                 description: Category ID
 *               isAvailable:
 *                 type: boolean
 *                 description: Whether the item is available
 *               imageUrl:
 *                 type: string
 *                 description: Image URL for the menu item
 *           example:
 *             name: "Updated Grilled Chicken"
 *             description: "Updated tender grilled chicken with herbs"
 *             price: 160000
 *             isAvailable: true
 *     responses:
 *       200:
 *         description: Menu item updated successfully
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
 *                   example: Menu item updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     categoryId:
 *                       type: integer
 *                     isAvailable:
 *                       type: boolean
 *                     imageUrl:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input or duplicate code
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Internal server error
 */
// PUT /api/menu/:id - Update menu item
router.put('/:id', validate(updateMenuItemSchema), menuController.update.bind(menuController));

/**
 * @swagger
 * /menu/{id}/availability:
 *   patch:
 *     summary: Update menu item availability
 *     description: Update the availability status of a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isAvailable
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *                 description: Whether the item is available
 *           example:
 *             isAvailable: false
 *     responses:
 *       200:
 *         description: Menu item availability updated successfully
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
 *                   example: Menu item availability updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     isAvailable:
 *                       type: boolean
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Internal server error
 */
// PATCH /api/menu/:id/availability - Update menu item availability
router.patch('/:id/availability', validate(updateMenuItemAvailabilitySchema), menuController.updateAvailability.bind(menuController));

/**
 * @swagger
 * /menu/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     description: Delete an existing menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
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
 *                   example: Menu item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Internal server error
 */
// DELETE /api/menu/:id - Delete menu item
router.delete('/:id', menuController.delete.bind(menuController));

export default router;
