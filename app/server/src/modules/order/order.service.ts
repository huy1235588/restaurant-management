import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { OrderRepository, FindOrdersOptions } from './order.repository';
import { OrderGateway } from './order.gateway';
import { KitchenService } from '@/modules/kitchen/kitchen.service';
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
    MenuItemNotFoundException,
    MenuItemNotAvailableException,
    MenuItemNotActiveException,
    CannotModifyCompletedOrderException,
    CannotModifyCancelledOrderException,
    OrderAlreadyCancelledException,
    BillAlreadyCreatedException,
    InvalidOrderStatusException,
    CannotAddItemsToServingOrderException,
} from './exceptions/order.exceptions';
import { OrderHelper } from './helpers/order.helper';

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

        // Validate menu items and calculate prices
        const orderItems = await this.validateAndPrepareOrderItems(data.items);

        // Calculate totals
        const totalAmount = orderItems.reduce(
            (sum, item) => sum + Number(item.totalPrice),
            0,
        );

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

        // Prevent adding items if order is being served
        if (order.status === OrderStatus.serving) {
            this.logger.warn(
                `Attempted to add items to serving order: ${order.orderNumber}`,
            );
            throw new CannotAddItemsToServingOrderException(orderId);
        }

        // Check if order can be modified
        if (order.status === OrderStatus.completed) {
            this.logger.warn(`Cannot add items to completed order: ${orderId}`);
            throw new CannotModifyCompletedOrderException('add items to');
        }

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

        // Validate menu items and calculate prices
        const orderItems = await this.validateAndPrepareOrderItems(data.items);

        // Add items and update totals in a transaction
        const updatedOrder = await this.prisma.$transaction(async (tx) => {
            // Add new items
            await tx.orderItem.createMany({
                data: orderItems.map((item) => ({
                    ...item,
                    orderId,
                })),
            });

            // Calculate new total
            const allItems = await tx.orderItem.findMany({
                where: {
                    orderId,
                    status: { not: OrderItemStatus.cancelled },
                },
            });

            const newTotal = allItems.reduce(
                (sum, item) => sum + Number(item.totalPrice),
                0,
            );

            // Update order totals
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
            `${data.items.length} items added to order: ${order.orderNumber}`,
        );

        // Emit WebSocket event to kitchen and all clients
        this.orderGateway.emitOrderItemsAdded(updatedOrder);

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

        // Cancel item and update totals
        const updatedOrder = await this.prisma.$transaction(async (tx) => {
            // Update item status
            await tx.orderItem.update({
                where: { orderItemId },
                data: {
                    status: OrderItemStatus.cancelled,
                },
            });

            // Recalculate total
            const activeItems = await tx.orderItem.findMany({
                where: {
                    orderId,
                    status: { not: OrderItemStatus.cancelled },
                },
            });

            const newTotal = activeItems.reduce(
                (sum, item) => sum + Number(item.totalPrice),
                0,
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

            // Update kitchen order
            await tx.kitchenOrder.updateMany({
                where: { orderId },
                data: { status: KitchenOrderStatus.cancelled },
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

        // Emit WebSocket event
        this.orderGateway.emitOrderCancelled(cancelledOrder);

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

        // Update item status
        await this.prisma.orderItem.update({
            where: { orderItemId },
            data: {
                status: OrderItemStatus.served,
            },
        });

        // Check if all items are served
        const allItems = await this.prisma.orderItem.findMany({
            where: {
                orderId,
                status: { not: OrderItemStatus.cancelled },
            },
        });

        const allServed = allItems.every(
            (item) => item.status === OrderItemStatus.served,
        );

        // Update order status if all items served
        if (allServed && order.status !== OrderStatus.completed) {
            await this.orderRepository.update(orderId, {
                status: OrderStatus.completed,
                completedAt: new Date(),
            });
            this.logger.log(`Order completed: ${order.orderNumber}`);
        }

        this.logger.log(
            `Item ${orderItemId} marked as served in order ${order.orderNumber}`,
        );

        const updatedOrder = await this.getOrderById(orderId);

        // Emit WebSocket event
        this.orderGateway.emitOrderItemServed({
            order: updatedOrder,
            itemId: orderItemId,
        });

        return updatedOrder;
    }

    /**
     * Validate menu items and prepare order item data
     */
    private async validateAndPrepareOrderItems(
        items: Array<{
            itemId: number;
            quantity: number;
            specialRequest?: string;
        }>,
    ) {
        const orderItems: Array<{
            itemId: number;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            specialRequest: string | null;
            status: OrderItemStatus;
        }> = [];

        for (const item of items) {
            // Get menu item
            const menuItem = await this.prisma.menuItem.findUnique({
                where: { itemId: item.itemId },
            });

            if (!menuItem) {
                this.logger.warn(`Menu item not found: ${item.itemId}`);
                throw new MenuItemNotFoundException(item.itemId);
            }

            if (!menuItem.isAvailable) {
                this.logger.warn(
                    `Menu item not available: ${menuItem.itemName}`,
                );
                throw new MenuItemNotAvailableException(menuItem.itemName);
            }

            if (!menuItem.isActive) {
                this.logger.warn(`Menu item not active: ${menuItem.itemName}`);
                throw new MenuItemNotActiveException(menuItem.itemName);
            }

            const unitPrice = Number(menuItem.price);
            const totalPrice = unitPrice * item.quantity;

            orderItems.push({
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice,
                totalPrice,
                specialRequest: item.specialRequest ?? null,
                status: OrderItemStatus.pending,
            });
        }

        return orderItems;
    }
}
