import { Injectable, Logger } from '@nestjs/common';
import { KitchenRepository, KitchenOrderFilters } from './kitchen.repository';
import { PrismaService } from '@/database/prisma.service';
import { KitchenOrderStatus, OrderStatus } from '@prisma/generated/client';
import { KitchenGateway } from './kitchen.gateway';
import { KITCHEN_CONSTANTS } from './constants/kitchen.constants';
import {
    KitchenOrderNotFoundException,
    KitchenOrderAlreadyExistsException,
    MainOrderNotFoundException,
    OrderNotConfirmedException,
    KitchenOrderNotPendingException,
    CanOnlyCompleteReadyOrdersException,
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
    ) {}

    /**
     * Get all kitchen orders with filters
     */
    async getAllKitchenOrders(filters?: KitchenOrderFilters) {
        return this.kitchenRepository.findAll(filters);
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

        // Create kitchen order with default priority
        const kitchenOrder = await this.kitchenRepository.create({
            order: {
                connect: { orderId },
            },
            status: KitchenOrderStatus.pending,
            priority: KITCHEN_CONSTANTS.DEFAULT_PRIORITY,
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
    async startPreparing(kitchenOrderId: number, staffId?: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        // Validate status using helper
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

        const updated = await this.kitchenRepository.update(kitchenOrderId, {
            status: KitchenOrderStatus.ready, // Simplified: we skip "preparing" and go straight to "ready" after chef starts
            startedAt: new Date(),
            ...(staffId && {
                chef: {
                    connect: { staffId },
                },
            }),
        });

        this.logger.log(
            `Kitchen order #${kitchenOrderId} started by chef ${staffId}`,
        );

        // Emit WebSocket event
        this.kitchenGateway.emitOrderUpdate(updated);

        return updated;
    }

    /**
     * Mark as ready for pickup
     */
    async markReady(kitchenOrderId: number) {
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
                    status: KitchenOrderStatus.ready,
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
            `Kitchen order #${kitchenOrderId} marked as ready (prep time: ${prepTimeActual} min)`,
        );

        // Log if preparation was slow
        if (prepTimeActual && KitchenHelper.isSlowPreparation(prepTimeActual)) {
            this.logger.warn(
                `Slow preparation detected for kitchen order #${kitchenOrderId}: ${prepTimeActual} min`,
            );
        }

        // Emit WebSocket event
        this.kitchenGateway.emitOrderUpdate(updated);

        return updated;
    }

    /**
     * Mark as completed (waiter picked up)
     */
    async markCompleted(kitchenOrderId: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        if (kitchenOrder.status !== KitchenOrderStatus.ready) {
            this.logger.warn(
                `Cannot complete kitchen order ${kitchenOrderId} with status ${kitchenOrder.status}`,
            );
            throw new CanOnlyCompleteReadyOrdersException(
                kitchenOrderId,
                kitchenOrder.status,
            );
        }

        const updated = await this.prisma.$transaction(async (tx) => {
            // Update kitchen order
            const updatedKitchen = await tx.kitchenOrder.update({
                where: { kitchenOrderId },
                data: { status: KitchenOrderStatus.completed },
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

            // Update order status to serving
            await tx.order.update({
                where: { orderId: kitchenOrder.orderId },
                data: { status: OrderStatus.serving },
            });

            return updatedKitchen;
        });

        this.logger.log(
            `Kitchen order #${kitchenOrderId} completed (picked up by waiter)`,
        );

        // Emit WebSocket event
        this.kitchenGateway.emitOrderCompleted(updated);

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

        const updated = await this.kitchenRepository.update(kitchenOrderId, {
            status: KitchenOrderStatus.cancelled,
        });

        this.logger.log(`Kitchen order #${kitchenOrderId} cancelled`);

        // Emit WebSocket event
        this.kitchenGateway.emitOrderUpdate(updated);

        return updated;
    }
}
