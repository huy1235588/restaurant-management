import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, OrderItem } from '@prisma/generated/client';

@Injectable()
export class OrderItemRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByOrderId(orderId: number): Promise<OrderItem[]> {
        return this.prisma.orderItem.findMany({
            where: { orderId },
            include: {
                menuItem: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async findById(orderItemId: number): Promise<OrderItem | null> {
        return this.prisma.orderItem.findUnique({
            where: { orderItemId },
            include: {
                menuItem: true,
            },
        });
    }

    async create(data: Prisma.OrderItemCreateInput): Promise<OrderItem> {
        return this.prisma.orderItem.create({
            data,
            include: {
                menuItem: true,
            },
        });
    }

    async update(
        orderItemId: number,
        data: Prisma.OrderItemUpdateInput,
    ): Promise<OrderItem> {
        return this.prisma.orderItem.update({
            where: { orderItemId },
            data,
            include: {
                menuItem: true,
            },
        });
    }

    async delete(orderItemId: number): Promise<OrderItem> {
        return this.prisma.orderItem.delete({
            where: { orderItemId },
        });
    }

    async calculateOrderTotal(orderId: number): Promise<number> {
        const result = await this.prisma.orderItem.aggregate({
            where: { orderId },
            _sum: {
                totalPrice: true,
            },
        });

        return Number(result._sum.totalPrice || 0);
    }
}
