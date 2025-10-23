import { Request, Response, NextFunction } from 'express';
import { menuService } from '@/features/menu/menu.service';
import { ApiResponse } from '@/shared/utils/response';

export class MenuController {
    /**
     * Get all menu items
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { categoryId, isAvailable, isActive, search } = req.query;

            const menuItems = await menuService.getAllMenuItems({
                categoryId: categoryId ? parseInt(categoryId as string) : undefined,
                isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                search: search as string,
            });

            res.json(ApiResponse.success(menuItems, 'Menu items retrieved successfully'));
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
