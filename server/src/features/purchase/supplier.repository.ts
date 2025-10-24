import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';

export interface SupplierFilters {
    search?: string;
    isActive?: boolean;
}

class SupplierRepository {
    /**
     * Find all suppliers with filters and pagination
     */
    async findAll(
        filters: SupplierFilters = {},
        page: number = 1,
        limit: number = 20
    ) {
        const where: Prisma.SupplierWhereInput = {};

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.search) {
            where.OR = [
                { supplierCode: { contains: filters.search, mode: 'insensitive' } },
                { supplierName: { contains: filters.search, mode: 'insensitive' } },
                { contactPerson: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [suppliers, total] = await Promise.all([
            prisma.supplier.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            purchaseOrders: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { supplierName: 'asc' },
            }),
            prisma.supplier.count({ where }),
        ]);

        return {
            data: suppliers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Find supplier by ID
     */
    async findById(supplierId: number) {
        return prisma.supplier.findUnique({
            where: { supplierId },
            include: {
                purchaseOrders: {
                    orderBy: { orderDate: 'desc' },
                    take: 5,
                    include: {
                        items: {
                            include: {
                                ingredient: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        purchaseOrders: true,
                    },
                },
            },
        });
    }

    /**
     * Find supplier by code
     */
    async findByCode(supplierCode: string) {
        return prisma.supplier.findUnique({
            where: { supplierCode },
        });
    }

    /**
     * Create new supplier
     */
    async create(data: Prisma.SupplierCreateInput) {
        return prisma.supplier.create({
            data,
        });
    }

    /**
     * Update supplier
     */
    async update(supplierId: number, data: Prisma.SupplierUpdateInput) {
        return prisma.supplier.update({
            where: { supplierId },
            data,
        });
    }

    /**
     * Delete supplier
     */
    async delete(supplierId: number) {
        return prisma.supplier.delete({
            where: { supplierId },
        });
    }

    /**
     * Get active suppliers
     */
    async findActive() {
        return prisma.supplier.findMany({
            where: { isActive: true },
            orderBy: { supplierName: 'asc' },
        });
    }
}

export default new SupplierRepository();
