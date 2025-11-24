import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import {
    SOCKET_EVENTS,
    SOCKET_ROOMS,
    OrderEventData,
    KitchenEventData,
    TableEventData,
    PaymentEventData,
} from './socket-events';

/**
 * Centralized WebSocket Emitter Service
 * Provides a clean API for emitting WebSocket events across the application
 */

@Injectable()
export class SocketEmitterService {
    private readonly logger = new Logger(SocketEmitterService.name);
    private server: Server;

    setServer(server: Server): void {
        this.server = server;
    }

    private getServer(): Server {
        if (!this.server) {
            throw new Error(
                'Socket.IO server not initialized. Call setServer() first.',
            );
        }
        return this.server;
    }

    /**
     * Emit event to a specific room
     */
    private emitToRoom<T>(room: string, event: string, data: T): void {
        try {
            this.getServer().to(room).emit(event, {
                event,
                data,
                timestamp: new Date(),
            });
            this.logger.debug(`Emitted ${event} to room: ${room}`);
        } catch (error) {
            this.logger.error(
                `Failed to emit ${event} to room ${room}: ${error}`,
            );
        }
    }

    /**
     * Emit event to all clients
     */
    private emitToAll<T>(event: string, data: T): void {
        try {
            this.getServer().emit(event, {
                event,
                data,
                timestamp: new Date(),
            });
            this.logger.debug(`Emitted ${event} to all clients`);
        } catch (error) {
            this.logger.error(
                `Failed to emit ${event} to all clients: ${error}`,
            );
        }
    }

    /**
     * Emit event to a specific client
     */
    emitToClient<T>(clientId: string, event: string, data: T): void {
        try {
            this.getServer().to(clientId).emit(event, {
                event,
                data,
                timestamp: new Date(),
            });
            this.logger.debug(`Emitted ${event} to client: ${clientId}`);
        } catch (error) {
            this.logger.error(
                `Failed to emit ${event} to client ${clientId}: ${error}`,
            );
        }
    }

    // ============================================
    // Order Events
    // ============================================

    /**
     * Emit when a new order is created
     */
    emitOrderCreated(order: OrderEventData): void {
        this.logger.log(
            `Order created event: ${order.orderNumber} at table ${order.tableId}`,
        );
        this.emitToRoom(
            SOCKET_ROOMS.KITCHEN,
            SOCKET_EVENTS.ORDER_CREATED,
            order,
        );
    }

    /**
     * Emit when order status changes
     */
    emitOrderStatusChanged(order: OrderEventData): void {
        this.logger.log(
            `Order status changed: ${order.orderNumber} -> ${order.status}`,
        );
        this.emitToAll(SOCKET_EVENTS.ORDER_STATUS_CHANGED, order);
    }

    /**
     * Emit when order is cancelled
     */
    emitOrderCancelled(order: OrderEventData): void {
        this.logger.log(`Order cancelled: ${order.orderNumber}`);
        // Emit to kitchen room
        this.emitToRoom(
            SOCKET_ROOMS.KITCHEN,
            SOCKET_EVENTS.ORDER_CANCELLED,
            order,
        );
        // Also emit to all clients so Order Module can receive it
        this.emitToAll(SOCKET_EVENTS.ORDER_CANCELLED, order);
    }

    /**
     * Emit when order is updated
     */
    emitOrderUpdated(order: OrderEventData): void {
        this.logger.log(`Order updated: ${order.orderNumber}`);
        this.emitToAll(SOCKET_EVENTS.ORDER_UPDATED, order);
    }

    /**
     * Emit when items are added to order
     */
    emitOrderItemsAdded(order: OrderEventData): void {
        this.logger.log(`Items added to order: ${order.orderNumber}`);
        this.emitToRoom(
            SOCKET_ROOMS.KITCHEN,
            SOCKET_EVENTS.ORDER_ITEMS_ADDED,
            order,
        );
        this.emitToAll(SOCKET_EVENTS.ORDER_UPDATED, order);
    }

    /**
     * Emit when order item is cancelled
     */
    emitOrderItemCancelled(data: {
        order: OrderEventData;
        itemId: number;
    }): void {
        this.logger.log(
            `Item ${data.itemId} cancelled in order: ${data.order.orderNumber}`,
        );
        this.emitToRoom(
            SOCKET_ROOMS.KITCHEN,
            SOCKET_EVENTS.ORDER_ITEM_CANCELLED,
            data,
        );
        this.emitToAll(SOCKET_EVENTS.ORDER_UPDATED, data.order);
    }

    /**
     * Emit when order item is marked as served
     */
    emitOrderItemServed(data: { order: OrderEventData; itemId: number }): void {
        this.logger.log(
            `Item ${data.itemId} served in order: ${data.order.orderNumber}`,
        );
        this.emitToAll(SOCKET_EVENTS.ORDER_ITEM_SERVED, data);
    }

    // ============================================
    // Kitchen Events
    // ============================================

    /**
     * Emit when kitchen order is ready/done
     */
    emitKitchenOrderDone(kitchenOrder: KitchenEventData): void {
        this.logger.log(
            `Kitchen order ready: Order #${kitchenOrder.orderNumber}`,
        );
        this.emitToAll(SOCKET_EVENTS.KITCHEN_ORDER_DONE, kitchenOrder);
    }

    /**
     * Emit when kitchen order status changes
     */
    emitKitchenOrderReady(kitchenOrder: KitchenEventData): void {
        this.logger.log(
            `Kitchen order ready event: Order #${kitchenOrder.orderNumber}`,
        );
        this.emitToAll(SOCKET_EVENTS.KITCHEN_ORDER_READY, kitchenOrder);
    }

    // ============================================
    // Table Events
    // ============================================

    /**
     * Emit when table status changes
     */
    emitTableStatusChanged(table: TableEventData): void {
        this.logger.log(`Table ${table.tableId} status: ${table.status}`);
        this.emitToAll(SOCKET_EVENTS.TABLE_STATUS_CHANGED, table);
    }

    // ============================================
    // Payment Events
    // ============================================

    /**
     * Emit when payment is completed
     */
    emitPaymentCompleted(payment: PaymentEventData): void {
        this.logger.log(
            `Payment completed: Order #${payment.orderNumber} - ${payment.totalAmount}`,
        );
        this.emitToAll(SOCKET_EVENTS.PAYMENT_COMPLETED, payment);
    }

    /**
     * Emit when bill is created
     */
    emitBillCreated(bill: PaymentEventData): void {
        this.logger.log(`Bill created: Order #${bill.orderNumber}`);
        this.emitToAll(SOCKET_EVENTS.BILL_CREATED, bill);
    }

    // ============================================
    // Room Management
    // ============================================

    /**
     * Get room name for kitchen
     */
    getKitchenRoom(): string {
        return SOCKET_ROOMS.KITCHEN;
    }

    /**
     * Get room name for waiter
     */
    getWaiterRoom(staffId: number): string {
        return SOCKET_ROOMS.WAITER(staffId);
    }

    /**
     * Get room name for table
     */
    getTableRoom(tableId: number): string {
        return SOCKET_ROOMS.TABLE(tableId);
    }

    /**
     * Get room name for staff
     */
    getStaffRoom(staffId: number): string {
        return SOCKET_ROOMS.STAFF(staffId);
    }
}
