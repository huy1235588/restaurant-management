import { OrderStatus } from '@prisma/client';
import kitchenRepository from '@/repositories/kitchen.repository';
import orderRepository from '@/repositories/order.repository';
import staffRepository from '@/repositories/staff.repository';
import { NotFoundError, BadRequestError } from '@/utils/errors';

interface KitchenOrderFilters {
    status?: OrderStatus;
    priority?: number;
}

interface CreateKitchenOrderData {
    orderId: number;
    staffId?: number;
    priority?: number;
    status?: OrderStatus;
    estimatedTime?: number;
    notes?: string;
}

interface UpdateKitchenOrderData {
    staffId?: number;
    priority?: number;
    status?: OrderStatus;
    startedAt?: Date;
    completedAt?: Date;
    estimatedTime?: number;
    notes?: string;
}

export class KitchenService {
    /**
     * Get all kitchen orders
     */
    async getAllKitchenOrders(filters: KitchenOrderFilters = {}) {
        return kitchenRepository.findAll(filters);
    }

    /**
     * Get kitchen order by ID
     */
    async getKitchenOrderById(kitchenOrderId: number) {
        const kitchenOrder = await kitchenRepository.findById(kitchenOrderId);

        if (!kitchenOrder) {
            throw new NotFoundError('Kitchen order not found');
        }

        return kitchenOrder;
    }

    /**
     * Create new kitchen order
     */
    async createKitchenOrder(data: CreateKitchenOrderData) {
        // Check if order exists
        const order = await orderRepository.findById(data.orderId);

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        // Check if chef exists if provided
        if (data.staffId) {
            const staff = await staffRepository.findById(data.staffId);

            if (!staff) {
                throw new NotFoundError('Chef not found');
            }

            if (staff.role !== 'chef') {
                throw new BadRequestError('Staff member is not a chef');
            }
        }

        return kitchenRepository.create(data as any);
    }

    /**
     * Update kitchen order
     */
    async updateKitchenOrder(kitchenOrderId: number, data: UpdateKitchenOrderData) {
        await this.getKitchenOrderById(kitchenOrderId);

        // Check if chef exists if being changed
        if (data.staffId) {
            const staff = await staffRepository.findById(data.staffId);

            if (!staff) {
                throw new NotFoundError('Chef not found');
            }

            if (staff.role !== 'chef') {
                throw new BadRequestError('Staff member is not a chef');
            }
        }

        return kitchenRepository.update(kitchenOrderId, data as any);
    }

    /**
     * Start preparing order
     */
    async startPreparingOrder(kitchenOrderId: number, staffId?: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        if (kitchenOrder.status !== 'pending') {
            throw new BadRequestError('Only pending orders can be started');
        }

        const updateData: UpdateKitchenOrderData = {
            status: 'preparing',
            startedAt: new Date(),
        };

        if (staffId) {
            const staff = await staffRepository.findById(staffId);

            if (!staff || staff.role !== 'chef') {
                throw new BadRequestError('Invalid chef');
            }

            updateData.staffId = staffId;
        }

        return kitchenRepository.update(kitchenOrderId, updateData as any);
    }

    /**
     * Complete kitchen order
     */
    async completeKitchenOrder(kitchenOrderId: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        if (kitchenOrder.status !== 'preparing') {
            throw new BadRequestError('Only preparing orders can be completed');
        }

        return kitchenRepository.update(kitchenOrderId, {
            status: 'ready',
            completedAt: new Date(),
        } as any);
    }

    /**
     * Update order priority
     */
    async updateOrderPriority(kitchenOrderId: number, priority: number) {
        await this.getKitchenOrderById(kitchenOrderId);

        return kitchenRepository.update(kitchenOrderId, { priority } as any);
    }

    /**
     * Assign chef to order
     */
    async assignChef(kitchenOrderId: number, staffId: number) {
        await this.getKitchenOrderById(kitchenOrderId);

        const staff = await staffRepository.findById(staffId);

        if (!staff) {
            throw new NotFoundError('Chef not found');
        }

        if (staff.role !== 'chef') {
            throw new BadRequestError('Staff member is not a chef');
        }

        return kitchenRepository.update(kitchenOrderId, {
            chef: { connect: { staffId } }
        } as any);
    }

    /**
     * Get pending orders
     */
    async getPendingOrders() {
        return kitchenRepository.findAll({ status: 'pending' });
    }

    /**
     * Get orders by chef
     */
    async getOrdersByChef(staffId: number) {
        const staff = await staffRepository.findById(staffId);

        if (!staff) {
            throw new NotFoundError('Chef not found');
        }

        if (staff.role !== 'chef') {
            throw new BadRequestError('Staff member is not a chef');
        }

        return kitchenRepository.findAll({ staffId });
    }
}

export const kitchenService = new KitchenService();
