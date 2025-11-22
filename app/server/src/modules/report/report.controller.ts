import {
    Controller,
    Get,
    Query,
    Res,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @Get('revenue/daily')
    @ApiOperation({ summary: 'Get daily revenue report' })
    @ApiQuery({ name: 'startDate', required: true, type: String })
    @ApiQuery({ name: 'endDate', required: true, type: String })
    @ApiResponse({ status: 200, description: 'Daily revenue report retrieved' })
    async getDailyRevenue(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        const data = await this.reportService.getDailyRevenue(
            new Date(startDate),
            new Date(endDate),
        );

        return {
            message: 'Daily revenue report retrieved successfully',
            data,
        };
    }

    @Get('revenue/monthly')
    @ApiOperation({ summary: 'Get monthly revenue summary' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    @ApiQuery({ name: 'month', required: true, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Monthly revenue summary retrieved',
    })
    async getMonthlyRevenue(
        @Query('year') year: string,
        @Query('month') month: string,
    ) {
        const data = await this.reportService.getMonthlyRevenue(
            parseInt(year),
            parseInt(month),
        );

        return {
            message: 'Monthly revenue summary retrieved successfully',
            data,
        };
    }

    @Get('best-sellers')
    @ApiOperation({ summary: 'Get best-selling items report' })
    @ApiQuery({ name: 'startDate', required: true, type: String })
    @ApiQuery({ name: 'endDate', required: true, type: String })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Best sellers report retrieved' })
    async getBestSellers(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('limit') limit?: string,
    ) {
        const data = await this.reportService.getBestSellers(
            new Date(startDate),
            new Date(endDate),
            limit ? parseInt(limit) : 20,
        );

        return {
            message: 'Best sellers report retrieved successfully',
            data,
        };
    }

    @Get('revenue/daily/export')
    @ApiOperation({ summary: 'Export daily revenue report to CSV' })
    @ApiQuery({ name: 'startDate', required: true, type: String })
    @ApiQuery({ name: 'endDate', required: true, type: String })
    @ApiResponse({ status: 200, description: 'CSV file generated' })
    async exportDailyRevenue(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Res() res: Response,
    ) {
        const data = await this.reportService.getDailyRevenue(
            new Date(startDate),
            new Date(endDate),
        );

        const csv = await this.reportService.exportToCSV(data, [
            { key: 'date', header: 'Date' },
            { key: 'revenue', header: 'Revenue' },
            { key: 'orderCount', header: 'Order Count' },
        ]);

        res.header('Content-Type', 'text/csv');
        res.header(
            'Content-Disposition',
            `attachment; filename="daily-revenue-${startDate}-${endDate}.csv"`,
        );
        res.status(HttpStatus.OK).send(csv);
    }

    @Get('best-sellers/export')
    @ApiOperation({ summary: 'Export best sellers report to CSV' })
    @ApiQuery({ name: 'startDate', required: true, type: String })
    @ApiQuery({ name: 'endDate', required: true, type: String })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'CSV file generated' })
    async exportBestSellers(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('limit') limit: string = '20',
        @Res() res: Response,
    ) {
        const data = await this.reportService.getBestSellers(
            new Date(startDate),
            new Date(endDate),
            parseInt(limit),
        );

        const csv = await this.reportService.exportToCSV(data, [
            { key: 'itemCode', header: 'Item Code' },
            { key: 'itemName', header: 'Item Name' },
            { key: 'categoryName', header: 'Category' },
            { key: 'quantitySold', header: 'Quantity Sold' },
            { key: 'revenue', header: 'Revenue' },
        ]);

        res.header('Content-Type', 'text/csv');
        res.header(
            'Content-Disposition',
            `attachment; filename="best-sellers-${startDate}-${endDate}.csv"`,
        );
        res.status(HttpStatus.OK).send(csv);
    }
}
