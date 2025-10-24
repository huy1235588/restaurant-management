import { Router } from 'express';
import ingredientController from './ingredient.controller';
import { authenticate, authorize } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import {
    createIngredientSchema,
    updateIngredientSchema,
    createIngredientCategorySchema,
    updateIngredientCategorySchema,
} from '@/features/ingredient/validators/ingredient.validator';

const router = Router();

// ============================================
// INGREDIENT ROUTES
// ============================================

/**
 * @swagger
 * /ingredients:
 *   get:
 *     summary: Get all ingredients
 *     description: Retrieve a list of all ingredients with optional filters
 *     tags: [Ingredients]
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
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: Ingredients retrieved successfully
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
 *                   example: Ingredients retrieved successfully
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
 *                       unit:
 *                         type: string
 *                       currentStock:
 *                         type: number
 *                       minStock:
 *                         type: number
 *                       maxStock:
 *                         type: number
 *                       category:
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
    '/',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getAllIngredients.bind(ingredientController)
);

/**
 * @swagger
 * /ingredients/low-stock:
 *   get:
 *     summary: Get low stock ingredients
 *     description: Retrieve ingredients that are below minimum stock level
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock ingredients retrieved successfully
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
 *                   example: Low stock ingredients retrieved successfully
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
 *                       currentStock:
 *                         type: number
 *                       minStock:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/low-stock',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getLowStockIngredients.bind(ingredientController)
);

/**
 * @swagger
 * /ingredients/code/{code}:
 *   get:
 *     summary: Get ingredient by code
 *     description: Retrieve a specific ingredient by its code
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Ingredient code
 *     responses:
 *       200:
 *         description: Ingredient retrieved successfully
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
 *                   example: Ingredient retrieved successfully
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
 *                     unit:
 *                       type: string
 *                     currentStock:
 *                       type: number
 *                     minStock:
 *                       type: number
 *                     maxStock:
 *                       type: number
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ingredient not found
 */
router.get(
    '/code/:code',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getIngredientByCode.bind(ingredientController)
);

/**
 * @swagger
 * /ingredients/{id}:
 *   get:
 *     summary: Get ingredient by ID
 *     description: Retrieve a specific ingredient by its ID
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ingredient ID
 *     responses:
 *       200:
 *         description: Ingredient retrieved successfully
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
 *                   example: Ingredient retrieved successfully
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
 *                     unit:
 *                       type: string
 *                     currentStock:
 *                       type: number
 *                     minStock:
 *                       type: number
 *                     maxStock:
 *                       type: number
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ingredient not found
 */
router.get(
    '/:id',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getIngredientById.bind(ingredientController)
);

/**
 * @swagger
 * /ingredients:
 *   post:
 *     summary: Create new ingredient
 *     description: Create a new ingredient in the system
 *     tags: [Ingredients]
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
 *               - unit
 *               - minStock
 *               - maxStock
 *               - categoryId
 *             properties:
 *               code:
 *                 type: string
 *                 description: Unique ingredient code
 *               name:
 *                 type: string
 *                 description: Ingredient name
 *               description:
 *                 type: string
 *                 description: Ingredient description
 *               unit:
 *                 type: string
 *                 description: Unit of measurement
 *               minStock:
 *                 type: number
 *                 description: Minimum stock level
 *               maxStock:
 *                 type: number
 *                 description: Maximum stock level
 *               categoryId:
 *                 type: integer
 *                 description: Category ID
 *     responses:
 *       201:
 *         description: Ingredient created successfully
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
 *                   example: Ingredient created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
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
    validate(createIngredientSchema),
    ingredientController.createIngredient.bind(ingredientController)
);

/**
 * @swagger
 * /ingredients/{id}:
 *   patch:
 *     summary: Update ingredient
 *     description: Update an existing ingredient
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ingredient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Unique ingredient code
 *               name:
 *                 type: string
 *                 description: Ingredient name
 *               description:
 *                 type: string
 *                 description: Ingredient description
 *               unit:
 *                 type: string
 *                 description: Unit of measurement
 *               minStock:
 *                 type: number
 *                 description: Minimum stock level
 *               maxStock:
 *                 type: number
 *                 description: Maximum stock level
 *               categoryId:
 *                 type: integer
 *                 description: Category ID
 *     responses:
 *       200:
 *         description: Ingredient updated successfully
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
 *                   example: Ingredient updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ingredient not found
 */
router.patch(
    '/:id',
    authenticate,
    authorize('admin', 'manager'),
    validate(updateIngredientSchema),
    ingredientController.updateIngredient.bind(ingredientController)
);

/**
 * @swagger
 * /ingredients/{id}:
 *   delete:
 *     summary: Delete ingredient
 *     description: Delete an ingredient from the system
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ingredient ID
 *     responses:
 *       200:
 *         description: Ingredient deleted successfully
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
 *                   example: Ingredient deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ingredient not found
 */
router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    ingredientController.deleteIngredient.bind(ingredientController)
);

// ============================================
// INGREDIENT CATEGORY ROUTES
// ============================================

/**
 * @swagger
 * /ingredients/categories:
 *   get:
 *     summary: Get all ingredient categories
 *     description: Retrieve a list of all ingredient categories
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/categories',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getAllCategories.bind(ingredientController)
);

/**
 * @swagger
 * /ingredients/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve a specific ingredient category by its ID
 *     tags: [Ingredients]
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 */
router.get(
    '/categories/:id',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getCategoryById.bind(ingredientController)
);

/**
 * @swagger
 * /ingredients/categories:
 *   post:
 *     summary: Create new category
 *     description: Create a new ingredient category
 *     tags: [Ingredients]
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
 *                 description: Category name
 *               description:
 *                 type: string
 *                 description: Category description
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
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    '/categories',
    authenticate,
    authorize('admin', 'manager'),
    validate(createIngredientCategorySchema),
    ingredientController.createCategory.bind(ingredientController)
);

/**
 * @swagger
 * /ingredients/categories/{id}:
 *   patch:
 *     summary: Update category
 *     description: Update an existing ingredient category
 *     tags: [Ingredients]
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
 *                 description: Category name
 *               description:
 *                 type: string
 *                 description: Category description
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
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 */
router.patch(
    '/categories/:id',
    authenticate,
    authorize('admin', 'manager'),
    validate(updateIngredientCategorySchema),
    ingredientController.updateCategory.bind(ingredientController)
);

/**
 * @swagger
 * /ingredients/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Delete an ingredient category from the system
 *     tags: [Ingredients]
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
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 */
router.delete(
    '/categories/:id',
    authenticate,
    authorize('admin'),
    ingredientController.deleteCategory.bind(ingredientController)
);

export default router;
