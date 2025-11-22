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
    AddItemsDto,
    CancelItemDto,
    CancelOrderDto,
    UpdateOrderStatusDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { OrderStatus } from '@prisma/generated/client';
import { ORDER_MESSAGES, ORDER_CONSTANTS } from './constants/order.constants';

/**
 * Order Controller
 * Handles all order-related HTTP requests
 * Kitchen-specific operations are handled by KitchenController
 */
@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get('count')
    @ApiOperation({
        summary: 'Count orders',
        description: 'Get total count of orders with optional filters',
    })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
    @ApiQuery({ name: 'tableId', required: false, type: Number })
    @ApiQuery({ name: 'staffId', required: false, type: Number })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiResponse({
        status: 200,
        description: ORDER_MESSAGES.SUCCESS.COUNT_RETRIEVED,
    })
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
            message: ORDER_MESSAGES.SUCCESS.COUNT_RETRIEVED,
            data: { count },
        };
    }

    @Get()
    @ApiOperation({
        summary: 'Get all orders',
        description: 'Retrieve all orders with pagination and filters',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: `Page number (default: ${ORDER_CONSTANTS.DEFAULT_PAGE})`,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: `Items per page (default: ${ORDER_CONSTANTS.DEFAULT_LIMIT})`,
    })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
    @ApiQuery({ name: 'tableId', required: false, type: Number })
    @ApiQuery({ name: 'staffId', required: false, type: Number })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'sortBy', required: false, type: String })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    @ApiResponse({
        status: 200,
        description: ORDER_MESSAGES.SUCCESS.ORDERS_RETRIEVED,
    })
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
        const pageNum = page ? parseInt(page) : ORDER_CONSTANTS.DEFAULT_PAGE;
        const limitNum = limit ? parseInt(limit) : ORDER_CONSTANTS.DEFAULT_LIMIT;

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
            message: ORDER_MESSAGES.SUCCESS.ORDERS_RETRIEVED,
            ...result,
        };
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get order by ID',
        description: 'Retrieve detailed information about a specific order',
    })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: 200,
        description: ORDER_MESSAGES.SUCCESS.ORDER_RETRIEVED,
    })
    @ApiResponse({
        status: 404,
        description: ORDER_MESSAGES.ERROR.ORDER_NOT_FOUND,
    })
    async getById(@Param('id', ParseIntPipe) id: number) {
        const order = await this.orderService.getOrderById(id);

        return {
            message: ORDER_MESSAGES.SUCCESS.ORDER_RETRIEVED,
            data: order,
        };
    }

    @Post()
    @ApiOperation({
        summary: 'Create new order',
        description: 'Create a new order for a table with items',
    })
    @ApiResponse({
        status: 201,
        description: ORDER_MESSAGES.SUCCESS.ORDER_CREATED,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({
        status: 404,
        description: 'Table or menu item not found',
    })
    @ApiResponse({
        status: 409,
        description: ORDER_MESSAGES.ERROR.TABLE_OCCUPIED,
    })
    async create(
        @Body() createOrderDto: CreateOrderDto,
        @Request() req: { user: { staffId: number } },
    ) {
        const staffId = req.user.staffId;
        const order = await this.orderService.createOrder(
            createOrderDto,
            staffId,
        );

        return {
            message: ORDER_MESSAGES.SUCCESS.ORDER_CREATED,
            data: order,
        };
    }

    @Patch(':id/items')
    @ApiOperation({
        summary: 'Add items to order',
        description: 'Add additional items to an existing order',
    })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: 200,
        description: ORDER_MESSAGES.SUCCESS.ITEMS_ADDED,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({
        status: 404,
        description: 'Order or menu item not found',
    })
    async addItems(
        @Param('id', ParseIntPipe) id: number,
        @Body() addItemsDto: AddItemsDto,
    ) {
        const order = await this.orderService.addItemsToOrder(id, addItemsDto);

        return {
            message: ORDER_MESSAGES.SUCCESS.ITEMS_ADDED,
            data: order,
        };
    }

    @Delete(':id/items/:itemId')
    @ApiOperation({
        summary: 'Cancel order item',
        description: 'Cancel a specific item in the order',
    })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiParam({ name: 'itemId', description: 'Order item ID' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: 200,
        description: ORDER_MESSAGES.SUCCESS.ITEM_CANCELLED,
    })
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
            message: ORDER_MESSAGES.SUCCESS.ITEM_CANCELLED,
            data: order,
        };
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Cancel order',
        description: 'Cancel entire order and release table',
    })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: 200,
        description: ORDER_MESSAGES.SUCCESS.ORDER_CANCELLED,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({
        status: 404,
        description: ORDER_MESSAGES.ERROR.ORDER_NOT_FOUND,
    })
    async cancelOrder(
        @Param('id', ParseIntPipe) id: number,
        @Body() cancelOrderDto: CancelOrderDto,
    ) {
        const order = await this.orderService.cancelOrder(id, cancelOrderDto);

        return {
            message: ORDER_MESSAGES.SUCCESS.ORDER_CANCELLED,
            data: order,
        };
    }

    @Patch(':id/status')
    @ApiOperation({
        summary: 'Update order status',
        description: 'Change the status of an order',
    })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: 200,
        description: ORDER_MESSAGES.SUCCESS.ORDER_STATUS_UPDATED,
    })
    @ApiResponse({
        status: 404,
        description: ORDER_MESSAGES.ERROR.ORDER_NOT_FOUND,
    })
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateOrderStatusDto,
    ) {
        const order = await this.orderService.updateOrderStatus(
            id,
            updateStatusDto,
        );

        return {
            message: ORDER_MESSAGES.SUCCESS.ORDER_STATUS_UPDATED,
            data: order,
        };
    }

    @Patch(':id/items/:itemId/serve')
    @ApiOperation({
        summary: 'Mark order item as served',
        description: 'Mark a specific item in the order as served to customer',
    })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiParam({ name: 'itemId', description: 'Order item ID' })
    @ApiResponse({
        status: 200,
        description: ORDER_MESSAGES.SUCCESS.ITEM_SERVED,
    })
    @ApiResponse({
        status: 404,
        description: 'Order or item not found',
    })
    async markItemAsServed(
        @Param('id', ParseIntPipe) id: number,
        @Param('itemId', ParseIntPipe) itemId: number,
    ) {
        const order = await this.orderService.markItemAsServed(id, itemId);

        return {
            message: ORDER_MESSAGES.SUCCESS.ITEM_SERVED,
            data: order,
        };
    }
}
