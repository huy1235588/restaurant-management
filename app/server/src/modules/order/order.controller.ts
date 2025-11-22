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
import { KitchenService } from './kitchen.service';
import {
    CreateOrderDto,
    AddItemsDto,
    CancelItemDto,
    CancelOrderDto,
    UpdateOrderStatusDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { OrderStatus } from '@prisma/generated/client';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
    constructor(
        private readonly orderService: OrderService,
        private readonly kitchenService: KitchenService,
    ) {}

    @Get('count')
    @ApiOperation({ summary: 'Count orders' })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
    @ApiQuery({ name: 'tableId', required: false, type: Number })
    @ApiQuery({ name: 'staffId', required: false, type: Number })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Orders count retrieved' })
    async count(
        @Query('status') status?: OrderStatus,
        @Query('tableId') tableId?: string,
        @Query('staffId') staffId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const count = await this.orderService.countOrders({
            status,
            tableId: tableId ? parseInt(tableId) : undefined,
            staffId: staffId ? parseInt(staffId) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });

        return {
            message: 'Orders count retrieved successfully',
            data: { count },
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders with pagination and filters' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
    @ApiQuery({ name: 'tableId', required: false, type: Number })
    @ApiQuery({ name: 'staffId', required: false, type: Number })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'sortBy', required: false, type: String })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
    async getAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: OrderStatus,
        @Query('tableId') tableId?: string,
        @Query('staffId') staffId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('search') search?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    ) {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 20;

        const result = await this.orderService.getAllOrders({
            filters: {
                status,
                tableId: tableId ? parseInt(tableId) : undefined,
                staffId: staffId ? parseInt(staffId) : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                search,
            },
            pagination: {
                page: pageNum,
                limit: limitNum,
            },
            sortBy,
            sortOrder,
        });

        return {
            message: 'Orders retrieved successfully',
            ...result,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        const order = await this.orderService.getOrderById(id);

        return {
            message: 'Order retrieved successfully',
            data: order,
        };
    }

    @Post()
    @ApiOperation({ summary: 'Create new order' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Table or menu item not found' })
    async create(
        @Body() createOrderDto: CreateOrderDto,
        @Request()
        req: {
            user: { staffId: number };
        },
    ) {
        const staffId = req.user.staffId;
        const order = await this.orderService.createOrder(
            createOrderDto,
            staffId,
        );

        return {
            message: 'Order created successfully',
            data: order,
        };
    }

    @Patch(':id/items')
    @ApiOperation({ summary: 'Add items to existing order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Items added successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Order or menu item not found' })
    async addItems(
        @Param('id', ParseIntPipe) id: number,
        @Body() addItemsDto: AddItemsDto,
    ) {
        const order = await this.orderService.addItemsToOrder(id, addItemsDto);

        return {
            message: 'Items added to order successfully',
            data: order,
        };
    }

    @Delete(':id/items/:itemId')
    @ApiOperation({ summary: 'Cancel item in order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiParam({ name: 'itemId', description: 'Order item ID' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Item cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Order or item not found' })
    async cancelItem(
        @Param('id', ParseIntPipe) id: number,
        @Param('itemId', ParseIntPipe) itemId: number,
        @Body() cancelItemDto: CancelItemDto,
    ) {
        const order = await this.orderService.cancelItem(
            id,
            itemId,
            cancelItemDto,
        );

        return {
            message: 'Item cancelled successfully',
            data: order,
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Cancel entire order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async cancelOrder(
        @Param('id', ParseIntPipe) id: number,
        @Body() cancelOrderDto: CancelOrderDto,
    ) {
        const order = await this.orderService.cancelOrder(id, cancelOrderDto);

        return {
            message: 'Order cancelled successfully',
            data: order,
        };
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update order status' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: 200,
        description: 'Order status updated successfully',
    })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateOrderStatusDto,
    ) {
        const order = await this.orderService.updateOrderStatus(
            id,
            updateStatusDto,
        );

        return {
            message: 'Order status updated successfully',
            data: order,
        };
    }

    @Patch(':id/items/:itemId/serve')
    @ApiOperation({ summary: 'Mark order item as served' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiParam({ name: 'itemId', description: 'Order item ID' })
    @ApiResponse({ status: 200, description: 'Item marked as served' })
    @ApiResponse({ status: 404, description: 'Order or item not found' })
    async markItemAsServed(
        @Param('id', ParseIntPipe) id: number,
        @Param('itemId', ParseIntPipe) itemId: number,
    ) {
        const order = await this.orderService.markItemAsServed(id, itemId);

        return {
            message: 'Item marked as served successfully',
            data: order,
        };
    }

    @Get('kitchen/queue')
    @ApiOperation({ summary: 'Get kitchen queue (pending orders)' })
    @ApiResponse({
        status: 200,
        description: 'Kitchen queue retrieved successfully',
    })
    async getKitchenQueue() {
        const queue = await this.kitchenService.getKitchenQueue();

        return {
            message: 'Kitchen queue retrieved successfully',
            data: queue,
        };
    }

    @Patch('kitchen/:id/complete')
    @ApiOperation({ summary: 'Mark kitchen order as ready (done)' })
    @ApiParam({ name: 'id', description: 'Kitchen order ID' })
    @ApiResponse({
        status: 200,
        description: 'Kitchen order marked as ready',
    })
    @ApiResponse({ status: 404, description: 'Kitchen order not found' })
    async markKitchenOrderAsReady(
        @Param('id', ParseIntPipe) id: number,
        @Request()
        req: {
            user: { staffId: number };
        },
    ) {
        const staffId = req.user.staffId;
        const kitchenOrder = await this.kitchenService.markOrderAsReady(
            id,
            staffId,
        );

        return {
            message: 'Kitchen order marked as ready successfully',
            data: kitchenOrder,
        };
    }
}
