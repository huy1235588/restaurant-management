import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';

export interface PurchaseOrderFilters {
    supplierId?: number;
    status?: 'pending' | 'ordered' | 'received' | 'cancelled';
    fromDate?: string;
    toDate?: string;
}

class PurchaseOrderRepository {
    /**
     * Find all purchase orders with filters and pagination
     */
    async findAll(
        filters: PurchaseOrderFilters = {},
        page: number = 1,
        limit: number = 20
    ) {
        const where: Prisma.PurchaseOrderWhereInput = {};

        if (filters.supplierId) {
            where.supplierId = filters.supplierId;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.fromDate || filters.toDate) {
            where.orderDate = {};
            if (filters.fromDate) {
                where.orderDate.gte = new Date(filters.fromDate);
            }
            if (filters.toDate) {
                where.orderDate.lte = new Date(filters.toDate);
            }
        }

        const [orders, total] = await Promise.all([
            prisma.purchaseOrder.findMany({
                where,
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
                    _count: {
                        select: {
                            items: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { orderDate: 'desc' },
            }),
            prisma.purchaseOrder.count({ where }),
        ]);

        return {
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
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
