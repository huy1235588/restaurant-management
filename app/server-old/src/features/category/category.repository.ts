import { prisma } from '@/config/database';
import { Prisma, Category } from '@prisma/client';
import { BaseRepository, BaseFindOptions, BaseFilter } from '@/shared/base';

export type CategoryWithItems = Prisma.CategoryGetPayload<{
    include: { menuItems: true }
}>;

interface CategoryFilter extends BaseFilter {
    search?: string;
    isActive?: boolean;
}

export class CategoryRepository extends BaseRepository<Category, CategoryFilter> {
    protected buildWhereClause(filters?: CategoryFilter): Prisma.CategoryWhereInput {
        if (!filters) {
            return {};
        }

        const where: Prisma.CategoryWhereInput = {};

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.search) {
            where.OR = [
                { categoryName: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<CategoryFilter>): Promise<Category[]> {
        const { filters, skip = 0, take = 10, sortBy = 'displayOrder', sortOrder = 'asc' } = options || {};

        return prisma.category.findMany({
            where: this.buildWhereClause(filters),
            include: {
                menuItems: {
                    where: { isActive: true },
                },
            },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder) as Prisma.CategoryOrderByWithRelationInput,
        });
    }

    async count(filters?: CategoryFilter): Promise<number> {
        return prisma.category.count({
            where: this.buildWhereClause(filters),
        });
    }

    async create(data: Prisma.CategoryCreateInput): Promise<Category> {
        return prisma.category.create({ data });
    }

    async findById(categoryId: number): Promise<CategoryWithItems | null> {
        return prisma.category.findUnique({
            where: { categoryId },
            include: { menuItems: true },
        });
    }

    async findByName(categoryName: string): Promise<Category | null> {
        return prisma.category.findFirst({
            where: { categoryName },
        });
    }

    async findByIdWithItems(categoryId: number, activeOnly: boolean = true) {
        return prisma.category.findUnique({
            where: { categoryId },
            include: {
                menuItems: {
                    where: activeOnly ? { isActive: true } : undefined,
                    orderBy: { displayOrder: 'asc' }
                }
            }
        });
    }

    async update(categoryId: number, data: Prisma.CategoryUpdateInput): Promise<Category> {
        return prisma.category.update({
            where: { categoryId },
            data,
        });
    }

    async delete(categoryId: number): Promise<Category> {
        return prisma.category.delete({ where: { categoryId } });
    }
}

export default new CategoryRepository();
