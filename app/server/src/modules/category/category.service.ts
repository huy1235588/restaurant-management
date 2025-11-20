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

@Injectable()
export class CategoryService {
    private readonly logger = new Logger(CategoryService.name);

    constructor(private readonly categoryRepository: CategoryRepository) {}

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
