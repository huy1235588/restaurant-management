import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { OrderRepository, FindOrdersOptions } from './order.repository';
import { OrderGateway } from './order.gateway';
import { KitchenService } from '@/modules/kitchen/kitchen.service';
import { KitchenGateway } from '@/modules/kitchen/kitchen.gateway';
import {
    CreateOrderDto,
    AddItemsDto,
    CancelItemDto,
    CancelOrderDto,
    UpdateOrderStatusDto,
} from './dto';
import {
    OrderStatus,
    OrderItemStatus,
    TableStatus,
    KitchenOrderStatus,
} from '@prisma/generated/client';
import {
    OrderNotFoundException,
    OrderItemNotFoundException,
    TableNotFoundException,
    TableOccupiedException,
    CannotModifyCompletedOrderException,
    CannotModifyCancelledOrderException,
    OrderAlreadyCancelledException,
    BillAlreadyCreatedException,
    InvalidOrderStatusException,
} from './exceptions/order.exceptions';
import { OrderHelper } from './helpers/order.helper';
import { OrderValidationHelper } from './helpers/order-validation.helper';

/**
 * Order Service
 * Handles all order business logic and orchestrates database operations
 */
@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly prisma: PrismaService,
        private readonly orderGateway: OrderGateway,
        @Inject(forwardRef(() => KitchenService))
        private readonly kitchenService: KitchenService,
        @Inject(forwardRef(() => KitchenGateway))
        private readonly kitchenGateway: KitchenGateway,
    ) {}

    /**
     * Get all orders with filters and pagination
     */
    async getAllOrders(options?: FindOrdersOptions) {
        this.logger.debug(
            `Fetching orders with filters: ${JSON.stringify(options?.filters)}`,
        );
        return this.orderRepository.findAll(options);
    }

    /**
     * Count orders by filter
     */
    async countOrders(filters?: FindOrdersOptions['filters']) {
        return this.orderRepository.count(filters);
    }

    /**
     * Get order by ID
     */
    async getOrderById(orderId: number) {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            this.logger.warn(`Order not found: ${orderId}`);
            throw new OrderNotFoundException(orderId);
        }

        return order;
    }

    /**
     * Get order by order number
     */
    async getOrderByNumber(orderNumber: string) {
        const order = await this.orderRepository.findByOrderNumber(orderNumber);

        if (!order) {
            this.logger.warn(`Order not found by number: ${orderNumber}`);
            throw new OrderNotFoundException(orderNumber);
        }

        return order;
    }

    /**
     * Get order by reservation ID
     */
    async getOrderByReservation(reservationId: number) {
        return this.orderRepository.findByReservation(reservationId);
    }

    /**
     * Create new order
     */
    async createOrder(data: CreateOrderDto, staffId: number) {
        // Check if table exists and is available
        const table = await this.prisma.restaurantTable.findUnique({
            where: { tableId: data.tableId },
        });

        if (!table) {
            this.logger.warn(`Table not found: ${data.tableId}`);
            throw new TableNotFoundException(data.tableId);
        }

        // Check if table already has an active order
        const existingOrder = await this.orderRepository.findActiveOrderByTable(
            data.tableId,
        );

        if (existingOrder) {
            this.logger.warn(
                `Table ${data.tableId} already has active order ${existingOrder.orderNumber}`,
            );
            throw new TableOccupiedException(
                data.tableId,
                existingOrder.orderNumber,
            );
        }

        // Validate menu items and calculate prices (optimized with single query)
        const orderItems =
            await OrderValidationHelper.validateAndPrepareOrderItems(
                this.prisma,
                data.items,
            );

        // Calculate totals
        const totalAmount =
            OrderValidationHelper.calculateTotalAmount(orderItems);

        // Create order with items in a transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    tableId: data.tableId,
                    staffId,
                    reservationId: data.reservationId,
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    partySize: data.partySize,
                    notes: data.notes,
                    status: OrderStatus.pending,
                    totalAmount,
                    finalAmount: totalAmount,
                    orderItems: {
                        create: orderItems,
                    },
                },
                include: {
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                    table: true,
                    staff: true,
                },
            });

            // Update table status
            await this.prisma.restaurantTable.update({
                where: { tableId: data.tableId },
                data: { status: TableStatus.occupied },
            });

            return newOrder;
        });

        this.logger.log(
            `Order created: ${order.orderNumber} by staff ${staffId} at table ${data.tableId}`,
        );

        // Emit WebSocket event to kitchen
        this.orderGateway.emitOrderCreated(order);

        return order;
    }

    /**
     * Add items to existing order
     */
    async addItemsToOrder(orderId: number, data: AddItemsDto) {
        // Get existing order
        const order = await this.getOrderById(orderId);

        // Check if order can be modified - allow completed orders to be reopened
        if (order.status === OrderStatus.cancelled) {
            this.logger.warn(`Cannot add items to cancelled order: ${orderId}`);
            throw new CannotModifyCancelledOrderException('add items to');
        }

        // Check if bill exists
        const bill = await this.prisma.bill.findUnique({
            where: { orderId },
        });

        if (bill) {
            this.logger.warn(
                `Cannot add items - bill already created for order: ${orderId}`,
            );
            throw new BillAlreadyCreatedException('add items');
        }

        // Validate menu items and calculate prices (optimized with single query)
        const orderItems =
            await OrderValidationHelper.validateAndPrepareOrderItems(
                this.prisma,
                data.items,
            );

        // Add items and update totals in a transaction
        const updatedOrder = await this.prisma.$transaction(async (tx) => {
            // Add new items
            await tx.orderItem.createMany({
                data: orderItems.map((item) => ({
                    ...item,
                    orderId,
                })),
            });

            // Calculate new total (optimized)
            const newTotal = await OrderValidationHelper.calculateOrderTotal(
                tx as any,
                orderId,
            );

            // Prepare update data - if order was completed, reopen it
            const updateData: {
                totalAmount: number;
                finalAmount: number;
                status?: OrderStatus;
                completedAt?: null;
            } = {
                totalAmount: newTotal,
                finalAmount: newTotal,
            };

            // If order was completed, change status to confirmed to send to kitchen
            if (order.status === OrderStatus.completed) {
                updateData.status = OrderStatus.confirmed;
                updateData.completedAt = null;
                this.logger.log(
                    `Reopening completed order ${order.orderNumber} due to new items`,
                );
            }

            // Update order totals and status
            return tx.order.update({
                where: { orderId },
                data: updateData,
                include: {
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                    table: true,
                    staff: true,
                    kitchenOrders: true,
                },
            });
        });

        this.logger.log(
            `${data.items.length} items added to order: ${order.orderNumber}`,
        );

        // Emit WebSocket event to kitchen and all clients
        this.orderGateway.emitOrderItemsAdded(updatedOrder);

        // If order was completed and now confirmed, or already confirmed, create/update kitchen order
        if (updatedOrder.status === OrderStatus.confirmed) {
            // Check if kitchen order exists
            const existingKitchenOrder = updatedOrder.kitchenOrders?.[0];

            if (existingKitchenOrder) {
                // If kitchen order was completed, reopen it to pending
                if (
                    existingKitchenOrder.status === KitchenOrderStatus.completed
                ) {
                    await this.kitchenService.createKitchenOrder(orderId);
                    this.logger.log(
                        `Reopened kitchen order for ${order.orderNumber} due to new items`,
                    );
                } else {
                    // Just notify kitchen about new items
                    this.logger.log(
                        `Notified kitchen of new items for order: ${order.orderNumber}`,
                    );
                }
            } else {
                // Create new kitchen order
                await this.kitchenService.createKitchenOrder(orderId);
                this.logger.log(
                    `Created kitchen order for ${order.orderNumber}`,
                );
            }
        }

        return updatedOrder;
    }

    /**
     * Cancel item in order
     */
    async cancelItem(
        orderId: number,
        orderItemId: number,
        data: CancelItemDto,
    ) {
        // Get order and item
        const order = await this.getOrderById(orderId);

        const orderItem = await this.prisma.orderItem.findFirst({
            where: {
                orderItemId,
                orderId,
            },
        });

        if (!orderItem) {
            this.logger.warn(
                `Order item not found: ${orderItemId} in order ${orderId}`,
            );
            throw new OrderItemNotFoundException(orderItemId, orderId);
        }

        // Check if order can be modified
        if (order.status === OrderStatus.completed) {
            this.logger.warn(
                `Cannot cancel items in completed order: ${orderId}`,
            );
            throw new CannotModifyCompletedOrderException('cancel items in');
        }

        if (order.status === OrderStatus.cancelled) {
            this.logger.warn(`Order already cancelled: ${orderId}`);
            throw new OrderAlreadyCancelledException(orderId);
        }

        // Check if bill exists
        const bill = await this.prisma.bill.findUnique({
            where: { orderId },
        });

        if (bill) {
            this.logger.warn(
                `Cannot cancel items - bill already created for order: ${orderId}`,
            );
            throw new BillAlreadyCreatedException('cancel items');
        }

        // Cancel item and update totals (optimized)
        const updatedOrder = await this.prisma.$transaction(async (tx) => {
            // Update item status
            await tx.orderItem.update({
                where: { orderItemId },
                data: {
                    status: OrderItemStatus.cancelled,
                },
            });

            // Recalculate total (optimized)
            const newTotal = await OrderValidationHelper.calculateOrderTotal(
                tx as any,
                orderId,
            );

            // Update order
            return tx.order.update({
                where: { orderId },
                data: {
                    totalAmount: newTotal,
                    finalAmount: newTotal,
                },
                include: {
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                    table: true,
                    staff: true,
                },
            });
        });

        this.logger.log(
            `Item ${orderItemId} cancelled in order ${order.orderNumber}. Reason: ${data.reason}`,
        );

        // Emit WebSocket event
        this.orderGateway.emitOrderItemCancelled({
            order: updatedOrder,
            itemId: orderItemId,
        });

        return updatedOrder;
    }

    /**
     * Cancel entire order
     */
    async cancelOrder(orderId: number, data: CancelOrderDto) {
        const order = await this.getOrderById(orderId);

        // Check if order can be cancelled
        if (order.status === OrderStatus.completed) {
            this.logger.warn(`Cannot cancel completed order: ${orderId}`);
            throw new CannotModifyCompletedOrderException('cancel');
        }

        if (order.status === OrderStatus.cancelled) {
            this.logger.warn(`Order already cancelled: ${orderId}`);
            throw new OrderAlreadyCancelledException(orderId);
        }

        // Check if bill exists
        const bill = await this.prisma.bill.findUnique({
            where: { orderId },
        });

        if (bill) {
            this.logger.warn(
                `Cannot cancel order - bill already created: ${orderId}`,
            );
            throw new BillAlreadyCreatedException('cancel order');
        }

        // Cancel order in transaction
        const cancelledOrder = await this.prisma.$transaction(async (tx) => {
            // Update all items to cancelled
            await tx.orderItem.updateMany({
                where: { orderId },
                data: { status: OrderItemStatus.cancelled },
            });

            // Delete kitchen orders instead of updating status
            await tx.kitchenOrder.deleteMany({
                where: { orderId },
            });

            // Update order
            const updated = await tx.order.update({
                where: { orderId },
                data: {
                    status: OrderStatus.cancelled,
                    cancelledAt: new Date(),
                    cancellationReason: data.reason,
                },
                include: {
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                    table: true,
                    staff: true,
                },
            });

            // Release table
            await tx.restaurantTable.update({
                where: { tableId: order.tableId },
                data: { status: TableStatus.available },
            });

            return updated;
        });

        this.logger.log(
            `Order cancelled: ${order.orderNumber}. Reason: ${data.reason}`,
        );

        // Emit WebSocket event to orders namespace
        this.orderGateway.emitOrderCancelled(cancelledOrder);

        // Notify kitchen namespace if kitchen order exists
        const kitchenOrder = await this.prisma.kitchenOrder.findUnique({
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
            },
        });
        if (kitchenOrder) {
            this.kitchenGateway.emitOrderUpdate(kitchenOrder);
            this.logger.log(
                `Notified kitchen of cancelled order: ${order.orderNumber}`,
            );
        }

        return cancelledOrder;
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId: number, data: UpdateOrderStatusDto) {
        const order = await this.getOrderById(orderId);

        // Validate status transition
        if (!OrderHelper.isValidStatusTransition(order.status, data.status)) {
            this.logger.warn(
                `Invalid status transition for order ${order.orderNumber}: ${order.status} -> ${data.status}`,
            );
            throw new InvalidOrderStatusException(order.status, data.status);
        }

        const updateData: Record<string, unknown> = {
            status: data.status,
        };

        // Set timestamps based on status
        if (data.status === OrderStatus.confirmed) {
            updateData.confirmedAt = new Date();
        } else if (data.status === OrderStatus.completed) {
            updateData.completedAt = new Date();
        }

        const updatedOrder = await this.orderRepository.update(
            orderId,
            updateData,
        );

        // Trigger kitchen order creation when order is confirmed
        if (data.status === OrderStatus.confirmed) {
            const existingKitchenOrder =
                await this.prisma.kitchenOrder.findUnique({
                    where: { orderId },
                });

            if (!existingKitchenOrder) {
                // Use KitchenService to create kitchen order (emits WebSocket event)
                await this.kitchenService.createKitchenOrder(orderId);
            }
        }

        this.logger.log(
            `Order status updated: ${order.orderNumber} -> ${data.status}`,
        );

        // Emit order status changed event
        this.orderGateway.emitOrderStatusChanged(updatedOrder);

        return updatedOrder;
    }

    /**
     * Mark order item as served
     */
    async markItemAsServed(orderId: number, orderItemId: number) {
        const order = await this.getOrderById(orderId);

        const orderItem = await this.prisma.orderItem.findFirst({
            where: {
                orderItemId,
                orderId,
            },
        });

        if (!orderItem) {
            this.logger.warn(
                `Order item not found: ${orderItemId} in order ${orderId}`,
            );
            throw new OrderItemNotFoundException(orderItemId, orderId);
        }

        // Update item status to ready (served status is removed)
        await this.prisma.orderItem.update({
            where: { orderItemId },
            data: {
                status: OrderItemStatus.ready,
            },
        });

        // Check if all items are ready
        const allItems = await this.prisma.orderItem.findMany({
            where: {
                orderId,
                status: { not: OrderItemStatus.cancelled },
            },
        });

        const allReady = allItems.every(
            (item) => item.status === OrderItemStatus.ready,
        );

        // Note: Order status is managed separately
        // We don't auto-complete order when all items ready
        // Order completes only when payment is done

        this.logger.log(
            `Item ${orderItemId} marked as ready in order ${order.orderNumber}`,
        );

        const updatedOrder = await this.getOrderById(orderId);

        // Emit WebSocket event
        this.orderGateway.emitOrderItemServed({
            order: updatedOrder,
            itemId: orderItemId,
        });

        return updatedOrder;
    }

    // Remove the old validateAndPrepareOrderItems method - now using helper
}
