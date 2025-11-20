import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, Category } from '@prisma/generated/client';

export type CategoryWithItems = Prisma.CategoryGetPayload<{
    include: { menuItems: true };
}>;

export interface CategoryFilters {
    isActive?: boolean;
    search?: string;
}

export interface FindOptions {
    filters?: CategoryFilters;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class CategoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    private buildWhereClause(
        filters?: CategoryFilters,
    ): Prisma.CategoryWhereInput {
        if (!filters) return {};

        const where: Prisma.CategoryWhereInput = {};

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.search) {
            where.OR = [
                {
                    categoryName: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        return where;
    }

    async findAll(options?: FindOptions): Promise<Category[]> {
        const {
            filters,
            skip = 0,
            take = 100,
            sortBy = 'displayOrder',
            sortOrder = 'asc',
        } = options || {};

        return this.prisma.category.findMany({
            where: this.buildWhereClause(filters),
            include: {
                menuItems: {
                    where: { isActive: true },
                },
            },
            skip,
            take,
            orderBy: { [sortBy]: sortOrder },
        });
    }

    async count(filters?: CategoryFilters): Promise<number> {
        return this.prisma.category.count({
            where: this.buildWhereClause(filters),
        });
    }

    async create(data: Prisma.CategoryCreateInput): Promise<Category> {
        return this.prisma.category.create({ data });
    }

    async findById(categoryId: number): Promise<CategoryWithItems | null> {
        return this.prisma.category.findUnique({
            where: { categoryId },
            include: { menuItems: true },
        });
    }

    async findByName(categoryName: string): Promise<Category | null> {
        return this.prisma.category.findFirst({
            where: { categoryName },
        });
    }

    async findByIdWithItems(
        categoryId: number,
        activeOnly: boolean = true,
    ): Promise<CategoryWithItems | null> {
        return this.prisma.category.findUnique({
            where: { categoryId },
            include: {
                menuItems: {
                    where: activeOnly ? { isActive: true } : undefined,
                    orderBy: { displayOrder: 'asc' },
                },
            },
        });
    }

    async update(
        categoryId: number,
        data: Prisma.CategoryUpdateInput,
    ): Promise<Category> {
        return this.prisma.category.update({
            where: { categoryId },
            data,
        });
    }

    async delete(categoryId: number): Promise<Category> {
        return this.prisma.category.delete({ where: { categoryId } });
    }
}
