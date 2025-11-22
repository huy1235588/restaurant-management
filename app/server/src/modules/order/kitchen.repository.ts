import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { KitchenOrderStatus, OrderPriority } from '@prisma/generated/client';

@Injectable()
export class KitchenRepository {
    constructor(private readonly prisma: PrismaService) {}

    private readonly includeRelations = {
        order: {
            include: {
                table: {
                    select: {
                        tableId: true,
                        tableNumber: true,
                        tableName: true,
                    },
                },
                orderItems: {
                    include: {
                        menuItem: {
                            select: {
                                itemId: true,
                                itemName: true,
                                itemCode: true,
                            },
                        },
                    },
                },
                staff: {
                    select: {
                        staffId: true,
                        fullName: true,
                    },
                },
            },
        },
        chef: {
            select: {
                staffId: true,
                fullName: true,
            },
        },
        station: true,
    };

    async findAll(status?: KitchenOrderStatus) {
        const where = status ? { status } : {};

        return this.prisma.kitchenOrder.findMany({
            where,
            include: this.includeRelations,
            orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        });
    }

    async findById(kitchenOrderId: number) {
        return this.prisma.kitchenOrder.findUnique({
            where: { kitchenOrderId },
            include: this.includeRelations,
        });
    }

    async findByOrderId(orderId: number) {
        return this.prisma.kitchenOrder.findUnique({
            where: { orderId },
            include: this.includeRelations,
        });
    }

    async create(data: {
        orderId: number;
        priority?: OrderPriority;
        notes?: string;
    }) {
        return this.prisma.kitchenOrder.create({
            data,
            include: this.includeRelations,
        });
    }

    async update(
        kitchenOrderId: number,
        data: {
            status?: KitchenOrderStatus;
            staffId?: number;
            stationId?: number;
            completedAt?: Date;
            notes?: string;
        },
    ) {
        return this.prisma.kitchenOrder.update({
            where: { kitchenOrderId },
            data,
            include: this.includeRelations,
        });
    }

    async markAsReady(kitchenOrderId: number, staffId?: number) {
        return this.update(kitchenOrderId, {
            status: KitchenOrderStatus.ready,
            completedAt: new Date(),
            staffId,
        });
    }

    async markAsCompleted(kitchenOrderId: number) {
        return this.update(kitchenOrderId, {
            status: KitchenOrderStatus.completed,
        });
    }
}
