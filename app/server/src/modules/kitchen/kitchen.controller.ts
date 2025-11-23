import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
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
        enum: ['pending', 'preparing', 'completed', 'cancelled'],
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Kitchen orders retrieved successfully',
    })
    async getAllKitchenOrders(
        @Query() filters: KitchenOrderFiltersDto,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.kitchenService.getAllKitchenOrders(
            filters,
            page ? parseInt(page.toString()) : 1,
            limit ? parseInt(limit.toString()) : 20,
        );
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
        @Request() req: { user?: { staffId: number } },
    ) {
        const staffId = req.user?.staffId;
        return this.kitchenService.startPreparing(id, staffId);
    }

    @Patch('orders/:id/complete')
    @ApiOperation({ summary: 'Complete kitchen order (dish ready and served)' })
    @ApiParam({ name: 'id', description: 'Kitchen order ID' })
    @ApiResponse({ status: 200, description: 'Order completed' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Kitchen order not found' })
    async completeOrder(@Param('id', ParseIntPipe) id: number) {
        return this.kitchenService.completeOrder(id);
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
