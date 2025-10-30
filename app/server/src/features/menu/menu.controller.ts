import { Request, Response, NextFunction } from 'express';
import { menuService } from '@/features/menu/menu.service';
import { ApiResponse } from '@/shared/utils/response';

export class MenuController {

    /**
     * Count menu items by filter
     */
    async count(req: Request, res: Response, next: NextFunction) {
        try {
            const { categoryId, isAvailable, isActive } = req.query;
            const count = await menuService.countMenuItems({
                categoryId: categoryId ? parseInt(categoryId as string) : undefined,
                isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            });
            let message = 'Menu items count retrieved successfully';
            if (categoryId) message += ` for category ${categoryId}`;
            if (isAvailable !== undefined) message += ` with availability ${isAvailable}`;
            if (isActive !== undefined) message += ` with active status ${isActive}`;
            res.json(ApiResponse.success({ count }, message));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all menu items with pagination
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { categoryId, isAvailable, isActive, search, page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'asc' } = req.query;

            const paginatedMenuItems = await menuService.getAllMenuItems({
                filters: {
                    categoryId: categoryId ? parseInt(categoryId as string) : undefined,
                    isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
                    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                    search: search as string,
                },
                skip: (parseInt(page as string) - 1) * parseInt(limit as string),
                take: parseInt(limit as string),
                sortBy: sortBy as string,
                sortOrder: (sortOrder as string).toLowerCase() as 'asc' | 'desc',
            });

            res.json(ApiResponse.success(paginatedMenuItems, 'Menu items retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get menu item by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const itemId = parseInt(req.params['id'] || '0');

            const menuItem = await menuService.getMenuItemById(itemId);

            res.json(ApiResponse.success(menuItem, 'Menu item retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get menu item by code
     */
    async getByCode(req: Request, res: Response, next: NextFunction) {
        try {
            const code = req.params['code'] || '';

            const menuItem = await menuService.getMenuItemByCode(code);

            res.json(ApiResponse.success(menuItem, 'Menu item retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new menu item
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const menuItem = await menuService.createMenuItem(req.body);

            res.status(201).json(ApiResponse.success(menuItem, 'Menu item created successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update menu item
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const itemId = parseInt(req.params['id'] || '0');

            const menuItem = await menuService.updateMenuItem(itemId, req.body);

            res.json(ApiResponse.success(menuItem, 'Menu item updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete menu item
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const itemId = parseInt(req.params['id'] || '0');

            await menuService.deleteMenuItem(itemId);

            res.json(ApiResponse.success(null, 'Menu item deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update menu item availability
     */
    async updateAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const itemId = parseInt(req.params['id'] || '0');
            const { isAvailable } = req.body;

            const menuItem = await menuService.updateMenuItemAvailability(itemId, isAvailable);

            res.json(ApiResponse.success(menuItem, 'Menu item availability updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get menu items by category
     */
    async getByCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const categoryId = parseInt(req.params['categoryId'] || '0');

            const menuItems = await menuService.getMenuItemsByCategory(categoryId);

            res.json(ApiResponse.success(menuItems, 'Menu items retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}

export const menuController = new MenuController();
