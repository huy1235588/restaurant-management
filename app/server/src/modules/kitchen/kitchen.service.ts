import { Injectable, Logger } from '@nestjs/common';
import { KitchenRepository, KitchenOrderFilters } from './kitchen.repository';
import { PrismaService } from '@/database/prisma.service';
import {
    KitchenOrder,
    KitchenOrderStatus,
    OrderItemStatus,
    OrderStatus,
} from '@/lib/prisma';
import { KitchenGateway } from './kitchen.gateway';
import { SocketEmitterService } from '@/shared/websocket';
import {
    KitchenOrderNotFoundException,
    KitchenOrderAlreadyExistsException,
    MainOrderNotFoundException,
    OrderNotConfirmedException,
    KitchenOrderNotPendingException,
    KitchenOrderAlreadyCompletedException,
    CannotCancelCompletedOrderException,
} from './exceptions/kitchen.exceptions';
import { KitchenHelper } from './helpers/kitchen.helper';

@Injectable()
export class KitchenService {
    private readonly logger = new Logger(KitchenService.name);

    constructor(
        private readonly kitchenRepository: KitchenRepository,
        private readonly prisma: PrismaService,
        private readonly kitchenGateway: KitchenGateway,
        private readonly socketEmitter: SocketEmitterService,
    ) {}

    /**
     * Get all kitchen orders with filters and pagination
     * Includes related order, table, items data to prevent N+1 queries
     */
    async getAllKitchenOrders(
        filters?: KitchenOrderFilters,
        page: number = 1,
        limit: number = 20,
    ) {
        const skip = (page - 1) * limit;

        return this.kitchenRepository.findAll({
            ...filters,
            skip,
            take: limit,
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
                chef: true,
            },
        });
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
     * Create kitchen order (called when order is confirmed)
     */
    async createKitchenOrder(orderId: number) {
        // Check if order exists
        const order = await this.prisma.order.findUnique({
            where: { orderId },
            include: {
                orderItems: true,
            },
        });

        if (!order) {
            this.logger.warn(
                `Order not found for kitchen order creation: ${orderId}`,
            );
            throw new MainOrderNotFoundException(orderId);
        }

        if (order.status !== OrderStatus.confirmed) {
            this.logger.warn(
                `Order ${orderId} not confirmed. Current status: ${order.status}`,
            );
            throw new OrderNotConfirmedException(orderId, order.status);
        }

        // Check if kitchen order already exists
        const existing = await this.kitchenRepository.findByOrderId(orderId);

        if (existing) {
            // If existing kitchen order is completed, delete it and create new one (reopen)
            if (existing.status === KitchenOrderStatus.completed) {
                this.logger.log(
                    `Deleting completed kitchen order ${existing.kitchenOrderId} to reopen for order ${orderId}`,
                );
                await this.kitchenRepository.delete(existing.kitchenOrderId);
                this.logger.log(
                    `Kitchen order reopened for order #${order.orderNumber} (new items added)`,
                );
            } else {
                // Kitchen order exists and not completed - cannot create new one
                this.logger.warn(
                    `Kitchen order already exists for order ${orderId} with status ${existing.status}`,
                );
                throw new KitchenOrderAlreadyExistsException(orderId);
            }
        }

        // Create kitchen order
        const kitchenOrder = await this.kitchenRepository.create({
            order: {
                connect: { orderId },
            },
            status: KitchenOrderStatus.pending,
        });

        this.logger.log(
            `Kitchen order created for order #${order.orderNumber}`,
        );

        // Emit WebSocket event for new order
        const kitchenOrderWithDetails = await this.getKitchenOrderById(
            kitchenOrder.kitchenOrderId,
        );
        this.kitchenGateway.emitNewOrder(kitchenOrderWithDetails);

        return kitchenOrder;
    }

    /**
     * Notify kitchen about order update (e.g., new items added)
     * Public method for Order service to call
     */
    notifyKitchenOrderUpdate(kitchenOrder: KitchenOrder): void {
        this.logger.log(
            `Notifying kitchen of update for kitchen order #${kitchenOrder.kitchenOrderId}`,
        );
        this.kitchenGateway.emitOrderUpdate(kitchenOrder);
    }

    /**
     * Start preparing (chef claims order)
     */
    /**
     * Start preparing kitchen order
     * Implements optimistic locking to prevent concurrent chef claims
     */
    async startPreparing(kitchenOrderId: number, staffId?: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        // Validate status
        if (!KitchenHelper.canModifyOrder(kitchenOrder.status)) {
            this.logger.warn(
                `Cannot start preparing kitchen order ${kitchenOrderId} with status ${kitchenOrder.status}`,
            );
            throw new KitchenOrderNotPendingException(
                kitchenOrderId,
                kitchenOrder.status,
            );
        }

        if (kitchenOrder.status !== KitchenOrderStatus.pending) {
            throw new KitchenOrderNotPendingException(
                kitchenOrderId,
                kitchenOrder.status,
            );
        }

        // Optimistic locking: only update if still pending and unclaimed
        const updateData: {
            status: KitchenOrderStatus;
            startedAt: Date;
            staffId?: number;
        } = {
            status: KitchenOrderStatus.preparing,
            startedAt: new Date(),
        };

        if (staffId) {
            updateData.staffId = staffId;
        }

        const result = await this.prisma.kitchenOrder.updateMany({
            where: {
                kitchenOrderId,
                status: KitchenOrderStatus.pending,
                staffId: null, // Only if no chef assigned yet
            },
            data: updateData,
        });

        if (result.count === 0) {
            this.logger.warn(
                `Kitchen order ${kitchenOrderId} already claimed by another chef`,
            );
            throw new Error('Order already claimed by another chef');
        }

        // Fetch updated order
        const updated = await this.getKitchenOrderById(kitchenOrderId);

        this.logger.log(
            `Kitchen order #${kitchenOrderId} started preparing by chef ${staffId}`,
        );

        // Emit WebSocket event to kitchen namespace
        this.kitchenGateway.emitOrderUpdate(updated);

        // Notify order namespace that kitchen has started preparing
        this.logger.log(
            `Notifying orders namespace: Kitchen started preparing order #${updated.orderId}`,
        );

        return updated;
    }

    /**
     * Complete kitchen order (dish is ready and served)
     * Renamed from markReady to simplify flow
     */
    async completeOrder(kitchenOrderId: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        if (kitchenOrder.status === KitchenOrderStatus.completed) {
            throw new KitchenOrderAlreadyCompletedException(kitchenOrderId);
        }

        const completedAt = new Date();
        const prepTimeActual = kitchenOrder.startedAt
            ? KitchenHelper.calculatePrepTime(
                  kitchenOrder.startedAt,
                  completedAt,
              )
            : null;

        const updated = await this.prisma.$transaction(async (tx) => {
            // Update kitchen order
            const updatedKitchen = await tx.kitchenOrder.update({
                where: { kitchenOrderId },
                data: {
                    status: KitchenOrderStatus.completed,
                    completedAt,
                    prepTimeActual,
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

            // Update all non-cancelled order items to 'ready'
            await tx.orderItem.updateMany({
                where: {
                    orderId: updatedKitchen.orderId,
                    status: { not: OrderItemStatus.cancelled },
                },
                data: {
                    status: OrderItemStatus.ready,
                },
            });

            // Note: Order status remains 'confirmed' until payment
            // We don't auto-update order status when kitchen completes

            return updatedKitchen;
        });

        this.logger.log(
            `Kitchen order #${kitchenOrderId} completed (prep time: ${prepTimeActual} min)`,
        );

        // Emit WebSocket event to kitchen namespace
        this.kitchenGateway.emitOrderCompleted(updated as any);

        // Emit global event to notify all clients (especially Order Module)
        this.socketEmitter.emitKitchenOrderReady({
            kitchenOrderId: updated.kitchenOrderId,
            orderId: updated.orderId,
            orderNumber: updated.order.orderNumber,
            status: updated.status,
        } as any);

        this.logger.log(
            `Notified all clients: Kitchen completed order #${updated.orderId}`,
        );

        return updated;
    }

    /**
     * Cancel kitchen order (now deletes the kitchen order)
     * As per design: when order is cancelled, delete KitchenOrder instead of setting status
     */
    async cancelKitchenOrder(kitchenOrderId: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        // Check if can cancel (not already completed)
        if (kitchenOrder.status === KitchenOrderStatus.completed) {
            throw new CannotCancelCompletedOrderException(kitchenOrderId);
        }

        // Delete kitchen order and update main order status
        await this.prisma.$transaction(async (tx) => {
            // Delete kitchen order (as per simplified design)
            await tx.kitchenOrder.delete({
                where: { kitchenOrderId },
            });

            // Update main order status to cancelled
            await tx.order.update({
                where: { orderId: kitchenOrder.orderId },
                data: {
                    status: OrderStatus.cancelled,
                    cancelledAt: new Date(),
                    cancellationReason: 'Cancelled by kitchen',
                },
            });
        });

        this.logger.log(
            `Kitchen order #${kitchenOrderId} deleted, main order cancelled`,
        );

        // Emit WebSocket event to notify about cancellation (broadcasts to all clients)
        this.socketEmitter.emitOrderCancelled({
            orderId: kitchenOrder.orderId,
            orderNumber: (kitchenOrder as any).order?.orderNumber || 'Unknown',
            reason: 'Cancelled by kitchen',
        } as any);
    }
}
