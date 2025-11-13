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

    // Order events
    emitNewOrder(orderId: number, tableId: number, orderData: SocketEmitData): void {
        this.emitToKitchen('order:new', { orderId, tableId, ...orderData });
        this.emitToTable(tableId, 'order:created', { orderId, ...orderData });
    }

    emitOrderStatusUpdate(orderId: number, tableId: number, status: string): void {
        this.emitToTable(tableId, 'order:status', { orderId, status });
        this.emitToKitchen('order:status', { orderId, tableId, status });
    }

    // Kitchen events
    emitKitchenOrderUpdate(kitchenOrderId: number, status: string, data: SocketEmitData): void {
        this.emitToKitchen('kitchen:order:update', { kitchenOrderId, status, ...data });
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
