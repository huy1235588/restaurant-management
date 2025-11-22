import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import {
    CreateOrderDto,
    AddOrderItemDto,
    UpdateOrderItemDto,
    CancelOrderDto,
    OrderFiltersDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    @ApiOperation({ summary: 'Get all orders with filters' })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: [
            'pending',
            'confirmed',
            'ready',
            'serving',
            'completed',
            'cancelled',
        ],
    })
    @ApiQuery({ name: 'tableId', required: false, type: Number })
    @ApiQuery({ name: 'staffId', required: false, type: Number })
    @ApiQuery({
        name: 'date',
        required: false,
        type: String,
        description: 'Date in ISO format',
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
    async getAllOrders(@Query() filters: OrderFiltersDto) {
        const { page = 1, limit = 20, ...filterData } = filters;
        const skip = (page - 1) * limit;

        return this.orderService.getAllOrders({
            filters: filterData,
            skip,
            take: limit,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async getOrderById(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.getOrderById(id);
    }

    @Get('number/:orderNumber')
    @ApiOperation({ summary: 'Get order by order number' })
    @ApiParam({ name: 'orderNumber', description: 'Order number (UUID)' })
    @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async getOrderByNumber(@Param('orderNumber') orderNumber: string) {
        return this.orderService.getOrderByNumber(orderNumber);
    }

    @Post()
    @ApiOperation({ summary: 'Create new order' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Table not found' })
    async createOrder(
        @Body() createOrderDto: CreateOrderDto,
        @Request() req: { user?: { staffId: number } },
    ) {
        const staffId = req.user?.staffId;
        return this.orderService.createOrder(createOrderDto, staffId);
    }

    @Post(':id/items')
    @ApiOperation({ summary: 'Add item to order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 201, description: 'Item added successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Order or menu item not found' })
    async addItemToOrder(
        @Param('id', ParseIntPipe) id: number,
        @Body() addItemDto: AddOrderItemDto,
    ) {
        return this.orderService.addItemToOrder(id, addItemDto);
    }

    @Patch(':id/items/:itemId')
    @ApiOperation({ summary: 'Update order item' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiParam({ name: 'itemId', description: 'Order item ID' })
    @ApiResponse({ status: 200, description: 'Item updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Order item not found' })
    async updateOrderItem(
        @Param('id', ParseIntPipe) id: number,
        @Param('itemId', ParseIntPipe) itemId: number,
        @Body() updateItemDto: UpdateOrderItemDto,
    ) {
        return this.orderService.updateOrderItem(id, itemId, updateItemDto);
    }

    @Delete(':id/items/:itemId')
    @ApiOperation({ summary: 'Remove item from order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiParam({ name: 'itemId', description: 'Order item ID' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Item removed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Order item not found' })
    async removeOrderItem(
        @Param('id', ParseIntPipe) id: number,
        @Param('itemId', ParseIntPipe) itemId: number,
    ) {
        return this.orderService.removeOrderItem(id, itemId);
    }

    @Post(':id/confirm')
    @ApiOperation({ summary: 'Confirm order and send to kitchen' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Order confirmed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async confirmOrder(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.confirmOrder(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Cancel order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async cancelOrder(
        @Param('id', ParseIntPipe) id: number,
        @Body() cancelDto: CancelOrderDto,
    ) {
        return this.orderService.cancelOrder(id, cancelDto);
    }
}
