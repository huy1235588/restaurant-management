import {
    Controller,
    Get,
    Patch,
    Param,
    ParseIntPipe,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { KitchenService } from './kitchen.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { KITCHEN_MESSAGES } from './constants/order.constants';

/**
 * Kitchen Controller
 * Handles all kitchen-specific operations separate from main order flow
 */
@ApiTags('kitchen')
@Controller('kitchen')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KitchenController {
    constructor(private readonly kitchenService: KitchenService) {}

    @Get('queue')
    @ApiOperation({
        summary: 'Get kitchen queue',
        description: 'Retrieve all pending orders in the kitchen queue',
    })
    @ApiResponse({
        status: 200,
        description: KITCHEN_MESSAGES.SUCCESS.QUEUE_RETRIEVED,
    })
    async getKitchenQueue() {
        const queue = await this.kitchenService.getKitchenQueue();

        return {
            message: KITCHEN_MESSAGES.SUCCESS.QUEUE_RETRIEVED,
            data: queue,
        };
    }

    @Get('orders')
    @ApiOperation({
        summary: 'Get all kitchen orders',
        description: 'Retrieve all kitchen orders with optional status filter',
    })
    @ApiResponse({
        status: 200,
        description: 'Kitchen orders retrieved successfully',
    })
    async getAllKitchenOrders() {
        const orders = await this.kitchenService.getAllKitchenOrders();

        return {
            message: 'Kitchen orders retrieved successfully',
            data: orders,
        };
    }

    @Get('orders/:id')
    @ApiOperation({
        summary: 'Get kitchen order by ID',
        description: 'Retrieve a specific kitchen order details',
    })
    @ApiParam({ name: 'id', description: 'Kitchen order ID' })
    @ApiResponse({
        status: 200,
        description: 'Kitchen order retrieved successfully',
    })
    @ApiResponse({
        status: 404,
        description: KITCHEN_MESSAGES.ERROR.ORDER_NOT_FOUND,
    })
    async getKitchenOrderById(@Param('id', ParseIntPipe) id: number) {
        const order = await this.kitchenService.getKitchenOrderById(id);

        return {
            message: 'Kitchen order retrieved successfully',
            data: order,
        };
    }

    @Patch('orders/:id/ready')
    @ApiOperation({
        summary: 'Mark kitchen order as ready',
        description: 'Mark order as ready (food is prepared)',
    })
    @ApiParam({ name: 'id', description: 'Kitchen order ID' })
    @ApiResponse({
        status: 200,
        description: KITCHEN_MESSAGES.SUCCESS.ORDER_READY,
    })
    @ApiResponse({
        status: 404,
        description: KITCHEN_MESSAGES.ERROR.ORDER_NOT_FOUND,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid order state',
    })
    async markOrderAsReady(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: { user: { staffId: number } },
    ) {
        const staffId = req.user.staffId;
        const kitchenOrder = await this.kitchenService.markOrderAsReady(
            id,
            staffId,
        );

        return {
            message: KITCHEN_MESSAGES.SUCCESS.ORDER_READY,
            data: kitchenOrder,
        };
    }

    @Patch('orders/:id/complete')
    @ApiOperation({
        summary: 'Mark kitchen order as completed',
        description: 'Mark order as completed (picked up by waiter)',
    })
    @ApiParam({ name: 'id', description: 'Kitchen order ID' })
    @ApiResponse({
        status: 200,
        description: KITCHEN_MESSAGES.SUCCESS.ORDER_COMPLETED,
    })
    @ApiResponse({
        status: 404,
        description: KITCHEN_MESSAGES.ERROR.ORDER_NOT_FOUND,
    })
    @ApiResponse({
        status: 400,
        description: KITCHEN_MESSAGES.ERROR.ORDER_NOT_READY,
    })
    async markOrderAsCompleted(@Param('id', ParseIntPipe) id: number) {
        const kitchenOrder = await this.kitchenService.markOrderAsCompleted(id);

        return {
            message: KITCHEN_MESSAGES.SUCCESS.ORDER_COMPLETED,
            data: kitchenOrder,
        };
    }
}
