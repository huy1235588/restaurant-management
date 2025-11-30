import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
    ReportQueryDto,
    RevenueQueryDto,
    TopItemsQueryDto,
    OrdersQueryDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('overview')
    @Roles('admin', 'manager', 'cashier')
    @ApiOperation({ summary: 'Get overview report with KPIs' })
    @ApiResponse({
        status: 200,
        description: 'Overview report retrieved successfully',
    })
    async getOverview(@Query() query: ReportQueryDto) {
        const data = await this.reportsService.getOverview(query);
        return {
            message: 'Overview report retrieved successfully',
            data,
        };
    }

    @Get('revenue')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Get revenue report with time series data' })
    @ApiResponse({
        status: 200,
        description: 'Revenue report retrieved successfully',
    })
    async getRevenueReport(@Query() query: RevenueQueryDto) {
        const data = await this.reportsService.getRevenueReport(query);
        return {
            message: 'Revenue report retrieved successfully',
            data,
        };
    }

    @Get('top-items')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Get top selling items report' })
    @ApiResponse({
        status: 200,
        description: 'Top items report retrieved successfully',
    })
    async getTopItems(@Query() query: TopItemsQueryDto) {
        const data = await this.reportsService.getTopItems(query);
        return {
            message: 'Top items report retrieved successfully',
            data,
        };
    }

    @Get('payment-methods')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Get payment methods distribution report' })
    @ApiResponse({
        status: 200,
        description: 'Payment methods report retrieved successfully',
    })
    async getPaymentMethodsReport(@Query() query: ReportQueryDto) {
        const data = await this.reportsService.getPaymentMethodsReport(query);
        return {
            message: 'Payment methods report retrieved successfully',
            data,
        };
    }

    @Get('orders')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Get orders analysis report' })
    @ApiResponse({
        status: 200,
        description: 'Orders report retrieved successfully',
    })
    async getOrdersReport(@Query() query: OrdersQueryDto) {
        const data = await this.reportsService.getOrdersReport(query);
        return {
            message: 'Orders report retrieved successfully',
            data,
        };
    }
}
