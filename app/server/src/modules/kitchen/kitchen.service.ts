import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { KitchenRepository, KitchenOrderFilters } from './kitchen.repository';
import { PrismaService } from '@/database/prisma.service';
import { KitchenOrderStatus, OrderStatus } from '@prisma/generated/client';
import { KitchenGateway } from './kitchen.gateway';

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
            throw new NotFoundException('Kitchen order not found');
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
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.confirmed) {
            throw new BadRequestException('Order must be confirmed first');
        }

        // Check if kitchen order already exists
        const existing = await this.kitchenRepository.findByOrderId(orderId);

        if (existing) {
            throw new BadRequestException(
                'Kitchen order already exists for this order',
            );
        }

        // Create kitchen order
        const kitchenOrder = await this.kitchenRepository.create({
            order: {
                connect: { orderId },
            },
            status: KitchenOrderStatus.pending,
            priority: 'normal', // Default priority
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

        if (kitchenOrder.status !== KitchenOrderStatus.pending) {
            throw new BadRequestException(
                'Can only start preparing pending orders',
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
            throw new BadRequestException('Kitchen order is already completed');
        }

        if (kitchenOrder.status === KitchenOrderStatus.cancelled) {
            throw new BadRequestException(
                'Cannot mark cancelled order as ready',
            );
        }

        const completedAt = new Date();
        const prepTimeActual = kitchenOrder.startedAt
            ? Math.floor(
                  (completedAt.getTime() - kitchenOrder.startedAt.getTime()) /
                      60000,
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
            throw new BadRequestException('Can only complete ready orders');
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

        if (kitchenOrder.status === KitchenOrderStatus.completed) {
            throw new BadRequestException(
                'Cannot cancel completed kitchen order',
            );
        }

        if (kitchenOrder.status === KitchenOrderStatus.cancelled) {
            throw new BadRequestException('Kitchen order is already cancelled');
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
