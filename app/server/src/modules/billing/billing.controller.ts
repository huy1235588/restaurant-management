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
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import {
    CreateBillDto,
    ApplyDiscountDto,
    ProcessPaymentDto,
    BillFiltersDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import {
    BILLING_CONSTANTS,
    BILLING_MESSAGES,
} from './constants/billing.constants';

@ApiTags('billing')
@Controller('bills')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin', 'manager', 'waiter', 'cashier')
    @ApiOperation({ summary: 'Get all bills with filters (admin/manager/waiter/cashier only)' })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: `Page number (default: ${BILLING_CONSTANTS.DEFAULT_PAGE})`,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: `Items per page (default: ${BILLING_CONSTANTS.DEFAULT_LIMIT})`,
    })
    @ApiResponse({
        status: 200,
        description: BILLING_MESSAGES.SUCCESS.BILLS_RETRIEVED,
    })
    async getAllBills(@Query() filters: BillFiltersDto) {
        const { page = 1, limit = 20, ...filterData } = filters;
        const skip = (page - 1) * limit;

        const result = await this.billingService.getAllBills({
            filters: filterData,
            skip,
            take: limit,
        });

        return {
            message: BILLING_MESSAGES.SUCCESS.BILLS_RETRIEVED,
            ...result,
        };
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'manager', 'waiter', 'cashier')
    @ApiOperation({ summary: 'Get bill by ID (admin/manager/waiter/cashier only)' })
    @ApiParam({ name: 'id', description: 'Bill ID' })
    @ApiResponse({
        status: 200,
        description: BILLING_MESSAGES.SUCCESS.BILL_RETRIEVED,
    })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({
        status: 404,
        description: BILLING_MESSAGES.ERROR.BILL_NOT_FOUND,
    })
    async getBillById(@Param('id', ParseIntPipe) id: number) {
        const bill = await this.billingService.getBillById(id);

        return {
            message: BILLING_MESSAGES.SUCCESS.BILL_RETRIEVED,
            data: bill,
        };
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'manager', 'waiter', 'cashier')
    @ApiOperation({ summary: 'Create bill from order (admin/manager/waiter/cashier only)' })
    @ApiResponse({
        status: 201,
        description: BILLING_MESSAGES.SUCCESS.BILL_CREATED,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({
        status: 404,
        description: BILLING_MESSAGES.ERROR.ORDER_NOT_FOUND,
    })
    async createBill(
        @Body() createBillDto: CreateBillDto,
        @Request() req: { user?: { staffId?: number } },
    ) {
        const staffId = req.user?.staffId;
        const bill = await this.billingService.createBill(
            createBillDto,
            staffId,
        );

        return {
            message: BILLING_MESSAGES.SUCCESS.BILL_CREATED,
            data: bill,
        };
    }

    @Patch(':id/discount')
    @UseGuards(RolesGuard)
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Apply discount to bill (admin/manager only)' })
    @ApiParam({ name: 'id', description: 'Bill ID' })
    @ApiResponse({
        status: 200,
        description: BILLING_MESSAGES.SUCCESS.DISCOUNT_APPLIED,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager only' })
    @ApiResponse({
        status: 404,
        description: BILLING_MESSAGES.ERROR.BILL_NOT_FOUND,
    })
    async applyDiscount(
        @Param('id', ParseIntPipe) id: number,
        @Body() discountDto: ApplyDiscountDto,
        @Request() req: { user?: { staffId?: number } },
    ) {
        const userId = req.user?.staffId;
        const bill = await this.billingService.applyDiscount(
            id,
            discountDto,
            userId,
        );

        return {
            message: BILLING_MESSAGES.SUCCESS.DISCOUNT_APPLIED,
            data: bill,
        };
    }

    @Post(':id/payment')
    @UseGuards(RolesGuard)
    @Roles('admin', 'manager', 'cashier')
    @ApiOperation({ summary: 'Process payment for bill (admin/manager/cashier only)' })
    @ApiParam({ name: 'id', description: 'Bill ID' })
    @ApiResponse({
        status: 200,
        description: BILLING_MESSAGES.SUCCESS.PAYMENT_PROCESSED,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager/Cashier only' })
    @ApiResponse({
        status: 404,
        description: BILLING_MESSAGES.ERROR.BILL_NOT_FOUND,
    })
    async processPayment(
        @Param('id', ParseIntPipe) id: number,
        @Body() paymentDto: ProcessPaymentDto,
        @Request() req: { user?: { staffId?: number } },
    ) {
        const staffId = req.user?.staffId;
        const result = await this.billingService.processPayment(
            id,
            paymentDto,
            staffId,
        );

        return {
            message: BILLING_MESSAGES.SUCCESS.PAYMENT_PROCESSED,
            data: result,
        };
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Void/delete bill (admin only)' })
    @ApiParam({ name: 'id', description: 'Bill ID' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: 200,
        description: BILLING_MESSAGES.SUCCESS.BILL_VOIDED,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    @ApiResponse({
        status: 404,
        description: BILLING_MESSAGES.ERROR.BILL_NOT_FOUND,
    })
    async voidBill(
        @Param('id', ParseIntPipe) id: number,
        @Body('reason') reason: string,
        @Request() req: { user?: { staffId?: number } },
    ) {
        const userId = req.user?.staffId;
        await this.billingService.voidBill(id, reason, userId);

        return {
            message: BILLING_MESSAGES.SUCCESS.BILL_VOIDED,
        };
    }
}
