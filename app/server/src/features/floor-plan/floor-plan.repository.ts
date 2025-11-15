import { prisma } from '@/config/database';
import { Prisma, FloorPlanLayout } from '@prisma/client';
import { BaseRepository, BaseFindOptions, BaseFilter } from '@/shared/base';
import { NotFoundError } from '@/shared/utils/errors';

interface FloorPlanLayoutFilter extends BaseFilter {
    floor?: number;
}

export class FloorPlanLayoutRepository extends BaseRepository<FloorPlanLayout, FloorPlanLayoutFilter> {
    protected buildWhereClause(filters?: FloorPlanLayoutFilter): Prisma.FloorPlanLayoutWhereInput {
        if (!filters) {
            return {};
        }

        const { floor, search } = filters;

        const where: Prisma.FloorPlanLayoutWhereInput = {};

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

    async findByFloor(floor: number): Promise<FloorPlanLayout[]> {
        return prisma.floorPlanLayout.findMany({
            where: {
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

    async findByName(floor: number, name: string): Promise<FloorPlanLayout | null> {
        return prisma.floorPlanLayout.findFirst({
            where: {
                floor,
                name,
            },
        });
    }

    async activate(layoutId: number, floor: number): Promise<FloorPlanLayout> {
        // Deactivate all other layouts for this floor
        await prisma.floorPlanLayout.updateMany({
            where: { floor, isActive: true },
            data: { isActive: false },
        });

        // Activate the selected layout
        const layout = await this.findById(layoutId);
        if (!layout) {
            throw new NotFoundError('Floor plan layout not found');
        }

        return prisma.floorPlanLayout.update({
            where: { layoutId },
            data: { isActive: true },
        });
    }

    async duplicate(layoutId: number, newName: string): Promise<FloorPlanLayout> {
        const layout = await this.findById(layoutId);
        if (!layout) {
            throw new NotFoundError('Floor plan layout not found');
        }

        return prisma.floorPlanLayout.create({
            data: {
                name: newName,
                floor: layout.floor,
                description: layout.description,
                data: layout.data as any,
                isActive: false,
            },
        });
    }
}

export const floorPlanLayoutRepository = new FloorPlanLayoutRepository();
