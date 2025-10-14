import menuItemRepository from '@/repositories/menuItem.repository';
import categoryRepository from '@/repositories/category.repository';
import { NotFoundError, BadRequestError } from '@/utils/errors';

interface MenuItemFilters {
    categoryId?: number;
    isAvailable?: boolean;
    isActive?: boolean;
    search?: string;
}

interface CreateMenuItemData {
    itemCode: string;
    itemName: string;
    categoryId: number;
    price: number;
    cost?: number;
    description?: string;
    imageUrl?: string;
    isAvailable?: boolean;
    isActive?: boolean;
    preparationTime?: number;
    spicyLevel?: number;
    isVegetarian?: boolean;
    calories?: number;
    displayOrder?: number;
}

interface UpdateMenuItemData {
    itemCode?: string;
    itemName?: string;
    categoryId?: number;
    price?: number;
    cost?: number;
    description?: string;
    imageUrl?: string;
    isAvailable?: boolean;
    isActive?: boolean;
    preparationTime?: number;
    spicyLevel?: number;
    isVegetarian?: boolean;
    calories?: number;
    displayOrder?: number;
}

export class MenuService {
    /**
     * Get all menu items
     */
    async getAllMenuItems(filters: MenuItemFilters = {}) {
        return menuItemRepository.findAll(filters);
    }

    /**
     * Get menu item by ID
     */
    async getMenuItemById(itemId: number) {
        const menuItem = await menuItemRepository.findById(itemId);

        if (!menuItem) {
            throw new NotFoundError('Menu item not found');
        }

        return menuItem;
    }

    /**
     * Get menu item by code
     */
    async getMenuItemByCode(code: string) {
        const menuItem = await menuItemRepository.findByCode(code);

        if (!menuItem) {
            throw new NotFoundError('Menu item not found');
        }

        return menuItem;
    }

    /**
     * Create new menu item
     */
    async createMenuItem(data: CreateMenuItemData) {
        // Check if item code already exists
        const existingItem = await menuItemRepository.findByCode(data.itemCode);

        if (existingItem) {
            throw new BadRequestError('Item code already exists');
        }

        // Check if category exists
        const category = await categoryRepository.findById(data.categoryId);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        // Transform data to match Prisma input
        const createData: any = {
            ...data,
            category: {
                connect: { categoryId: data.categoryId }
            }
        };
        delete createData.categoryId;

        return menuItemRepository.create(createData);
    }

    /**
     * Update menu item
     */
    async updateMenuItem(itemId: number, data: UpdateMenuItemData) {
        const menuItem = await this.getMenuItemById(itemId);

        // Check if item code is being changed and if it already exists
        if (data.itemCode && data.itemCode !== menuItem.itemCode) {
            const existingItem = await menuItemRepository.findByCode(data.itemCode);

            if (existingItem) {
                throw new BadRequestError('Item code already exists');
            }
        }

        // Check if category exists if being changed
        if (data.categoryId && data.categoryId !== menuItem.categoryId) {
            const category = await categoryRepository.findById(data.categoryId);

            if (!category) {
                throw new NotFoundError('Category not found');
            }
        }

        return menuItemRepository.update(itemId, data);
    }

    /**
     * Delete menu item
     */
    async deleteMenuItem(itemId: number) {
        await this.getMenuItemById(itemId);

        return menuItemRepository.delete(itemId);
    }

    /**
     * Update menu item availability
     */
    async updateMenuItemAvailability(itemId: number, isAvailable: boolean) {
        await this.getMenuItemById(itemId);

        return menuItemRepository.update(itemId, { isAvailable });
    }

    /**
     * Get menu items by category
     */
    async getMenuItemsByCategory(categoryId: number) {
        // Check if category exists
        const category = await categoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        return menuItemRepository.findAll({
            categoryId,
            isActive: true,
        });
    }
}

export const menuService = new MenuService();
