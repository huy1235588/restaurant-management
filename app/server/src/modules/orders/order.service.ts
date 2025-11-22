import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
    ConflictException,
} from '@nestjs/common';
import { OrderRepository, FindOptions } from './order.repository';
import { OrderItemRepository } from './order-item.repository';
import { PrismaService } from '@/database/prisma.service';
import { KitchenService } from '@/modules/kitchen/kitchen.service';
import {
    CreateOrderDto,
    AddOrderItemDto,
    UpdateOrderItemDto,
    CancelOrderDto,
} from './dto';
import { OrderStatus, TableStatus, Prisma } from '@prisma/generated/client';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - uuid types are available but TypeScript may not resolve them correctly
const generateUuid = uuidv4 as () => string;

// Type for Order with all necessary includes
type OrderWithRelations = Prisma.OrderGetPayload<{
    include: {
        table: true;
        staff: {
            select: {
                staffId: true;
                fullName: true;
                role: true;
            };
        };
        orderItems: {
            include: {
                menuItem: true;
            };
        };
        reservation: true;
        kitchenOrders: true;
        bill: true;
    };
}>;

@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);
    private readonly TAX_RATE = 0.1; // 10% tax

    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly orderItemRepository: OrderItemRepository,
        private readonly prisma: PrismaService,
        private readonly kitchenService: KitchenService,
    ) {}

    /**
     * Get all orders with pagination and filters
     */
    async getAllOrders(options?: FindOptions) {
        return this.orderRepository.findAllPaginated(options);
    }

    /**
     * Get order by ID
     */
    async getOrderById(orderId: number) {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    /**
     * Get order by order number
     */
    async getOrderByNumber(orderNumber: string) {
        const order = await this.orderRepository.findByOrderNumber(orderNumber);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    /**
     * Create new order
     */
    async createOrder(data: CreateOrderDto, staffId?: number) {
        // Check if table exists and is available
        const table = await this.prisma.restaurantTable.findUnique({
            where: { tableId: data.tableId },
        });

        if (!table) {
            throw new NotFoundException('Table not found');
        }

        if (table.status === TableStatus.occupied) {
            throw new BadRequestException('Table is already occupied');
        }

        if (table.status === TableStatus.maintenance) {
            throw new BadRequestException('Table is under maintenance');
        }

        // Check if there's already an active order for this table
        const existingOrder = await this.orderRepository.findActiveByTable(
            data.tableId,
        );

        if (existingOrder) {
            throw new ConflictException(
                'There is already an active order for this table',
            );
        }

        // Validate reservation if provided
        if (data.reservationId) {
            const reservation = await this.prisma.reservation.findUnique({
                where: { reservationId: data.reservationId },
            });

            if (!reservation) {
                throw new NotFoundException('Reservation not found');
            }

            if (reservation.tableId !== data.tableId) {
                throw new BadRequestException(
                    'Reservation is not for this table',
                );
            }
        }

        // Create order in a transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // Create the order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: generateUuid(),
                    tableId: data.tableId,
                    staffId,
                    reservationId: data.reservationId,
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    partySize: data.partySize || 1,
                    notes: data.notes,
                    status: OrderStatus.pending,
                    totalAmount: 0,
                    discountAmount: 0,
                    taxAmount: 0,
                    finalAmount: 0,
                },
                include: {
                    table: true,
                    staff: {
                        select: {
                            staffId: true,
                            fullName: true,
                            role: true,
                        },
                    },
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                },
            });

            // Update table status to occupied
            await tx.restaurantTable.update({
                where: { tableId: data.tableId },
                data: { status: TableStatus.occupied },
            });

            return newOrder;
        });

        this.logger.log(
            `Order created: ${order.orderNumber} for table ${table.tableNumber}`,
        );

        return order;
    }

    /**
     * Add item to order
     */
    async addItemToOrder(orderId: number, data: AddOrderItemDto) {
        // Get order and validate status
        const order = await this.getOrderById(orderId);

        if (order.status !== OrderStatus.pending) {
            throw new BadRequestException(
                'Can only add items to pending orders',
            );
        }

        // Get menu item and validate
        const menuItem = await this.prisma.menuItem.findUnique({
            where: { itemId: data.itemId },
        });

        if (!menuItem) {
            throw new NotFoundException('Menu item not found');
        }

        if (!menuItem.isAvailable) {
            throw new BadRequestException('Menu item is not available');
        }

        // Create order item and update order totals in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Calculate prices
            const unitPrice = Number(menuItem.price);
            const totalPrice = unitPrice * data.quantity;

            // Create order item
            const orderItem = await tx.orderItem.create({
                data: {
                    orderId,
                    itemId: data.itemId,
                    quantity: data.quantity,
                    unitPrice,
                    totalPrice,
                    specialRequest: data.specialRequest,
                    status: 'pending',
                },
                include: {
                    menuItem: true,
                },
            });

            // Recalculate order totals
            await this.recalculateOrderTotals(orderId, tx);

            // Get updated order
            const updatedOrder = await tx.order.findUnique({
                where: { orderId },
                include: {
                    table: true,
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                },
            });

            return { orderItem, order: updatedOrder };
        });

        this.logger.log(
            `Item added to order ${order.orderNumber}: ${menuItem.itemName} x${data.quantity}`,
        );

        return result;
    }

    /**
     * Update order item
     */
    async updateOrderItem(
        orderId: number,
        orderItemId: number,
        data: UpdateOrderItemDto,
    ) {
        // Get order and validate
        const order = await this.getOrderById(orderId);

        if (order.status !== OrderStatus.pending) {
            throw new BadRequestException(
                'Can only modify items in pending orders',
            );
        }

        // Get order item
        const orderItem = await this.orderItemRepository.findById(orderItemId);

        if (!orderItem) {
            throw new NotFoundException('Order item not found');
        }

        if (orderItem.orderId !== orderId) {
            throw new BadRequestException(
                'Order item does not belong to this order',
            );
        }

        // Update in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const updateData: Prisma.OrderItemUpdateInput = {};

            if (data.quantity !== undefined) {
                updateData.quantity = data.quantity;
                updateData.totalPrice =
                    Number(orderItem.unitPrice) * data.quantity;
            }

            if (data.specialRequest !== undefined) {
                updateData.specialRequest = data.specialRequest;
            }

            // Update order item
            const updated = await tx.orderItem.update({
                where: { orderItemId },
                data: updateData,
                include: {
                    menuItem: true,
                },
            });

            // Recalculate order totals
            await this.recalculateOrderTotals(orderId, tx);

            // Get updated order
            const updatedOrder = await tx.order.findUnique({
                where: { orderId },
                include: {
                    table: true,
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                },
            });

            return { orderItem: updated, order: updatedOrder };
        });

        this.logger.log(`Order item updated in order ${order.orderNumber}`);

        return result;
    }

    /**
     * Remove item from order
     */
    async removeOrderItem(orderId: number, orderItemId: number) {
        // Get order and validate
        const order = await this.getOrderById(orderId);

        if (order.status !== OrderStatus.pending) {
            throw new BadRequestException(
                'Can only remove items from pending orders',
            );
        }

        // Get order item
        const orderItem = await this.orderItemRepository.findById(orderItemId);

        if (!orderItem) {
            throw new NotFoundException('Order item not found');
        }

        if (orderItem.orderId !== orderId) {
            throw new BadRequestException(
                'Order item does not belong to this order',
            );
        }

        // Delete in transaction
        const updatedOrder = await this.prisma.$transaction(async (tx) => {
            // Delete order item
            await tx.orderItem.delete({
                where: { orderItemId },
            });

            // Recalculate order totals
            await this.recalculateOrderTotals(orderId, tx);

            // Get updated order
            return tx.order.findUnique({
                where: { orderId },
                include: {
                    table: true,
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                },
            });
        });

        this.logger.log(`Order item removed from order ${order.orderNumber}`);

        return updatedOrder;
    }

    /**
     * Confirm order and send to kitchen
     */
    async confirmOrder(orderId: number) {
        const order = (await this.getOrderById(orderId)) as OrderWithRelations;

        if (order.status !== OrderStatus.pending) {
            throw new BadRequestException('Can only confirm pending orders');
        }

        if (!order.orderItems || order.orderItems.length === 0) {
            throw new BadRequestException('Cannot confirm order without items');
        }

        // Update order status and create kitchen order
        const confirmedOrder = await this.orderRepository.update(orderId, {
            status: OrderStatus.confirmed,
            confirmedAt: new Date(),
        });

        // Create kitchen order
        try {
            await this.kitchenService.createKitchenOrder(orderId);
        } catch (error) {
            this.logger.error(
                `Failed to create kitchen order: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            // Continue anyway - order is still confirmed
        }

        this.logger.log(`Order confirmed: ${order.orderNumber}`);

        return confirmedOrder;
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId: number, cancelData: CancelOrderDto) {
        const order = (await this.getOrderById(orderId)) as OrderWithRelations;

        // Check if order can be cancelled
        if (order.status === OrderStatus.completed) {
            throw new BadRequestException('Cannot cancel completed order');
        }

        if (order.status === OrderStatus.cancelled) {
            throw new BadRequestException('Order is already cancelled');
        }

        // Check if kitchen has started preparing
        if (order.kitchenOrders && order.kitchenOrders.length > 0) {
            const kitchenOrder = order.kitchenOrders[0];
            if (kitchenOrder && kitchenOrder.status !== 'pending') {
                throw new BadRequestException(
                    'Cannot cancel order - kitchen has already started preparing',
                );
            }
        }

        // Cancel in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Update order
            const cancelledOrder = await tx.order.update({
                where: { orderId },
                data: {
                    status: OrderStatus.cancelled,
                    cancelledAt: new Date(),
                    cancellationReason: cancelData.cancellationReason,
                },
                include: {
                    table: true,
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                },
            });

            // Free up the table
            await tx.restaurantTable.update({
                where: { tableId: order.tableId },
                data: { status: TableStatus.available },
            });

            // Cancel kitchen order if exists
            if (order.kitchenOrders && order.kitchenOrders.length > 0) {
                const firstKitchenOrder = order.kitchenOrders[0];
                if (firstKitchenOrder) {
                    await tx.kitchenOrder.update({
                        where: {
                            kitchenOrderId: firstKitchenOrder.kitchenOrderId,
                        },
                        data: { status: 'cancelled' },
                    });
                }
            }

            return cancelledOrder;
        });

        this.logger.log(
            `Order cancelled: ${order.orderNumber} - ${cancelData.cancellationReason}`,
        );

        return result;
    }

    /**
     * Mark order as completed (called after payment)
     */
    async completeOrder(orderId: number) {
        const order = await this.getOrderById(orderId);

        if (order.status === OrderStatus.completed) {
            throw new BadRequestException('Order is already completed');
        }

        // Complete in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Update order
            const completedOrder = await tx.order.update({
                where: { orderId },
                data: {
                    status: OrderStatus.completed,
                    completedAt: new Date(),
                },
                include: {
                    table: true,
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                },
            });

            // Free up the table
            await tx.restaurantTable.update({
                where: { tableId: order.tableId },
                data: { status: TableStatus.available },
            });

            return completedOrder;
        });

        this.logger.log(`Order completed: ${order.orderNumber}`);

        return result;
    }

    /**
     * Recalculate order totals
     */
    private async recalculateOrderTotals(
        orderId: number,
        tx?: Prisma.TransactionClient,
    ) {
        const client = tx || this.prisma;

        // Calculate total from order items
        const result = await client.orderItem.aggregate({
            where: { orderId },
            _sum: {
                totalPrice: true,
            },
        });

        const totalAmount = Number(result._sum.totalPrice || 0);
        const taxAmount = totalAmount * this.TAX_RATE;
        const finalAmount = totalAmount + taxAmount;

        // Update order
        await client.order.update({
            where: { orderId },
            data: {
                totalAmount,
                taxAmount,
                finalAmount,
            },
        });
    }
}
