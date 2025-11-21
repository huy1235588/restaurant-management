import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import {
    CategoryRepository,
    CategoryFilters,
} from '@/modules/category/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '@/modules/category/dto';
import { StorageService } from '@/modules/storage/storage.service';

@Injectable()
export class CategoryService {
    private readonly logger = new Logger(CategoryService.name);

    constructor(
        private readonly categoryRepository: CategoryRepository,
        private readonly storageService: StorageService,
    ) {}

    /**
     * Count categories
     */
    async countCategories(filters: CategoryFilters = {}) {
        return this.categoryRepository.count(filters);
    }

    /**
     * Get all categories
     */
    async getAllCategories(filters: CategoryFilters = {}) {
        return this.categoryRepository.findAll({ filters });
    }

    /**
     * Get category by ID
     */
    async getCategoryById(categoryId: number) {
        const category = await this.categoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    /**
     * Create new category
     */
    async createCategory(data: CreateCategoryDto) {
        // Check if category name already exists
        const existingCategory = await this.categoryRepository.findByName(
            data.categoryName,
        );

        if (existingCategory) {
            throw new BadRequestException('Category name already exists');
        }

        const category = await this.categoryRepository.create(data);

        this.logger.log(`Category created: ${category.categoryId}`);
        return category;
    }

    /**
     * Update category
     */
    async updateCategory(categoryId: number, data: UpdateCategoryDto) {
        const category = await this.getCategoryById(categoryId);

        // Check if category name is being changed and if it already exists
        if (data.categoryName && data.categoryName !== category.categoryName) {
            const existingCategory = await this.categoryRepository.findByName(
                data.categoryName,
            );

            if (existingCategory) {
                throw new BadRequestException('Category name already exists');
            }
        }

        // Delete old image if a new imagePath is provided
        if (
            data.imagePath &&
            category.imagePath &&
            data.imagePath !== category.imagePath
        ) {
            try {
                await this.storageService.deleteFile(category.imagePath);
                this.logger.log(
                    `Deleted old image for category: ${category.imagePath}`,
                );
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Unknown error';
                this.logger.warn(
                    `Failed to delete old image for category ${categoryId}: ${errorMessage}`,
                );
                // Continue with update even if old image deletion fails
            }
        }

        const updated = await this.categoryRepository.update(categoryId, data);

        this.logger.log(`Category updated: ${categoryId}`);
        return updated;
    }

    /**
     * Delete category
     */
    async deleteCategory(categoryId: number) {
        // Check if category exists and has menu items
        const category = await this.categoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (category.menuItems && category.menuItems.length > 0) {
            throw new BadRequestException(
                'Cannot delete category with menu items',
            );
        }

        // Delete the associated image file if exists
        if (category.imagePath) {
            try {
                await this.storageService.deleteFile(category.imagePath);
                this.logger.log(
                    `Deleted image for category: ${category.imagePath}`,
                );
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Unknown error';
                this.logger.warn(
                    `Failed to delete image for category ${categoryId}: ${errorMessage}`,
                );
                // Continue with deletion even if image deletion fails
            }
        }

        await this.categoryRepository.delete(categoryId);

        this.logger.log(`Category deleted: ${categoryId}`);
    }

    /**
     * Get category with menu items
     */
    async getCategoryWithItems(categoryId: number) {
        const category = await this.categoryRepository.findByIdWithItems(
            categoryId,
            true,
        );

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }
}
