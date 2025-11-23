import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { KitchenController } from './kitchen.controller';
import { OrderService } from './order.service';
import { KitchenService } from './kitchen.service';
import { OrderRepository } from './order.repository';
import { KitchenRepository } from './kitchen.repository';
import { OrderGateway } from './order.gateway';
import { WebSocketModule } from '@/shared/websocket';

/**
 * Order Module
 * Manages all order-related functionality including kitchen operations
 */
@Module({
    imports: [WebSocketModule],
    controllers: [OrderController, KitchenController],
    providers: [
        OrderService,
        KitchenService,
        OrderRepository,
        KitchenRepository,
        OrderGateway,
    ],
    exports: [OrderService, KitchenService, OrderRepository, KitchenRepository],
})
export class OrderModule {}
