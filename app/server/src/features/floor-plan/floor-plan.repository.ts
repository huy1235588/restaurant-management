import { prisma } from '@/config/database';
import { Prisma, FloorPlanLayout, FloorPlanBackground } from '@prisma/client';
import { BaseRepository, BaseFindOptions, BaseFilter } from '@/shared/base';
import { NotFoundError } from '@/shared/utils/errors';

interface FloorPlanLayoutFilter extends BaseFilter {
    floor?: number;
    restaurant?: number;
}

interface FloorPlanBackgroundFilter extends BaseFilter {
    floor?: number;
    restaurant?: number;
}

export class FloorPlanLayoutRepository extends BaseRepository<FloorPlanLayout, FloorPlanLayoutFilter> {
    protected buildWhereClause(filters?: FloorPlanLayoutFilter): Prisma.FloorPlanLayoutWhereInput {
        if (!filters) {
            return {};
        }

        const { floor, restaurant, search } = filters;

        const where: Prisma.FloorPlanLayoutWhereInput = {};

        if (restaurant) {
            where.restaurant = restaurant;
        }
        if (floor !== undefined) {
            where.floor = floor;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<FloorPlanLayoutFilter>): Promise<FloorPlanLayout[]> {
        const { filters, skip = 0, take = 10, sortBy = 'createdAt', sortOrder = 'asc' } = options || {};

        return prisma.floorPlanLayout.findMany({
            where: this.buildWhereClause(filters),
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder) as Prisma.FloorPlanLayoutOrderByWithRelationInput,
        });
    }

    async count(filters?: FloorPlanLayoutFilter): Promise<number> {
        return prisma.floorPlanLayout.count({
            where: this.buildWhereClause(filters),
        });
    }

    async findById(layoutId: number): Promise<FloorPlanLayout | null> {
        return prisma.floorPlanLayout.findUnique({
            where: { layoutId },
        });
    }

    async findByFloor(restaurant: number, floor: number): Promise<FloorPlanLayout[]> {
        return prisma.floorPlanLayout.findMany({
            where: {
                restaurant,
                floor,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async create(data: Prisma.FloorPlanLayoutCreateInput): Promise<FloorPlanLayout> {
        return prisma.floorPlanLayout.create({ data });
    }

    async update(layoutId: number, data: Prisma.FloorPlanLayoutUpdateInput): Promise<FloorPlanLayout> {
        const layout = await this.findById(layoutId);
        if (!layout) {
            throw new NotFoundError('Floor plan layout not found');
        }

        return prisma.floorPlanLayout.update({
            where: { layoutId },
            data,
        });
    }

    async delete(layoutId: number): Promise<void> {
        const layout = await this.findById(layoutId);
        if (!layout) {
            throw new NotFoundError('Floor plan layout not found');
        }

        await prisma.floorPlanLayout.delete({
            where: { layoutId },
        });
    }

    async findByName(restaurant: number, floor: number, name: string): Promise<FloorPlanLayout | null> {
        return prisma.floorPlanLayout.findFirst({
            where: {
                restaurant,
                floor,
                name,
            },
        });
    }
}

export class FloorPlanBackgroundRepository extends BaseRepository<FloorPlanBackground, FloorPlanBackgroundFilter> {
    protected buildWhereClause(filters?: FloorPlanBackgroundFilter): Prisma.FloorPlanBackgroundWhereInput {
        if (!filters) {
            return {};
        }

        const { floor, restaurant } = filters;

        const where: Prisma.FloorPlanBackgroundWhereInput = {};

        if (restaurant) {
            where.restaurant = restaurant;
        }
        if (floor !== undefined) {
            where.floor = floor;
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<FloorPlanBackgroundFilter>): Promise<FloorPlanBackground[]> {
        const { filters, skip = 0, take = 10, sortBy = 'createdAt', sortOrder = 'asc' } = options || {};

        return prisma.floorPlanBackground.findMany({
            where: this.buildWhereClause(filters),
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder) as Prisma.FloorPlanBackgroundOrderByWithRelationInput,
        });
    }

    async count(filters?: FloorPlanBackgroundFilter): Promise<number> {
        return prisma.floorPlanBackground.count({
            where: this.buildWhereClause(filters),
        });
    }

    async findById(backgroundId: number): Promise<FloorPlanBackground | null> {
        return prisma.floorPlanBackground.findUnique({
            where: { backgroundId },
        });
    }

    async findByFloor(restaurant: number, floor: number): Promise<FloorPlanBackground | null> {
        return prisma.floorPlanBackground.findFirst({
            where: {
                restaurant,
                floor,
            },
        });
    }

    async create(data: Prisma.FloorPlanBackgroundCreateInput): Promise<FloorPlanBackground> {
        return prisma.floorPlanBackground.create({ data });
    }

    async update(backgroundId: number, data: Prisma.FloorPlanBackgroundUpdateInput): Promise<FloorPlanBackground> {
        const background = await this.findById(backgroundId);
        if (!background) {
            throw new NotFoundError('Floor plan background not found');
        }

        return prisma.floorPlanBackground.update({
            where: { backgroundId },
            data,
        });
    }

    async delete(backgroundId: number): Promise<void> {
        const background = await this.findById(backgroundId);
        if (!background) {
            throw new NotFoundError('Floor plan background not found');
        }

        await prisma.floorPlanBackground.delete({
            where: { backgroundId },
        });
    }

    async deleteByFloor(restaurant: number, floor: number): Promise<void> {
        await prisma.floorPlanBackground.deleteMany({
            where: {
                restaurant,
                floor,
            },
        });
    }
}

export const floorPlanLayoutRepository = new FloorPlanLayoutRepository();
export const floorPlanBackgroundRepository = new FloorPlanBackgroundRepository();
