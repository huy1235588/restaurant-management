import { Injectable, Logger } from '@nestjs/common';
import { KitchenRepository, KitchenOrderFilters } from './kitchen.repository';
import { PrismaService } from '@/database/prisma.service';
import { KitchenOrderStatus, OrderStatus } from '@prisma/generated/client';
import { KitchenGateway } from './kitchen.gateway';
import { SocketEmitterService } from '@/shared/websocket';
import {
    KitchenOrderNotFoundException,
    KitchenOrderAlreadyExistsException,
    MainOrderNotFoundException,
    OrderNotConfirmedException,
    KitchenOrderNotPendingException,
    KitchenOrderAlreadyCompletedException,
    KitchenOrderAlreadyCancelledException,
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
            this.logger.warn(
                `Kitchen order already exists for order ${orderId}`,
            );
            throw new KitchenOrderAlreadyExistsException(orderId);
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

        if (kitchenOrder.status === KitchenOrderStatus.cancelled) {
            throw new KitchenOrderAlreadyCancelledException(kitchenOrderId);
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

            // Update order status
            await tx.order.update({
                where: { orderId: kitchenOrder.orderId },
                data: { status: OrderStatus.ready },
            });

            return updatedKitchen;
        });

        this.logger.log(
            `Kitchen order #${kitchenOrderId} completed (prep time: ${prepTimeActual} min)`,
        );

        // Emit WebSocket event to kitchen namespace
        this.kitchenGateway.emitOrderCompleted(updated as any);

        // Notify order namespace that kitchen has completed the order
        this.logger.log(
            `Notifying orders namespace: Kitchen completed order #${updated.orderId}`,
        );

        return updated;
    }

    /**
     * Cancel kitchen order
     */
    async cancelKitchenOrder(kitchenOrderId: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        // Check if can cancel using helper
        if (!KitchenHelper.canCancelOrder(kitchenOrder.status)) {
            if (kitchenOrder.status === KitchenOrderStatus.completed) {
                throw new CannotCancelCompletedOrderException(kitchenOrderId);
            }
            if (kitchenOrder.status === KitchenOrderStatus.cancelled) {
                throw new KitchenOrderAlreadyCancelledException(kitchenOrderId);
            }
        }

        // Cancel kitchen order and update main order status
        const updated = await this.prisma.$transaction(async (tx) => {
            // Update kitchen order status
            const updatedKitchen = await tx.kitchenOrder.update({
                where: { kitchenOrderId },
                data: { status: KitchenOrderStatus.cancelled },
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

            // Update main order status to cancelled
            await tx.order.update({
                where: { orderId: kitchenOrder.orderId },
                data: {
                    status: OrderStatus.cancelled,
                    cancelledAt: new Date(),
                    cancellationReason: 'Cancelled by kitchen',
                },
            });

            return updatedKitchen;
        });

        this.logger.log(
            `Kitchen order #${kitchenOrderId} cancelled, main order also cancelled`,
        );

        // Emit WebSocket event to kitchen namespace
        this.kitchenGateway.emitOrderUpdate(updated);

        // Notify order namespace that kitchen cancelled the order
        this.socketEmitter.emitOrderCancelled(updated.order as any);
        this.logger.log(
            `Notified orders namespace: Kitchen cancelled order #${updated.orderId}`,
        );

        return updated;
    }
}
