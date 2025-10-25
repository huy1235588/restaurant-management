import categoryRepository from '@/features/category/category.repository';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';

interface CategoryFilters {
    isActive?: boolean;
}

interface CreateCategoryData {
    categoryName: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
    imageUrl?: string;
}

interface UpdateCategoryData {
    categoryName?: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
    imageUrl?: string;
}

export class CategoryService {
    /**
     * Get all categories
     */
    async getAllCategories(filters: CategoryFilters = {}) {
        return categoryRepository.findAll({ filters });
    }

    /**
     * Get category by ID
     */
    async getCategoryById(categoryId: number) {
        const category = await categoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        return category;
    }

    /**
     * Create new category
     */
    async createCategory(data: CreateCategoryData) {
        // Check if category name already exists
        const existingCategory = await categoryRepository.findByName(data.categoryName);

        if (existingCategory) {
            throw new BadRequestError('Category name already exists');
        }

        return categoryRepository.create(data);
    }

    /**
     * Update category
     */
    async updateCategory(categoryId: number, data: UpdateCategoryData) {
        const category = await this.getCategoryById(categoryId);

        // Check if category name is being changed and if it already exists
        if (data.categoryName && data.categoryName !== category.categoryName) {
            const existingCategory = await categoryRepository.findByName(data.categoryName);

            if (existingCategory) {
                throw new BadRequestError('Category name already exists');
            }
        }

        return categoryRepository.update(categoryId, data);
    }

    /**
     * Delete category
     */
    async deleteCategory(categoryId: number) {
        // Check if category exists and has menu items
        const category = await categoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        if (category.menuItems && category.menuItems.length > 0) {
            throw new BadRequestError('Cannot delete category with menu items');
        }

        return categoryRepository.delete(categoryId);
    }

    /**
     * Get category with menu items
     */
    async getCategoryWithItems(categoryId: number) {
        const category = await categoryRepository.findByIdWithItems(categoryId, true);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        return category;
    }
}

export const categoryService = new CategoryService();
