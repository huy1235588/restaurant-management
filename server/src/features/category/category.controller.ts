import { Request, Response, NextFunction } from 'express';
import { categoryService } from '@/features/category/category.service';
import { ApiResponse } from '@/shared/utils/response';

export class CategoryController {
    /**
     * Get all categories
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { isActive } = req.query;

            const categories = await categoryService.getAllCategories({
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            });

            res.json(ApiResponse.success(categories, 'Categories retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get category by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const categoryId = parseInt(req.params['id'] || '0');

            const category = await categoryService.getCategoryById(categoryId);

            res.json(ApiResponse.success(category, 'Category retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new category
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await categoryService.createCategory(req.body);

            res.status(201).json(ApiResponse.success(category, 'Category created successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update category
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const categoryId = parseInt(req.params['id'] || '0');

            const category = await categoryService.updateCategory(categoryId, req.body);

            res.json(ApiResponse.success(category, 'Category updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete category
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const categoryId = parseInt(req.params['id'] || '0');

            await categoryService.deleteCategory(categoryId);

            res.json(ApiResponse.success(null, 'Category deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get category with menu items
     */
    async getWithItems(req: Request, res: Response, next: NextFunction) {
        try {
            const categoryId = parseInt(req.params['id'] || '0');

            const category = await categoryService.getCategoryWithItems(categoryId);

            res.json(ApiResponse.success(category, 'Category with items retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}

export const categoryController = new CategoryController();
