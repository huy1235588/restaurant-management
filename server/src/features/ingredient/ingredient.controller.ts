import { Request, Response, NextFunction } from 'express';
import ingredientService from './ingredient.service';
import { ResponseHandler } from '@/shared/utils/response';

export class IngredientController {
  // ============================================
  // INGREDIENT ENDPOINTS
  // ============================================

  /**
   * GET /api/ingredients
   * Get all ingredients with filters
   */
  async getAllIngredients(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ingredientService.getAllIngredients(req.query as any);
      return ResponseHandler.success(res, 'Ingredients retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ingredients/low-stock
   * Get low stock ingredients
   */
  async getLowStockIngredients(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const ingredients = await ingredientService.getLowStockIngredients();
      return ResponseHandler.success(
        res,
        'Low stock ingredients retrieved successfully',
        ingredients
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ingredients/:id
   * Get ingredient by ID
   */
  async getIngredientById(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredientId = parseInt(req.params['id'] || '0');
      const ingredient = await ingredientService.getIngredientById(ingredientId);
      return ResponseHandler.success(res, 'Ingredient retrieved successfully', ingredient);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ingredients/code/:code
   * Get ingredient by code
   */
  async getIngredientByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params['code'] || '';
      const ingredient = await ingredientService.getIngredientByCode(code);
      return ResponseHandler.success(res, 'Ingredient retrieved successfully', ingredient);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ingredients
   * Create new ingredient
   */
  async createIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredient = await ingredientService.createIngredient(req.body);
      return ResponseHandler.created(res, 'Ingredient created successfully', ingredient);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/ingredients/:id
   * Update ingredient
   */
  async updateIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredientId = parseInt(req.params['id'] || '0');
      const ingredient = await ingredientService.updateIngredient(
        ingredientId,
        req.body
      );
      return ResponseHandler.success(res, 'Ingredient updated successfully', ingredient);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/ingredients/:id
   * Delete ingredient
   */
  async deleteIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredientId = parseInt(req.params['id'] || '0');
      await ingredientService.deleteIngredient(ingredientId);
      return ResponseHandler.success(res, 'Ingredient deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // INGREDIENT CATEGORY ENDPOINTS
  // ============================================

  /**
   * GET /api/ingredients/categories
   * Get all ingredient categories
   */
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const isActive =
        req.query['isActive'] !== undefined
          ? req.query['isActive'] === 'true'
          : undefined;
      const categories = await ingredientService.getAllCategories(isActive);
      return ResponseHandler.success(
        res,
        'Categories retrieved successfully',
        categories
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ingredients/categories/:id
   * Get category by ID
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = parseInt(req.params['id'] || '0');
      const category = await ingredientService.getCategoryById(categoryId);
      return ResponseHandler.success(res, 'Category retrieved successfully', category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ingredients/categories
   * Create new category
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await ingredientService.createCategory(req.body);
      return ResponseHandler.created(res, 'Category created successfully', category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/ingredients/categories/:id
   * Update category
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = parseInt(req.params['id'] || '0');
      const category = await ingredientService.updateCategory(
        categoryId,
        req.body
      );
      return ResponseHandler.success(res, 'Category updated successfully', category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/ingredients/categories/:id
   * Delete category
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = parseInt(req.params['id'] || '0');
      await ingredientService.deleteCategory(categoryId);
      return ResponseHandler.success(res, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new IngredientController();
