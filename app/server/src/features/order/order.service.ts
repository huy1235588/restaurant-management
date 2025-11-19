import orderRepository from '@/features/order/order.repository';
import menuItemRepository from '@/features/menu/menuItem.repository';
import tableRepository from '@/features/table/table.repository';
import kitchenRepository from '@/features/kitchen/kitchen.repository';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';
import { CreateOrderDTO, UpdateOrderDTO } from '@/features/order/dtos';
import { Prisma } from '@prisma/client';
import { OrderStatus } from '@/shared/types';
import socketService from '@/shared/utils/socket';

export class OrderService {
    /**
     * Create new order
     */
    async createOrder(data: CreateOrderDTO, staffId?: number) {
        // Verify table exists and is available
        const table = await tableRepository.findById(data.tableId);
        if (!table) {
            throw new NotFoundError('Table not found');
        }

        if (table.status === 'maintenance') {
            throw new BadRequestError('Table is under maintenance');
        }

        // Calculate order items totals
        const orderItems: Omit<Prisma.OrderItemCreateManyInput, 'orderId'>[] = [];
        let orderTotal = 0;

        for (const item of data.items) {
            const menuItem = await menuItemRepository.findById(item.itemId);
            if (!menuItem) {
                throw new NotFoundError(`Menu item with ID ${item.itemId} not found`);
            }

            if (!menuItem.isAvailable) {
                throw new BadRequestError(`${menuItem.itemName} is currently unavailable`);
            }

            const itemTotal = Number(menuItem.price) * item.quantity;
            orderTotal += itemTotal;

            orderItems.push({
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice: Number(menuItem.price),
                totalPrice: itemTotal, // Changed from subtotal to totalPrice
                specialRequest: item.specialRequest,
                status: 'pending',
            });
        }

        // Calculate financial fields
        const totalAmount = orderTotal;
        const discountAmount = data.discountAmount || 0;
        const taxRate = data.taxRate || 0;
        const subtotalAfterDiscount = totalAmount - discountAmount;
        const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
        const finalAmount = subtotalAfterDiscount + taxAmount;

        // Create order
        const orderData: Prisma.OrderCreateInput = {
            table: { connect: { tableId: data.tableId } },
            ...(staffId && { staff: { connect: { staffId } } }),
            ...(data.reservationId && { reservation: { connect: { reservationId: data.reservationId } } }),
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            headCount: data.headCount || 1,
            notes: data.notes,
            status: 'pending',
            totalAmount,
            discountAmount,
            taxAmount,
            finalAmount,
        };

        const order = await orderRepository.create(orderData, orderItems);

        // Update table status
        await tableRepository.updateStatus(data.tableId, 'occupied');

        // Create kitchen order
        await kitchenRepository.create({
            order: { connect: { orderId: order.orderId } },
            priority: 'normal',
            status: 'pending',
        });

        // Emit WebSocket event
        socketService.emitNewOrder(order.orderId, order.tableId, {
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            finalAmount: order.finalAmount,
            items: order.orderItems,
        });

        return order;
    }

    /**
     * Get order by ID
     */
    async getOrderById(orderId: number) {
        const order = await orderRepository.findById(orderId);
        if (!order) {
            throw new NotFoundError('Order not found');
        }
        return order;
    }

    /**
     * Get all orders with filters
     */
    async getAllOrders(params?: {
        tableId?: number;
        status?: OrderStatus;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const page = params?.page || 1;
        const limit = params?.limit || 20;
        const skip = (page - 1) * limit;
        const sortBy = params?.sortBy || 'createdAt';
        const sortOrder = params?.sortOrder || 'desc';

        const filters = {
            tableId: params?.tableId,
            status: params?.status,
            startDate: params?.startDate ? new Date(params.startDate) : undefined,
            endDate: params?.endDate ? new Date(params.endDate) : undefined,
        };

        const [orders, total] = await Promise.all([
            orderRepository.findAll({
                filters,
                skip,
                take: limit,
                sortBy,
                sortOrder,
            }),
            orderRepository.count(filters),
        ]);

        return {
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId: number, status: OrderStatus) {
        const order = await this.getOrderById(orderId);

        // Update order status
        const updatedOrder = await orderRepository.updateStatus(orderId, status);

        // If order is completed or cancelled, update table status
        if (status === 'completed' || status === 'cancelled') {
            await tableRepository.updateStatus(order.tableId, 'available');
        }

        // Emit WebSocket event
        socketService.emitOrderStatusUpdate(orderId, order.tableId, status);

        if (status === 'confirmed') {
            socketService.emitOrderConfirmed(orderId, order.tableId, {
                orderNumber: updatedOrder.orderNumber,
                confirmedAt: updatedOrder.confirmedAt,
            });
        }

        return updatedOrder;
    }

    /**
     * Update order
     */
    async updateOrder(orderId: number, data: UpdateOrderDTO) {
        await this.getOrderById(orderId);
        return orderRepository.update(orderId, data);
    }

    /**
     * Add items to existing order
     */
    async addOrderItems(orderId: number, items: CreateOrderDTO['items']) {
        const order = await this.getOrderById(orderId);

        // Calculate order items totals
        const orderItems: Omit<Prisma.OrderItemCreateManyInput, 'orderId'>[] = [];
        let addedTotal = 0;

        for (const item of items) {
            const menuItem = await menuItemRepository.findById(item.itemId);
            if (!menuItem) {
                throw new NotFoundError(`Menu item with ID ${item.itemId} not found`);
            }

            if (!menuItem.isAvailable) {
                throw new BadRequestError(`${menuItem.itemName} is currently unavailable`);
            }

            const itemTotal = Number(menuItem.price) * item.quantity;
            addedTotal += itemTotal;

            orderItems.push({
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice: Number(menuItem.price),
                totalPrice: itemTotal, // Changed from subtotal to totalPrice
                specialRequest: item.specialRequest,
                status: 'pending',
            });
        }

        // Recalculate order financial fields
        const newTotalAmount = Number(order.totalAmount || 0) + addedTotal;
        const discountAmount = Number(order.discountAmount || 0);
        const subtotalAfterDiscount = newTotalAmount - discountAmount;
        const taxRate = order.taxAmount ? (Number(order.taxAmount) / (newTotalAmount - discountAmount)) * 100 : 0;
        const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
        const finalAmount = subtotalAfterDiscount + taxAmount;

        // Update order financial fields
        await orderRepository.update(orderId, {
            totalAmount: newTotalAmount,
            taxAmount,
            finalAmount,
        });

        const addedItems = await orderRepository.addItems(orderId, orderItems);

        // Emit WebSocket event
        socketService.emitOrderItemAdded(orderId, order.tableId, {
            items: addedItems,
            newTotalAmount,
            newFinalAmount: finalAmount,
        });

        return addedItems;
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId: number, reason: string) {
        const order = await this.getOrderById(orderId);

        if (order.status === 'completed') {
            throw new BadRequestError('Cannot cancel completed order');
        }

        // Update order status with cancellation details
        const updatedOrder = await orderRepository.update(orderId, {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: reason,
        });

        // Update table status
        await tableRepository.updateStatus(order.tableId, 'available');

        // Send WebSocket event to kitchen to notify cancellation
        socketService.emitOrderCancelRequest(orderId, order.tableId, reason, order.staffId || undefined);

        return updatedOrder;
    }

    /**
     * Delete order
     */
    async deleteOrder(orderId: number) {
        await this.getOrderById(orderId);
        return orderRepository.delete(orderId);
    }

    /**
     * Update order item status
     */
    async updateOrderItemStatus(orderId: number, itemId: number, status: string) {
        const order = await this.getOrderById(orderId);
        const result = await orderRepository.updateOrderItemStatus(orderId, itemId, status);
        
        // Emit WebSocket event
        socketService.emitOrderItemStatusChanged(orderId, order.tableId, itemId, status);
        
        return result;
    }

    /**
     * Get report: Orders grouped by table
     */
    async getReportByTable(filters?: { startDate?: string; endDate?: string }) {
        return orderRepository.getReportByTable(filters);
    }

    /**
     * Get report: Popular menu items
     */
    async getReportPopularItems(filters?: { startDate?: string; endDate?: string; limit?: number }) {
        return orderRepository.getReportPopularItems(filters);
    }

    /**
     * Get report: Orders by waiter
     */
    async getReportByWaiter(filters?: { startDate?: string; endDate?: string; staffId?: number }) {
        return orderRepository.getReportByWaiter(filters);
    }

    /**
     * Get report: Customer order history
     */
    async getReportCustomerHistory(customerPhone: string) {
        return orderRepository.getReportCustomerHistory(customerPhone);
    }
}

export default new OrderService();
