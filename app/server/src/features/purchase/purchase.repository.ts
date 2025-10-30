import { prisma } from '@/config/database';
import { BaseFilter, BaseFindOptions, BaseRepository } from '@/shared';
import { Prisma, PurchaseOrder } from '@prisma/client';

export interface PurchaseOrderFilters extends BaseFilter {
    supplierId?: number;
    status?: 'pending' | 'ordered' | 'received' | 'cancelled';
    fromDate?: string;
    toDate?: string;
    search?: string;
}

export class PurchaseOrderRepository extends BaseRepository<PurchaseOrder, PurchaseOrderFilters> {
    protected buildWhereClause(filters?: PurchaseOrderFilters): Prisma.PurchaseOrderWhereInput {
        if (!filters) return {};

        const where: Prisma.PurchaseOrderWhereInput = {};

        if (filters.status) where.status = filters.status;
        if (filters.supplierId) where.supplierId = filters.supplierId;
        if (filters.search) {
            where.OR = [
                {
                    orderNumber: {
                        contains: filters.search,
                        mode: 'insensitive'
                    }
                },
            ];
        }

        return where;
    }

    /**
     * Find all purchase orders with filters and pagination
     */
    async findAll(options?: BaseFindOptions<PurchaseOrderFilters>): Promise<PurchaseOrder[]> {
        const { filters, skip = 0, take = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};

        return prisma.purchaseOrder.findMany({
            where: this.buildWhereClause(filters),
            include: { supplier: true, items: true },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder),
        });
    }

    /**     
     * Count purchase orders based on filters
     */
    async count(filters?: PurchaseOrderFilters): Promise<number> {
        return prisma.purchaseOrder.count({
            where: this.buildWhereClause(filters),
        });
    }

    /**
     * Find purchase order by ID
     */
    async findById(purchaseOrderId: number) {
        return prisma.purchaseOrder.findUnique({
            where: { purchaseOrderId },
            include: {
                supplier: true,
                staff: {
                    select: {
                        staffId: true,
                        fullName: true,
                    },
                },
                items: {
                    include: {
                        ingredient: true,
                    },
                },
                batches: true,
            },
        });
    }

    /**
     * Find purchase order by order number
     */
    async findByOrderNumber(orderNumber: string) {
        return prisma.purchaseOrder.findUnique({
            where: { orderNumber },
            include: {
                supplier: true,
                items: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });
    }

    /**
     * Create new purchase order
     */
    async create(data: Prisma.PurchaseOrderCreateInput) {
        return prisma.purchaseOrder.create({
            data,
            include: {
                supplier: true,
                items: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });
    }

    /**
     * Update purchase order
     */
    async update(purchaseOrderId: number, data: Prisma.PurchaseOrderUpdateInput) {
        return prisma.purchaseOrder.update({
            where: { purchaseOrderId },
            data,
            include: {
                supplier: true,
                items: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });
    }

    /**
     * Delete purchase order
     */
    async delete(purchaseOrderId: number) {
        return prisma.purchaseOrder.delete({
            where: { purchaseOrderId },
        });
    }

    /**
     * Get pending purchase orders
     */
    async findPending() {
        return prisma.purchaseOrder.findMany({
            where: {
                status: 'pending',
            },
            include: {
                supplier: true,
                items: {
                    include: {
                        ingredient: true,
                    },
                },
            },
            orderBy: { orderDate: 'asc' },
        });
    }

    /**
     * Get purchase orders by supplier
     */
    async findBySupplier(supplierId: number) {
        return prisma.purchaseOrder.findMany({
            where: { supplierId },
            include: {
                items: {
                    include: {
                        ingredient: true,
                    },
                },
            },
            orderBy: { orderDate: 'desc' },
            take: 10,
        });
    }
}

export default new PurchaseOrderRepository();
