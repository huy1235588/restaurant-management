import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
    Request,
} from '@nestjs/swagger';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { KitchenService } from './kitchen.service';
import { KitchenOrderFiltersDto } from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('kitchen')
@Controller('kitchen')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KitchenController {
    constructor(private readonly kitchenService: KitchenService) {}

    @Get('orders')
    @ApiOperation({ summary: 'Get all kitchen orders' })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['pending', 'ready', 'completed', 'cancelled'],
    })
    @ApiResponse({
        status: 200,
        description: 'Kitchen orders retrieved successfully',
    })
    async getAllKitchenOrders(@Query() filters: KitchenOrderFiltersDto) {
        return this.kitchenService.getAllKitchenOrders(filters);
    }

    @Get('orders/:id')
    @ApiOperation({ summary: 'Get kitchen order by ID' })
    @ApiParam({ name: 'id', description: 'Kitchen order ID' })
    @ApiResponse({
        status: 200,
        description: 'Kitchen order retrieved successfully',
    })
    @ApiResponse({ status: 404, description: 'Kitchen order not found' })
    async getKitchenOrderById(@Param('id', ParseIntPipe) id: number) {
        return this.kitchenService.getKitchenOrderById(id);
    }

    @Patch('orders/:id/start')
    @ApiOperation({ summary: 'Start preparing order' })
    @ApiParam({ name: 'id', description: 'Kitchen order ID' })
    @ApiResponse({ status: 200, description: 'Order preparation started' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Kitchen order not found' })
    async startPreparing(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {
        const staffId = req.user?.staffId;
        return this.kitchenService.startPreparing(id, staffId);
    }

    @Patch('orders/:id/ready')
    @ApiOperation({ summary: 'Mark order as ready' })
    @ApiParam({ name: 'id', description: 'Kitchen order ID' })
    @ApiResponse({ status: 200, description: 'Order marked as ready' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Kitchen order not found' })
    async markReady(@Param('id', ParseIntPipe) id: number) {
        return this.kitchenService.markReady(id);
    }

    @Patch('orders/:id/complete')
    @ApiOperation({ summary: 'Mark order as completed (picked up)' })
    @ApiParam({ name: 'id', description: 'Kitchen order ID' })
    @ApiResponse({ status: 200, description: 'Order completed' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Kitchen order not found' })
    async markCompleted(@Param('id', ParseIntPipe) id: number) {
        return this.kitchenService.markCompleted(id);
    }

    @Patch('orders/:id/cancel')
    @ApiOperation({ summary: 'Cancel kitchen order' })
    @ApiParam({ name: 'id', description: 'Kitchen order ID' })
    @ApiResponse({ status: 200, description: 'Order cancelled' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Kitchen order not found' })
    async cancelOrder(@Param('id', ParseIntPipe) id: number) {
        return this.kitchenService.cancelKitchenOrder(id);
    }
}
