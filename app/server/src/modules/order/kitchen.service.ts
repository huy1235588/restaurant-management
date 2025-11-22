import { Injectable, Logger } from '@nestjs/common';
import { KitchenRepository } from './kitchen.repository';
import { OrderRepository } from './order.repository';
import { OrderGateway } from './order.gateway';
import { PrismaService } from '@/database/prisma.service';
import {
    KitchenOrderStatus,
    OrderStatus,
    OrderItemStatus,
} from '@prisma/generated/client';
import {
    KitchenOrderNotFoundException,
    CannotCompleteKitchenOrderException,
} from './exceptions/order.exceptions';

/**
 * Kitchen Service
 * Handles kitchen-specific business logic
 */
@Injectable()
export class KitchenService {
    private readonly logger = new Logger(KitchenService.name);

    constructor(
        private readonly kitchenRepository: KitchenRepository,
        private readonly orderRepository: OrderRepository,
        private readonly prisma: PrismaService,
        private readonly orderGateway: OrderGateway,
    ) {}

    /**
     * Get kitchen queue (pending orders)
     */
    async getKitchenQueue() {
        this.logger.debug('Fetching kitchen queue (pending orders)');
        return this.kitchenRepository.findAll(KitchenOrderStatus.pending);
    }

    /**
     * Get all kitchen orders
     */
    async getAllKitchenOrders(status?: KitchenOrderStatus) {
        this.logger.debug(
            `Fetching all kitchen orders with status: ${status || 'all'}`,
        );
        return this.kitchenRepository.findAll(status);
    }

    /**
     * Get kitchen order by ID
     */
    async getKitchenOrderById(kitchenOrderId: number) {
        const kitchenOrder =
            await this.kitchenRepository.findById(kitchenOrderId);

        if (!kitchenOrder) {
            this.logger.warn(`Kitchen order not found: ${kitchenOrderId}`);
            throw new KitchenOrderNotFoundException(kitchenOrderId);
        }

        return kitchenOrder;
    }

    /**
     * Mark kitchen order as ready (done)
     */
    async markOrderAsReady(kitchenOrderId: number, staffId?: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        if (kitchenOrder.status === KitchenOrderStatus.cancelled) {
            this.logger.warn(
                `Cannot complete cancelled kitchen order: ${kitchenOrderId}`,
            );
            throw new CannotCompleteKitchenOrderException(
                'order is cancelled',
            );
        }

        if (kitchenOrder.status === KitchenOrderStatus.completed) {
            this.logger.warn(
                `Kitchen order already completed: ${kitchenOrderId}`,
            );
            throw new CannotCompleteKitchenOrderException(
                'order already completed',
            );
        }

        // Update kitchen order and order items in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Mark kitchen order as ready
            const updated = await tx.kitchenOrder.update({
                where: { kitchenOrderId },
                data: {
                    status: KitchenOrderStatus.ready,
                    completedAt: new Date(),
                    staffId,
                },
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

            // Update all order items to ready
            await tx.orderItem.updateMany({
                where: {
                    orderId: updated.orderId,
                    status: OrderItemStatus.pending,
                },
                data: {
                    status: OrderItemStatus.ready,
                },
            });

            // Update order status to ready
            await tx.order.update({
                where: { orderId: updated.orderId },
                data: {
                    status: OrderStatus.ready,
                },
            });

            return updated;
        });

        this.logger.log(
            `Kitchen order ${kitchenOrderId} marked as ready by staff ${staffId || 'unknown'}`,
        );

        // Emit WebSocket event to waiters: construct KitchenEventData payload (must include orderNumber)
        const eventData = {
            kitchenOrderId: result.kitchenOrderId,
            orderId: result.orderId,
            orderNumber: result.order?.orderNumber ?? String(result.orderId),
            status: result.status,
            order: result.order,
        };
        this.orderGateway.emitKitchenOrderDone(eventData);

        return result;
    }

    /**
     * Mark kitchen order as completed (picked up by waiter)
     */
    async markOrderAsCompleted(kitchenOrderId: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        if (kitchenOrder.status !== KitchenOrderStatus.ready) {
            this.logger.warn(
                `Kitchen order not ready for completion: ${kitchenOrderId}`,
            );
            throw new CannotCompleteKitchenOrderException(
                'only ready orders can be marked as completed',
            );
        }

        const updated =
            await this.kitchenRepository.markAsCompleted(kitchenOrderId);

        this.logger.log(`Kitchen order ${kitchenOrderId} marked as completed`);

        return updated;
    }
}
