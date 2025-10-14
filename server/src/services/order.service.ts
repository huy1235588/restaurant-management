import orderRepository from '@/repositories/order.repository';
import menuItemRepository from '@/repositories/menuItem.repository';
import tableRepository from '@/repositories/table.repository';
import kitchenRepository from '@/repositories/kitchen.repository';
import { NotFoundError, BadRequestError } from '@/utils/errors';
import { CreateOrderDTO, UpdateOrderDTO } from '@/validators';
import { Prisma } from '@prisma/client';
import { OrderStatus } from '@/types';

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

            const subtotal = Number(menuItem.price) * item.quantity;
            orderTotal += subtotal;

            orderItems.push({
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice: Number(menuItem.price),
                subtotal,
                specialRequest: item.specialRequest,
                status: 'pending',
            });
        }

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
        };

        const order = await orderRepository.create(orderData, orderItems);

        // Update table status
        await tableRepository.updateStatus(data.tableId, 'occupied');

        // Create kitchen order
        await kitchenRepository.create({
            order: { connect: { orderId: order.orderId } },
            priority: 0,
            status: 'pending',
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
    }) {
        const page = params?.page || 1;
        const limit = params?.limit || 20;
        const skip = (page - 1) * limit;

        const filters = {
            tableId: params?.tableId,
            status: params?.status,
            startDate: params?.startDate ? new Date(params.startDate) : undefined,
            endDate: params?.endDate ? new Date(params.endDate) : undefined,
            skip,
            take: limit,
        };

        const [orders, total] = await Promise.all([
            orderRepository.findAll(filters),
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
        if (status === 'served' || status === 'cancelled') {
            await tableRepository.updateStatus(order.tableId, 'available');
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
        await this.getOrderById(orderId);

        // Calculate order items totals
        const orderItems: Omit<Prisma.OrderItemCreateManyInput, 'orderId'>[] = [];

        for (const item of items) {
            const menuItem = await menuItemRepository.findById(item.itemId);
            if (!menuItem) {
                throw new NotFoundError(`Menu item with ID ${item.itemId} not found`);
            }

            if (!menuItem.isAvailable) {
                throw new BadRequestError(`${menuItem.itemName} is currently unavailable`);
            }

            const subtotal = Number(menuItem.price) * item.quantity;

            orderItems.push({
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice: Number(menuItem.price),
                subtotal,
                specialRequest: item.specialRequest,
                status: 'pending',
            });
        }

        return orderRepository.addItems(orderId, orderItems);
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId: number) {
        const order = await this.getOrderById(orderId);

        if (order.status === 'served') {
            throw new BadRequestError('Cannot cancel served order');
        }

        // Update order status
        const updatedOrder = await orderRepository.updateStatus(orderId, 'cancelled');

        // Update table status
        await tableRepository.updateStatus(order.tableId, 'available');

        return updatedOrder;
    }

    /**
     * Delete order
     */
    async deleteOrder(orderId: number) {
        await this.getOrderById(orderId);
        return orderRepository.delete(orderId);
    }
}

export default new OrderService();
