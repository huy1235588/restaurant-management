import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { KitchenOrder } from '@prisma/generated/client';

@WebSocketGateway({
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: 'kitchen',
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

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    /**
     * Emit event when new kitchen order is created
     * @param order - The newly created kitchen order with items
     */
    emitNewOrder(order: Partial<KitchenOrder>) {
        this.server.emit('order:new', {
            event: 'order:new',
            data: order,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Emitted new order: Kitchen Order #${order.orderId}`);
    }

    /**
     * Emit event when kitchen order status changes
     * @param order - The updated kitchen order
     */
    emitOrderUpdate(order: Partial<KitchenOrder>) {
        this.server.emit('order:update', {
            event: 'order:update',
            data: order,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(
            `Emitted order update: Kitchen Order #${order.orderId} -> ${order.status}`,
        );
    }

    /**
     * Emit event when kitchen order is completed
     * @param order - The completed kitchen order
     */
    emitOrderCompleted(order: Partial<KitchenOrder>) {
        this.server.emit('order:completed', {
            event: 'order:completed',
            data: order,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(
            `Emitted order completed: Kitchen Order #${order.orderId}`,
        );
    }
}
