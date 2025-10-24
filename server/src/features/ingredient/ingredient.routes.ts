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
 * @route   GET /api/ingredients
 * @desc    Get all ingredients with filters
 * @access  Private (manager, admin)
 */
router.get(
    '/',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getAllIngredients.bind(ingredientController)
);

/**
 * @route   GET /api/ingredients/low-stock
 * @desc    Get low stock ingredients
 * @access  Private (manager, admin)
 */
router.get(
    '/low-stock',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getLowStockIngredients.bind(ingredientController)
);

/**
 * @route   GET /api/ingredients/code/:code
 * @desc    Get ingredient by code
 * @access  Private (manager, admin)
 */
router.get(
    '/code/:code',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getIngredientByCode.bind(ingredientController)
);

/**
 * @route   GET /api/ingredients/:id
 * @desc    Get ingredient by ID
 * @access  Private (manager, admin)
 */
router.get(
    '/:id',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getIngredientById.bind(ingredientController)
);

/**
 * @route   POST /api/ingredients
 * @desc    Create new ingredient
 * @access  Private (manager, admin)
 */
router.post(
    '/',
    authenticate,
    authorize('admin', 'manager'),
    validate(createIngredientSchema),
    ingredientController.createIngredient.bind(ingredientController)
);

/**
 * @route   PATCH /api/ingredients/:id
 * @desc    Update ingredient
 * @access  Private (manager, admin)
 */
router.patch(
    '/:id',
    authenticate,
    authorize('admin', 'manager'),
    validate(updateIngredientSchema),
    ingredientController.updateIngredient.bind(ingredientController)
);

/**
 * @route   DELETE /api/ingredients/:id
 * @desc    Delete ingredient
 * @access  Private (admin)
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
 * @route   GET /api/ingredients/categories
 * @desc    Get all ingredient categories
 * @access  Private (manager, admin)
 */
router.get(
    '/categories',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getAllCategories.bind(ingredientController)
);

/**
 * @route   GET /api/ingredients/categories/:id
 * @desc    Get category by ID
 * @access  Private (manager, admin)
 */
router.get(
    '/categories/:id',
    authenticate,
    authorize('admin', 'manager'),
    ingredientController.getCategoryById.bind(ingredientController)
);

/**
 * @route   POST /api/ingredients/categories
 * @desc    Create new category
 * @access  Private (manager, admin)
 */
router.post(
    '/categories',
    authenticate,
    authorize('admin', 'manager'),
    validate(createIngredientCategorySchema),
    ingredientController.createCategory.bind(ingredientController)
);

/**
 * @route   PATCH /api/ingredients/categories/:id
 * @desc    Update category
 * @access  Private (manager, admin)
 */
router.patch(
    '/categories/:id',
    authenticate,
    authorize('admin', 'manager'),
    validate(updateIngredientCategorySchema),
    ingredientController.updateCategory.bind(ingredientController)
);

/**
 * @route   DELETE /api/ingredients/categories/:id
 * @desc    Delete category
 * @access  Private (admin)
 */
router.delete(
    '/categories/:id',
    authenticate,
    authorize('admin'),
    ingredientController.deleteCategory.bind(ingredientController)
);

export default router;
