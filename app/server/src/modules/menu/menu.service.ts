import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import {
    MenuItemRepository,
    MenuItemFilters,
    FindOptions,
} from '@/modules/menu/menu-item.repository';
import { CreateMenuItemDto, UpdateMenuItemDto } from '@/modules/menu/dto';
import { PrismaService } from '@/database/prisma.service';
import { StorageService } from '@/modules/storage/storage.service';

@Injectable()
export class MenuService {
    private readonly logger = new Logger(MenuService.name);

    constructor(
        private readonly menuItemRepository: MenuItemRepository,
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    /**
     * Count menu items by filter
     */
    async countMenuItems(filter?: MenuItemFilters) {
        return this.menuItemRepository.count(filter);
    }

    /**
     * Get all menu items with pagination
     */
    async getAllMenuItems(options?: FindOptions) {
        return this.menuItemRepository.findAllPaginated(options);
    }

    /**
     * Get menu item by ID
     */
    async getMenuItemById(itemId: number) {
        const menuItem = await this.menuItemRepository.findById(itemId);

        if (!menuItem) {
            throw new NotFoundException('Menu item not found');
        }

        return menuItem;
    }

    /**
     * Get menu item by code
     */
    async getMenuItemByCode(code: string) {
        const menuItem = await this.menuItemRepository.findByCode(code);

        if (!menuItem) {
            throw new NotFoundException('Menu item not found');
        }

        return menuItem;
    }

    /**
     * Create new menu item
     */
    async createMenuItem(data: CreateMenuItemDto) {
        // Check if item code already exists
        const existingItem = await this.menuItemRepository.findByCode(
            data.itemCode,
        );

        if (existingItem) {
            throw new BadRequestException('Item code already exists');
        }

        // Check if category exists
        const category = await this.prisma.category.findUnique({
            where: { categoryId: data.categoryId },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const menuItem = await this.menuItemRepository.create({
            itemCode: data.itemCode,
            itemName: data.itemName,
            price: data.price,
            cost: data.cost,
            description: data.description,
            imagePath: data.imagePath,
            isAvailable: data.isAvailable,
            isActive: data.isActive,
            preparationTime: data.preparationTime,
            spicyLevel: data.spicyLevel,
            isVegetarian: data.isVegetarian,
            calories: data.calories,
            displayOrder: data.displayOrder,
            category: {
                connect: { categoryId: data.categoryId },
            },
        });

        this.logger.log(`Menu item created: ${menuItem.itemId}`);
        return menuItem;
    }

    /**
     * Update menu item
     */
    async updateMenuItem(itemId: number, data: UpdateMenuItemDto) {
        const menuItem = await this.getMenuItemById(itemId);

        // Check if item code is being changed and if it already exists
        if (data.itemCode && data.itemCode !== menuItem.itemCode) {
            const existingItem = await this.menuItemRepository.findByCode(
                data.itemCode,
            );

            if (existingItem) {
                throw new BadRequestException('Item code already exists');
            }
        }

        // Check if category exists if being changed
        if (data.categoryId && data.categoryId !== menuItem.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { categoryId: data.categoryId },
            });

            if (!category) {
                throw new NotFoundException('Category not found');
            }
        }

        // Delete old image if a new imagePath is provided
        if (
            data.imagePath &&
            menuItem.imagePath &&
            data.imagePath !== menuItem.imagePath
        ) {
            try {
                await this.storageService.deleteFile(menuItem.imagePath);
                this.logger.log(
                    `Deleted old image for menu item: ${menuItem.imagePath}`,
                );
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Unknown error';
                this.logger.warn(
                    `Failed to delete old image for menu item ${itemId}: ${errorMessage}`,
                );
                // Continue with update even if old image deletion fails
            }
        }

        const { categoryId, ...rest } = data;
        type UpdateData = Omit<UpdateMenuItemDto, 'categoryId'> & {
            category?: { connect: { categoryId: number } };
        };
        const updateData: Partial<UpdateData> = { ...rest };
        if (categoryId) {
            updateData.category = {
                connect: { categoryId },
            };
        }

        const updated = await this.menuItemRepository.update(
            itemId,
            updateData,
        );

        this.logger.log(`Menu item updated: ${itemId}`);
        return updated;
    }

    /**
     * Delete menu item
     */
    async deleteMenuItem(itemId: number) {
        const menuItem = await this.getMenuItemById(itemId);

        // Delete the associated image file if exists
        if (menuItem.imagePath) {
            try {
                await this.storageService.deleteFile(menuItem.imagePath);
                this.logger.log(
                    `Deleted image for menu item: ${menuItem.imagePath}`,
                );
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Unknown error';
                this.logger.warn(
                    `Failed to delete image for menu item ${itemId}: ${errorMessage}`,
                );
                // Continue with deletion even if image deletion fails
            }
        }

        await this.menuItemRepository.delete(itemId);

        this.logger.log(`Menu item deleted: ${itemId}`);
    }

    /**
     * Update menu item availability
     */
    async updateMenuItemAvailability(itemId: number, isAvailable: boolean) {
        await this.getMenuItemById(itemId);

        const updated = await this.menuItemRepository.update(itemId, {
            isAvailable,
        });

        this.logger.log(`Menu item availability updated: ${itemId}`);
        return updated;
    }

    /**
     * Get menu items by category
     */
    async getMenuItemsByCategory(categoryId: number) {
        // Check if category exists
        const category = await this.prisma.category.findUnique({
            where: { categoryId },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return this.menuItemRepository.findAll({
            filters: {
                categoryId,
                isActive: true,
            },
        });
    }
}
