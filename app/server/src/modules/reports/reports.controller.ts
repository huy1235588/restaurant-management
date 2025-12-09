import {
    Controller,
    Get,
    Query,
    UseGuards,
    Param,
    Res,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportsCacheService } from './reports-cache.service';
import { ReportsExportService, ExportType } from './reports-export.service';
import {
    ReportQueryDto,
    RevenueQueryDto,
    TopItemsQueryDto,
    OrdersQueryDto,
    DashboardQueryDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { format, startOfDay, endOfDay } from 'date-fns';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly reportsCacheService: ReportsCacheService,
        private readonly reportsExportService: ReportsExportService,
    ) {}

    /**
     * Get all dashboard reports in a single request (batch endpoint)
     * Supports caching for improved performance
     */
    @Get('dashboard')
    @Roles('admin', 'manager')
    @ApiOperation({
        summary: 'Get all dashboard reports in a single request',
        description:
            'Fetches overview, revenue, top items, payment methods, and orders reports in one call. Supports caching.',
    })
    @ApiResponse({
        status: 200,
        description: 'Dashboard reports retrieved successfully',
    })
    async getDashboard(@Query() query: DashboardQueryDto) {
        const now = new Date();
        const startDate =
            query.startDate || format(startOfDay(now), 'yyyy-MM-dd');
        const endDate = query.endDate || format(endOfDay(now), 'yyyy-MM-dd');

        // Check cache first (unless refresh is requested)
        if (!query.refresh) {
            const cached = await this.reportsCacheService.getCachedDashboard(
                startDate,
                endDate,
            );

            if (cached) {
                return {
                    message: 'Dashboard reports retrieved successfully',
                    data: cached.data,
                    cached: true,
                    cachedAt: cached.cachedAt,
                };
            }
        }

        // Fetch fresh data
        const data = await this.reportsService.getDashboard({
            startDate,
            endDate,
        });

        // Cache the response
        await this.reportsCacheService.setCachedDashboard(
            startDate,
            endDate,
            data,
        );

        return {
            message: 'Dashboard reports retrieved successfully',
            data,
            cached: false,
        };
    }

    /**
     * Export report to CSV file
     */
    @Get('export/:type')
    @Roles('admin', 'manager')
    @ApiOperation({
        summary: 'Export report to CSV',
        description: 'Downloads a CSV file for the specified report type',
    })
    @ApiParam({
        name: 'type',
        enum: ['revenue', 'top-items', 'orders'],
        description: 'Type of report to export',
    })
    @ApiResponse({
        status: 200,
        description: 'CSV file downloaded successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid export type or date range too large',
    })
    async exportReport(
        @Param('type') type: string,
        @Query() query: ReportQueryDto,
        @Res() res: Response,
    ) {
        // Validate export type
        const validTypes: ExportType[] = ['revenue', 'top-items', 'orders'];
        if (!validTypes.includes(type as ExportType)) {
            throw new BadRequestException(
                `Invalid export type. Must be one of: ${validTypes.join(', ')}`,
            );
        }

        const { csv, filename } = await this.reportsExportService.generateCSV(
            type as ExportType,
            query,
        );

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}"`,
        );
        res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf-8'));

        // Add BOM for Excel compatibility with UTF-8
        const bom = '\uFEFF';
        res.send(bom + csv);
    }

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
