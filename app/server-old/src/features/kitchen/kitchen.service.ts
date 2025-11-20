import { OrderStatus } from '@prisma/client';
import kitchenRepository from '@/features/kitchen/kitchen.repository';
import orderRepository from '@/features/order/order.repository';
import staffRepository from '@/features/staff/staff.repository';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';
import { BaseFindOptions } from '@/shared';
import socketService from '@/shared/utils/socket';

interface KitchenOrderFilters {
    status?: OrderStatus;
    staffId?: number;
    stationId?: number;
    search?: string;
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
    async getAllKitchenOrders(options?: BaseFindOptions<KitchenOrderFilters>) {
        return kitchenRepository.findAllPaginated(options);
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

        const updatedOrder = await kitchenRepository.update(kitchenOrderId, updateData as any);
        const fullOrder = await kitchenRepository.findById(kitchenOrderId);

        // Emit WebSocket event
        socketService.emitKitchenOrderPreparing(
            kitchenOrderId,
            kitchenOrder.orderId,
            fullOrder?.order?.tableId || 0
        );

        return updatedOrder;
    }

    /**
     * Complete kitchen order
     */
    async completeKitchenOrder(kitchenOrderId: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        if (kitchenOrder.status !== 'preparing') {
            throw new BadRequestError('Only preparing orders can be completed');
        }

        const completedAt = new Date();
        const prepTime = kitchenOrder.startedAt 
            ? Math.floor((completedAt.getTime() - kitchenOrder.startedAt.getTime()) / 1000 / 60)
            : 0;

        const updatedOrder = await kitchenRepository.update(kitchenOrderId, {
            status: 'ready',
            completedAt,
            prepTimeActual: prepTime,
        } as any);

        // Fetch full order for tableId
        const fullOrder = await kitchenRepository.findById(kitchenOrderId);
        
        // Emit WebSocket event
        socketService.emitKitchenOrderReady(
            kitchenOrderId,
            kitchenOrder.orderId,
            fullOrder?.order?.tableId || 0
        );

        return updatedOrder;
    }

    /**
     * Update order priority
     */
    async updateOrderPriority(kitchenOrderId: number, priority: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);
        const updatedOrder = await kitchenRepository.update(kitchenOrderId, { priority } as any);
        
        // Emit WebSocket event
        socketService.emitKitchenPriorityChanged(kitchenOrderId, kitchenOrder.orderId, priority.toString());
        
        return updatedOrder;
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
        return kitchenRepository.findAll({
            filters: { status: 'pending' },
        });
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

        return kitchenRepository.findAll({
            filters: { staffId },
        });
    }

    /**
     * Handle order cancellation
     */
    async handleCancellation(kitchenOrderId: number, accepted: boolean, reason?: string) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);

        if (accepted) {
            // Accept cancellation - mark as cancelled
            await kitchenRepository.update(kitchenOrderId, {
                status: 'cancelled',
            } as any);

            // Update main order status
            await orderRepository.updateStatus(kitchenOrder.orderId, 'cancelled');

            // Fetch full order for tableId
            const fullOrder = await kitchenRepository.findById(kitchenOrderId);
            
            // Send WebSocket event to waiter
            socketService.emitKitchenCancelAccepted(
                kitchenOrderId,
                kitchenOrder.orderId,
                fullOrder?.order?.tableId || 0
            );

            return { status: 'cancelled', message: 'Cancellation accepted' };
        } else {
            // Reject cancellation - send event to waiter with rejection reason
            const fullOrder = await kitchenRepository.findById(kitchenOrderId);
            
            socketService.emitKitchenCancelRejected(
                kitchenOrderId,
                kitchenOrder.orderId,
                fullOrder?.order?.tableId || 0,
                reason || 'No reason provided'
            );

            return { status: kitchenOrder.status, message: `Cancellation rejected: ${reason || 'No reason'}` };
        }
    }

    /**
     * Get kitchen statistics
     */
    async getKitchenStats() {
        const pending = await kitchenRepository.count({ status: 'pending' } as any);
        const preparing = await kitchenRepository.count({ status: 'preparing' } as any);
        const ready = await kitchenRepository.count({ status: 'ready' } as any);

        // TODO: Calculate average prep time
        return {
            pending,
            preparing,
            ready,
            total: pending + preparing + ready,
        };
    }

    /**
     * Get all kitchen stations
     */
    async getKitchenStations() {
        return kitchenRepository.getAllStations();
    }

    /**
     * Assign to station
     */
    async assignStation(kitchenOrderId: number, stationId: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);
        const updatedOrder = await kitchenRepository.update(kitchenOrderId, {
            station: { connect: { stationId } },
        } as any);
        
        // Get station name for event
        const stations = await kitchenRepository.getAllStations();
        const station = stations.find(s => s.stationId === stationId);
        
        // Emit WebSocket event
        socketService.emitKitchenStationAssigned(
            kitchenOrderId,
            kitchenOrder.orderId,
            stationId,
            station?.name || 'Unknown Station'
        );
        
        return updatedOrder;
    }

    /**
     * Update status
     */
    async updateStatus(kitchenOrderId: number, status: string, chefId?: number) {
        const kitchenOrder = await this.getKitchenOrderById(kitchenOrderId);
        const fullOrder = await kitchenRepository.findById(kitchenOrderId);

        const updateData: any = { status: status as any };

        // Auto-set timestamps based on status
        if (status === 'preparing' && !kitchenOrder.startedAt) {
            updateData.startedAt = new Date();
        } else if (status === 'ready' && !kitchenOrder.completedAt) {
            updateData.completedAt = new Date();
        }

        // Auto-assign chef if provided
        if (chefId && !kitchenOrder.staffId) {
            updateData.chef = { connect: { staffId: chefId } };
        }

        const updatedOrder = await kitchenRepository.update(kitchenOrderId, updateData);

        // Emit appropriate WebSocket events based on status
        const tableId = fullOrder?.order?.tableId || 0;
        
        if (status === 'acknowledged' && chefId) {
            const chef = await staffRepository.findById(chefId);
            socketService.emitKitchenOrderAcknowledged(
                kitchenOrderId,
                kitchenOrder.orderId,
                chefId,
                chef?.fullName || 'Unknown Chef'
            );
        } else if (status === 'preparing') {
            socketService.emitKitchenOrderPreparing(kitchenOrderId, kitchenOrder.orderId, tableId);
        } else if (status === 'ready') {
            socketService.emitKitchenOrderReady(kitchenOrderId, kitchenOrder.orderId, tableId);
        } else if (status === 'completed') {
            const prepTime = kitchenOrder.startedAt && updatedOrder.completedAt
                ? Math.floor((updatedOrder.completedAt.getTime() - kitchenOrder.startedAt.getTime()) / 1000 / 60)
                : 0;
            socketService.emitKitchenOrderCompleted(kitchenOrderId, kitchenOrder.orderId, tableId, prepTime);
        }

        // Emit general status update
        socketService.emitKitchenOrderUpdate(kitchenOrderId, status, { orderId: kitchenOrder.orderId, tableId });

        return updatedOrder;
    }
}

export const kitchenService = new KitchenService();
export default kitchenService;
