import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
    SocketEmitterService,
    SOCKET_EVENTS,
    SOCKET_ROOMS,
    OrderEventData,
    KitchenEventData,
} from '@/shared/websocket';

@WebSocketGateway({
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/orders',
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(OrderGateway.name);

    constructor(private readonly socketEmitter: SocketEmitterService) {
        // Initialize the emitter service with the server instance
        // This will be set in afterInit hook if needed
    }

    handleConnection(client: Socket) {
        // Initialize socket emitter with server when first client connects
        if (!this.socketEmitter['server']) {
            this.socketEmitter.setServer(this.server);
        }
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage(SOCKET_EVENTS.JOIN_KITCHEN)
    async handleJoinKitchen(@ConnectedSocket() client: Socket) {
        const room = SOCKET_ROOMS.KITCHEN;
        await client.join(room);
        this.logger.log(`Client ${client.id} joined ${room} room`);
        return { message: `Joined ${room} room successfully` };
    }

    @SubscribeMessage(SOCKET_EVENTS.LEAVE_KITCHEN)
    async handleLeaveKitchen(@ConnectedSocket() client: Socket) {
        const room = SOCKET_ROOMS.KITCHEN;
        await client.leave(room);
        this.logger.log(`Client ${client.id} left ${room} room`);
        return { message: `Left ${room} room successfully` };
    }

    @SubscribeMessage(SOCKET_EVENTS.JOIN_WAITER)
    async handleJoinWaiter(
        @ConnectedSocket() client: Socket,
        @MessageBody() staffId: number,
    ) {
        const room = SOCKET_ROOMS.WAITER(staffId);
        await client.join(room);
        this.logger.log(`Client ${client.id} joined ${room} room`);
        return { message: `Joined ${room} room successfully` };
    }

    @SubscribeMessage(SOCKET_EVENTS.LEAVE_WAITER)
    async handleLeaveWaiter(
        @ConnectedSocket() client: Socket,
        @MessageBody() staffId: number,
    ) {
        const room = SOCKET_ROOMS.WAITER(staffId);
        await client.leave(room);
        this.logger.log(`Client ${client.id} left ${room} room`);
        return { message: `Left ${room} room successfully` };
    }

    // ============================================
    // Order Event Emitters (using SocketEmitterService)
    // ============================================

    /**
     * Emit new order created event to kitchen
     */
    emitOrderCreated(order: OrderEventData): void {
        this.socketEmitter.emitOrderCreated(order);
    }

    /**
     * Emit order status changed event
     */
    emitOrderStatusChanged(order: OrderEventData): void {
        this.socketEmitter.emitOrderStatusChanged(order);
    }

    /**
     * Emit kitchen order done event to waiters
     */
    emitKitchenOrderDone(kitchenOrder: KitchenEventData): void {
        this.socketEmitter.emitKitchenOrderDone(kitchenOrder);
    }

    /**
     * Emit order cancelled event
     */
    emitOrderCancelled(order: OrderEventData): void {
        this.socketEmitter.emitOrderCancelled(order);
    }

    /**
     * Emit items added to order event
     */
    emitOrderItemsAdded(order: OrderEventData): void {
        this.socketEmitter.emitOrderItemsAdded(order);
    }

    /**
     * Emit order item cancelled event
     */
    emitOrderItemCancelled(data: {
        order: OrderEventData;
        itemId: number;
    }): void {
        this.socketEmitter.emitOrderItemCancelled(data);
    }

    /**
     * Emit order item served event
     */
    emitOrderItemServed(data: { order: OrderEventData; itemId: number }): void {
        this.socketEmitter.emitOrderItemServed(data);
    }
}
