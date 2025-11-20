import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import config from '@/config';
import logger from '@/config/logger';

type SocketEmitData = Record<string, unknown>;

export class SocketService {
    private io: Server | null = null;

    initialize(httpServer: HTTPServer): Server {
        this.io = new Server(httpServer, {
            cors: {
                origin: config.corsOrigin,
                credentials: true,
            },
        });

        this.io.on('connection', (socket: Socket) => {
            logger.info(`Client connected: ${socket.id}`);

            // Join room for specific table
            socket.on('join:table', (tableId: number) => {
                socket.join(`table:${tableId}`);
                logger.info(`Socket ${socket.id} joined table:${tableId}`);
            });

            // Leave table room
            socket.on('leave:table', (tableId: number) => {
                socket.leave(`table:${tableId}`);
                logger.info(`Socket ${socket.id} left table:${tableId}`);
            });

            // Join kitchen room
            socket.on('join:kitchen', () => {
                socket.join('kitchen');
                logger.info(`Socket ${socket.id} joined kitchen`);
            });

            // Leave kitchen room
            socket.on('leave:kitchen', () => {
                socket.leave('kitchen');
                logger.info(`Socket ${socket.id} left kitchen`);
            });

            // Join waiters room
            socket.on('join:waiters', () => {
                socket.join('waiters');
                logger.info(`Socket ${socket.id} joined waiters room`);
            });

            // Leave waiters room
            socket.on('leave:waiters', () => {
                socket.leave('waiters');
                logger.info(`Socket ${socket.id} left waiters room`);
            });

            // Join specific order room
            socket.on('join:order', (orderId: number) => {
                socket.join(`order:${orderId}`);
                logger.info(`Socket ${socket.id} joined order:${orderId}`);
            });

            // Leave specific order room
            socket.on('leave:order', (orderId: number) => {
                socket.leave(`order:${orderId}`);
                logger.info(`Socket ${socket.id} left order:${orderId}`);
            });

            // Disconnect
            socket.on('disconnect', () => {
                logger.info(`Client disconnected: ${socket.id}`);
            });
        });

        return this.io;
    }

    getIO(): Server {
        if (!this.io) {
            throw new Error('Socket.IO not initialized');
        }
        return this.io;
    }

    // Emit events
    emitToTable(tableId: number, event: string, data: SocketEmitData): void {
        if (this.io) {
            this.io.to(`table:${tableId}`).emit(event, data);
        }
    }

    emitToKitchen(event: string, data: SocketEmitData): void {
        if (this.io) {
            this.io.to('kitchen').emit(event, data);
        }
    }

    emitToAll(event: string, data: SocketEmitData): void {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    // Order Management Events
    emitNewOrder(orderId: number, tableId: number, orderData: SocketEmitData): void {
        this.emitToKitchen('order:new', { orderId, tableId, ...orderData });
        this.emitToTable(tableId, 'order:created', { orderId, ...orderData });
        if (this.io) {
            this.io.to('waiters').emit('order:created', { orderId, tableId, ...orderData });
        }
    }

    emitOrderStatusUpdate(orderId: number, tableId: number, status: string): void {
        this.emitToTable(tableId, 'order:status', { orderId, status });
        this.emitToKitchen('order:status', { orderId, tableId, status });
        if (this.io) {
            this.io.to('waiters').emit('order:status_changed', { orderId, tableId, status });
            this.io.to(`order:${orderId}`).emit('order:status_changed', { orderId, status });
        }
    }

    emitOrderConfirmed(orderId: number, tableId: number, orderData: SocketEmitData): void {
        this.emitToKitchen('order:confirmed', { orderId, tableId, ...orderData });
        this.emitToTable(tableId, 'order:confirmed', { orderId, ...orderData });
        if (this.io) {
            this.io.to('waiters').emit('order:confirmed', { orderId, tableId, ...orderData });
        }
    }

    emitOrderItemAdded(orderId: number, tableId: number, items: SocketEmitData): void {
        this.emitToKitchen('order:items_added', { orderId, tableId, items });
        this.emitToTable(tableId, 'order:items_added', { orderId, items });
        if (this.io) {
            this.io.to(`order:${orderId}`).emit('order:items_added', { orderId, items });
        }
    }

    emitOrderItemStatusChanged(orderId: number, tableId: number, itemId: number, status: string): void {
        this.emitToTable(tableId, 'order:item_status', { orderId, itemId, status });
        if (this.io) {
            this.io.to('waiters').emit('order:item_status_changed', { orderId, itemId, status });
            this.io.to(`order:${orderId}`).emit('order:item_status_changed', { itemId, status });
        }
    }

    emitOrderCancelRequest(orderId: number, tableId: number, reason: string, staffId?: number): void {
        this.emitToKitchen('order:cancel_request', { orderId, tableId, reason, staffId });
        if (this.io) {
            this.io.to(`order:${orderId}`).emit('order:cancel_request', { orderId, reason });
        }
    }

    emitOrderCancelled(orderId: number, tableId: number, reason: string): void {
        this.emitToTable(tableId, 'order:cancelled', { orderId, reason });
        this.emitToKitchen('order:cancelled', { orderId, tableId, reason });
        if (this.io) {
            this.io.to('waiters').emit('order:cancelled', { orderId, tableId, reason });
            this.io.to(`order:${orderId}`).emit('order:cancelled', { orderId, reason });
        }
    }

    // Kitchen Management Events
    emitKitchenOrderUpdate(kitchenOrderId: number, status: string, data: SocketEmitData): void {
        this.emitToKitchen('kitchen:order:update', { kitchenOrderId, status, ...data });
    }

    emitKitchenOrderAcknowledged(kitchenOrderId: number, orderId: number, chefId: number, chefName: string): void {
        this.emitToKitchen('kitchen:order_acknowledged', { kitchenOrderId, orderId, chefId, chefName });
        if (this.io) {
            this.io.to('waiters').emit('kitchen:order_acknowledged', { kitchenOrderId, orderId, chefId, chefName });
            this.io.to(`order:${orderId}`).emit('kitchen:acknowledged', { kitchenOrderId, chefId, chefName });
        }
    }

    emitKitchenOrderPreparing(kitchenOrderId: number, orderId: number, tableId: number): void {
        this.emitToKitchen('kitchen:order_preparing', { kitchenOrderId, orderId });
        this.emitToTable(tableId, 'kitchen:preparing', { orderId });
        if (this.io) {
            this.io.to('waiters').emit('kitchen:order_preparing', { kitchenOrderId, orderId, tableId });
        }
    }

    emitKitchenOrderReady(kitchenOrderId: number, orderId: number, tableId: number): void {
        this.emitToKitchen('kitchen:order_ready', { kitchenOrderId, orderId });
        this.emitToTable(tableId, 'kitchen:ready', { orderId });
        if (this.io) {
            this.io.to('waiters').emit('kitchen:order_ready', { kitchenOrderId, orderId, tableId });
            this.io.to(`order:${orderId}`).emit('kitchen:ready', { kitchenOrderId });
        }
    }

    emitKitchenOrderCompleted(kitchenOrderId: number, orderId: number, tableId: number, prepTime: number): void {
        this.emitToKitchen('kitchen:order_completed', { kitchenOrderId, orderId, prepTime });
        this.emitToTable(tableId, 'kitchen:completed', { orderId });
        if (this.io) {
            this.io.to('waiters').emit('kitchen:order_completed', { kitchenOrderId, orderId, tableId, prepTime });
        }
    }

    emitKitchenCancelAccepted(kitchenOrderId: number, orderId: number, tableId: number): void {
        this.emitToKitchen('kitchen:cancel_accepted', { kitchenOrderId, orderId });
        if (this.io) {
            this.io.to('waiters').emit('kitchen:cancel_accepted', { kitchenOrderId, orderId, tableId });
            this.io.to(`order:${orderId}`).emit('kitchen:cancel_accepted', { kitchenOrderId });
        }
    }

    emitKitchenCancelRejected(kitchenOrderId: number, orderId: number, tableId: number, reason: string): void {
        this.emitToKitchen('kitchen:cancel_rejected', { kitchenOrderId, orderId, reason });
        if (this.io) {
            this.io.to('waiters').emit('kitchen:cancel_rejected', { kitchenOrderId, orderId, tableId, reason });
            this.io.to(`order:${orderId}`).emit('kitchen:cancel_rejected', { kitchenOrderId, reason });
        }
    }

    emitKitchenStatsUpdate(stats: SocketEmitData): void {
        this.emitToKitchen('kitchen:stats_update', stats);
    }

    emitKitchenPriorityChanged(kitchenOrderId: number, orderId: number, priority: string): void {
        this.emitToKitchen('kitchen:priority_changed', { kitchenOrderId, orderId, priority });
    }

    emitKitchenStationAssigned(kitchenOrderId: number, orderId: number, stationId: number, stationName: string): void {
        this.emitToKitchen('kitchen:station_assigned', { kitchenOrderId, orderId, stationId, stationName });
    }

    // Emit to specific waiter
    emitToWaiters(event: string, data: SocketEmitData): void {
        if (this.io) {
            this.io.to('waiters').emit(event, data);
        }
    }

    // Emit to specific order room
    emitToOrder(orderId: number, event: string, data: SocketEmitData): void {
        if (this.io) {
            this.io.to(`order:${orderId}`).emit(event, data);
        }
    }

    // Bill events
    emitNewBill(billId: number, tableId: number, billData: SocketEmitData): void {
        this.emitToTable(tableId, 'bill:created', { billId, ...billData });
    }

    emitPaymentReceived(billId: number, tableId: number, paymentData: SocketEmitData): void {
        this.emitToTable(tableId, 'payment:received', { billId, ...paymentData });
    }

    // Table events
    emitTableStatusUpdate(tableId: number, status: string): void {
        this.emitToAll('table:status', { tableId, status });
    }

    emitTableCreated(tableData: SocketEmitData): void {
        this.emitToAll('table:created', tableData);
    }

    emitTableUpdated(tableId: number, tableData: SocketEmitData): void {
        this.emitToAll('table:updated', { tableId, ...tableData });
    }

    emitTableDeleted(tableId: number): void {
        this.emitToAll('table:deleted', { tableId });
    }

    emitTableStatusChanged(tableId: number, status: string, previousStatus?: string): void {
        this.emitToAll('table:status_changed', { tableId, status, previousStatus });
    }
}

export default new SocketService();
