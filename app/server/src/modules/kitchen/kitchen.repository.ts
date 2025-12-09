import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, KitchenOrder, KitchenOrderStatus } from '@/lib/prisma';
import { KitchenQueryHelper } from './helpers/kitchen-query.helper';

export interface KitchenOrderFilters {
    status?: KitchenOrderStatus;
    skip?: number;
    take?: number;
    include?: Prisma.KitchenOrderInclude;
    minimal?: boolean; // Use minimal includes for better performance
}

@Injectable()
export class KitchenRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Get appropriate includes based on query type
     */
    private getIncludes(minimal: boolean = false): Prisma.KitchenOrderInclude {
        return minimal
            ? KitchenQueryHelper.LIST_INCLUDES
            : KitchenQueryHelper.STANDARD_INCLUDES;
    }

    private buildWhereClause(
        filters?: KitchenOrderFilters,
    ): Prisma.KitchenOrderWhereInput {
        if (!filters) return {};

        const where: Prisma.KitchenOrderWhereInput = {};

        if (filters.status !== undefined) {
            where.status = filters.status;
        }

        return where;
    }

    async findAll(filters?: KitchenOrderFilters): Promise<KitchenOrder[]> {
        const includes = filters?.include || this.getIncludes(filters?.minimal);

        return this.prisma.kitchenOrder.findMany({
            where: this.buildWhereClause(filters),
            include: includes,
            skip: filters?.skip,
            take: filters?.take,
            orderBy: {
                createdAt: 'asc', // FIFO (first-come-first-served)
            },
        });
    }

    async findById(kitchenOrderId: number): Promise<KitchenOrder | null> {
        return this.prisma.kitchenOrder.findUnique({
            where: { kitchenOrderId },
            include: KitchenQueryHelper.STANDARD_INCLUDES,
        });
    }

    async findByOrderId(orderId: number): Promise<KitchenOrder | null> {
        return this.prisma.kitchenOrder.findUnique({
            where: { orderId },
            include: KitchenQueryHelper.STANDARD_INCLUDES,
        });
    }

    async create(data: Prisma.KitchenOrderCreateInput): Promise<KitchenOrder> {
        return this.prisma.kitchenOrder.create({
            data,
            include: {
                order: {
                    include: {
                        table: true,
                        orderItems: {
                            include: {
                                menuItem: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async update(
        kitchenOrderId: number,
        data: Prisma.KitchenOrderUpdateInput,
    ): Promise<KitchenOrder> {
        return this.prisma.kitchenOrder.update({
            where: { kitchenOrderId },
            data,
            include: KitchenQueryHelper.STANDARD_INCLUDES,
        });
    }

    /**
     * Find kitchen order by ID with minimal data (for status checks)
     */
    async findByIdMinimal(kitchenOrderId: number) {
        return this.prisma.kitchenOrder.findUnique({
            where: { kitchenOrderId },
            select: KitchenQueryHelper.STATUS_SELECT,
        });
    }

    /**
     * Count kitchen orders by status
     */
    async countByStatus(status?: KitchenOrderStatus): Promise<number> {
        return this.prisma.kitchenOrder.count({
            where: status ? { status } : {},
        });
    }

    async delete(kitchenOrderId: number): Promise<KitchenOrder> {
        return this.prisma.kitchenOrder.delete({
            where: { kitchenOrderId },
        });
    }
}
