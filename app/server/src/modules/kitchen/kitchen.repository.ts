import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
    Prisma,
    KitchenOrder,
    KitchenOrderStatus,
} from '@prisma/generated/client';

export interface KitchenOrderFilters {
    status?: KitchenOrderStatus;
    skip?: number;
    take?: number;
    include?: Prisma.KitchenOrderInclude;
}

@Injectable()
export class KitchenRepository {
    constructor(private readonly prisma: PrismaService) {}

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
        return this.prisma.kitchenOrder.findMany({
            where: this.buildWhereClause(filters),
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
                chef: {
                    select: {
                        staffId: true,
                        fullName: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc', // FIFO (first-come-first-served)
            },
        });
    }

    async findById(kitchenOrderId: number): Promise<KitchenOrder | null> {
        return this.prisma.kitchenOrder.findUnique({
            where: { kitchenOrderId },
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
                chef: {
                    select: {
                        staffId: true,
                        fullName: true,
                        role: true,
                    },
                },
            },
        });
    }

    async findByOrderId(orderId: number): Promise<KitchenOrder | null> {
        return this.prisma.kitchenOrder.findUnique({
            where: { orderId },
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
                chef: {
                    select: {
                        staffId: true,
                        fullName: true,
                        role: true,
                    },
                },
            },
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
                chef: {
                    select: {
                        staffId: true,
                        fullName: true,
                        role: true,
                    },
                },
            },
        });
    }
}
