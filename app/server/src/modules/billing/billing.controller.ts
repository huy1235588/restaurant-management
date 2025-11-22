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

@ApiTags('billing')
@Controller('bills')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Get()
    @ApiOperation({ summary: 'Get all bills with filters' })
    @ApiResponse({ status: 200, description: 'Bills retrieved successfully' })
    async getAllBills(@Query() filters: BillFiltersDto) {
        const { page = 1, limit = 20, ...filterData } = filters;
        const skip = (page - 1) * limit;

        return this.billingService.getAllBills({
            filters: filterData,
            skip,
            take: limit,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get bill by ID' })
    @ApiParam({ name: 'id', description: 'Bill ID' })
    @ApiResponse({ status: 200, description: 'Bill retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Bill not found' })
    async getBillById(@Param('id', ParseIntPipe) id: number) {
        return this.billingService.getBillById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create bill from order' })
    @ApiResponse({ status: 201, description: 'Bill created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async createBill(@Body() createBillDto: CreateBillDto, @Request() req) {
        const staffId = req.user?.staffId;
        return this.billingService.createBill(createBillDto, staffId);
    }

    @Patch(':id/discount')
    @ApiOperation({ summary: 'Apply discount to bill' })
    @ApiParam({ name: 'id', description: 'Bill ID' })
    @ApiResponse({ status: 200, description: 'Discount applied successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Bill not found' })
    async applyDiscount(
        @Param('id', ParseIntPipe) id: number,
        @Body() discountDto: ApplyDiscountDto,
        @Request() req,
    ) {
        const userId = req.user?.staffId;
        return this.billingService.applyDiscount(id, discountDto, userId);
    }

    @Post(':id/payment')
    @ApiOperation({ summary: 'Process payment for bill' })
    @ApiParam({ name: 'id', description: 'Bill ID' })
    @ApiResponse({ status: 200, description: 'Payment processed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Bill not found' })
    async processPayment(
        @Param('id', ParseIntPipe) id: number,
        @Body() paymentDto: ProcessPaymentDto,
        @Request() req,
    ) {
        const staffId = req.user?.staffId;
        return this.billingService.processPayment(id, paymentDto, staffId);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Void/delete bill (admin only)' })
    @ApiParam({ name: 'id', description: 'Bill ID' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Bill voided successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    @ApiResponse({ status: 404, description: 'Bill not found' })
    async voidBill(
        @Param('id', ParseIntPipe) id: number,
        @Body('reason') reason: string,
        @Request() req,
    ) {
        const userId = req.user?.staffId;
        return this.billingService.voidBill(id, reason, userId);
    }
}
