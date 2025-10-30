import { Router } from 'express';
import { categoryController } from '@/features/category/category.controller';
import { authenticate } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import { createCategorySchema, updateCategorySchema } from '@/features/category/validators';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /categories/count:
 *   get:
 *     summary: Get categories count
 *     description: Retrieve the total count of categories with optional filtering
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Count retrieved successfully
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
 *                   example: Categories count retrieved successfully with active status true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/count', categoryController.count.bind(categoryController));

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories with pagination
 *     description: Retrieve a paginated list of menu categories with filtering and sorting options
 *     tags: [Categories]
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
 *         name: isActive
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by active status (true/false)
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by category name
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           default: name
 *         description: Field to sort by (e.g., name, createdAt, displayOrder)
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
 *         description: Categories retrieved successfully
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
 *                   example: Categories retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoryId:
 *                             type: integer
 *                           categoryName:
 *                             type: string
 *                           description:
 *                             type: string
 *                           displayOrder:
 *                             type: integer
 *                           isActive:
 *                             type: boolean
 *                           imageUrl:
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
// GET /api/categories - Get all categories
router.get('/', categoryController.getAll.bind(categoryController));

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve a specific category by its ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
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
 *                   example: Category retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
// GET /api/categories/:id - Get category by ID
router.get('/:id', categoryController.getById.bind(categoryController));

/**
 * @swagger
 * /categories/{id}/items:
 *   get:
 *     summary: Get category with menu items
 *     description: Retrieve a category along with all its associated menu items
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category with items retrieved successfully
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
 *                   example: Category with items retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     menuItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           isAvailable:
 *                             type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
// GET /api/categories/:id/items - Get category with menu items
router.get('/:id/items', categoryController.getWithItems.bind(categoryController));

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     description: Create a new menu category
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Category name
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Category description
 *               isActive:
 *                 type: boolean
 *                 description: Whether the category is active
 *                 default: true
 *           example:
 *             name: "Main Courses"
 *             description: "Main course dishes"
 *             isActive: true
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   example: Category created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// POST /api/categories - Create new category
router.post('/', validate(createCategorySchema), categoryController.create.bind(categoryController));

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     description: Update an existing menu category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
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
 *                 description: Category name
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Category description
 *               isActive:
 *                 type: boolean
 *                 description: Whether the category is active
 *           example:
 *             name: "Updated Main Courses"
 *             description: "Updated main course dishes"
 *             isActive: true
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   example: Category updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
// PUT /api/categories/:id - Update category
router.put('/:id', validate(updateCategorySchema), categoryController.update.bind(categoryController));

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     description: Delete an existing menu category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
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
 *                   example: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
// DELETE /api/categories/:id - Delete category
router.delete('/:id', categoryController.delete.bind(categoryController));

export default router;
