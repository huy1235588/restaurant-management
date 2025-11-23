import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { KitchenOrder } from '@prisma/generated/client';

@WebSocketGateway({
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/kitchen',
})
export class KitchenGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('KitchenGateway');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    afterInit(_server: Server) {
        this.logger.log(`Kitchen WebSocket Gateway initialized`);
    }

    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        // Auto-join kitchen room for all kitchen connections
        await client.join('kitchen');
        this.logger.log(`Client ${client.id} joined kitchen room`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    /**
     * Handle client joining waiter-specific room
     */
    @SubscribeMessage('join-waiter')
    async handleJoinWaiter(client: Socket, staffId: number) {
        const room = `waiter:${staffId}`;
        await client.join(room);
        this.logger.log(`Client ${client.id} joined room: ${room}`);
        return { success: true, room };
    }

    /**
     * Handle client leaving waiter-specific room
     */
    @SubscribeMessage('leave-waiter')
    async handleLeaveWaiter(client: Socket, staffId: number) {
        const room = `waiter:${staffId}`;
        await client.leave(room);
        this.logger.log(`Client ${client.id} left room: ${room}`);
        return { success: true, room };
    }

    /**
     * Emit event when new kitchen order is created
     * Broadcast to kitchen room only
     * @param order - The newly created kitchen order with items
     */
    emitNewOrder(order: Partial<KitchenOrder>) {
        this.server.to('kitchen').emit('order:new', {
            event: 'order:new',
            data: order,
            timestamp: new Date().toISOString(),
            source: 'kitchen',
        });
        this.logger.log(
            `Emitted new order to kitchen: Kitchen Order #${order.orderId}`,
        );
    }

    /**
     * Emit event when kitchen order status changes
     * Broadcast to kitchen room only
     * @param order - The updated kitchen order
     */
    emitOrderUpdate(order: Partial<KitchenOrder>) {
        this.server.to('kitchen').emit('order:update', {
            event: 'order:update',
            data: order,
            timestamp: new Date().toISOString(),
            source: 'kitchen',
        });
        this.logger.log(
            `Emitted order update to kitchen: Kitchen Order #${order.orderId} -> ${order.status}`,
        );
    }

    /**
     * Emit event when kitchen order is completed
     * Broadcast to kitchen room and notify waiter if assigned
     * @param order - The completed kitchen order
     */
    emitOrderCompleted(
        order: Partial<KitchenOrder & { order: { staffId: number } }>,
    ) {
        // Notify kitchen room
        this.server.to('kitchen').emit('order:completed', {
            event: 'order:completed',
            data: order,
            timestamp: new Date().toISOString(),
            source: 'kitchen',
        });

        // Notify assigned waiter if exists
        const staffId = order.order?.staffId;
        if (staffId) {
            const waiterRoom = `waiter:${staffId}`;
            this.server.to(waiterRoom).emit('order:completed', {
                event: 'order:completed',
                data: order,
                timestamp: new Date().toISOString(),
                source: 'kitchen',
            });
            this.logger.log(`Notified waiter ${staffId} of completed order`);
        }

        this.logger.log(
            `Emitted order completed: Kitchen Order #${order.kitchenOrderId}`,
        );
    }
}
