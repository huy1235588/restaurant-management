import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
    ReportQueryDto,
    RevenueQueryDto,
    TopItemsQueryDto,
    OrdersQueryDto,
    GroupBy,
} from './dto';
import { differenceInDays } from 'date-fns';

export type ExportType = 'revenue' | 'top-items' | 'orders';

/**
 * Reports Export Service
 * Handles CSV export for reports
 */
@Injectable()
export class ReportsExportService {
    private readonly logger = new Logger(ReportsExportService.name);
    private readonly MAX_EXPORT_DAYS = 365; // 1 year limit

    constructor(private readonly reportsService: ReportsService) {}

    /**
     * Validate date range for export (max 1 year)
     */
    private validateDateRange(startDate?: string, endDate?: string): void {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = differenceInDays(end, start);

            if (days > this.MAX_EXPORT_DAYS) {
                throw new BadRequestException(
                    `Date range cannot exceed ${this.MAX_EXPORT_DAYS} days for export`,
                );
            }
        }
    }

    /**
     * Escape CSV value (handle commas, quotes, newlines)
     */
    private escapeCSVValue(value: string | number | null | undefined): string {
        if (value === null || value === undefined) {
            return '';
        }

        const stringValue = String(value);

        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
        ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
    }

    /**
     * Convert array of objects to CSV string
     */
    private arrayToCSV(
        headers: string[],
        rows: (string | number | null | undefined)[][],
    ): string {
        const headerLine = headers.map((h) => this.escapeCSVValue(h)).join(',');
        const dataLines = rows.map((row) =>
            row.map((cell) => this.escapeCSVValue(cell)).join(','),
        );

        return [headerLine, ...dataLines].join('\n');
    }

    /**
     * Generate CSV for revenue report
     */
    async generateRevenueCSV(query: RevenueQueryDto): Promise<string> {
        this.validateDateRange(query.startDate, query.endDate);

        const report = await this.reportsService.getRevenueReport(query);

        const headers = ['Date', 'Revenue (VND)', 'Orders'];
        const rows = report.data.map((point) => [
            point.date,
            point.revenue,
            point.orders,
        ]);

        // Add summary row
        rows.push([]);
        rows.push(['Total', report.total, '']);
        rows.push(['Growth (%)', report.growth, '']);

        this.logger.debug(
            `Generated revenue CSV with ${report.data.length} data points`,
        );

        return this.arrayToCSV(headers, rows);
    }

    /**
     * Generate CSV for top items report
     */
    async generateTopItemsCSV(query: TopItemsQueryDto): Promise<string> {
        this.validateDateRange(query.startDate, query.endDate);

        const report = await this.reportsService.getTopItems(query);

        const headers = [
            'Rank',
            'Item Code',
            'Item Name',
            'Category',
            'Quantity Sold',
            'Revenue (VND)',
        ];
        const rows = report.items.map((item, index) => [
            index + 1,
            item.itemCode,
            item.name,
            item.categoryName,
            item.quantity,
            item.revenue,
        ]);

        // Add summary row
        rows.push([]);
        rows.push([
            'Total',
            '',
            '',
            '',
            report.totalQuantity,
            report.totalRevenue,
        ]);

        this.logger.debug(
            `Generated top items CSV with ${report.items.length} items`,
        );

        return this.arrayToCSV(headers, rows);
    }

    /**
     * Generate CSV for orders report
     */
    async generateOrdersCSV(query: OrdersQueryDto): Promise<string> {
        this.validateDateRange(query.startDate, query.endDate);

        const report = await this.reportsService.getOrdersReport(query);

        const groupBy = query.groupBy || GroupBy.HOUR;
        const labelHeader = groupBy === GroupBy.STATUS ? 'Status' : 'Hour';

        const headers = [labelHeader, 'Order Count', 'Amount (VND)'];
        const rows = report.data.map((point) => [
            point.label,
            point.count,
            point.amount,
        ]);

        // Add summary rows
        rows.push([]);
        rows.push(['Summary', '', '']);
        rows.push(['Total Orders', report.summary.totalOrders, '']);
        rows.push(['Total Amount', '', report.summary.totalAmount]);
        rows.push(['Avg Order Value', '', report.summary.avgOrderValue]);
        if (report.summary.avgPrepTime) {
            rows.push(['Avg Prep Time (min)', report.summary.avgPrepTime, '']);
        }

        this.logger.debug(
            `Generated orders CSV with ${report.data.length} data points`,
        );

        return this.arrayToCSV(headers, rows);
    }

    /**
     * Generate CSV by export type
     */
    async generateCSV(
        type: ExportType,
        query: ReportQueryDto,
    ): Promise<{ csv: string; filename: string }> {
        const dateStr =
            query.startDate && query.endDate
                ? `${query.startDate}-to-${query.endDate}`
                : new Date().toISOString().split('T')[0];

        let csv: string;

        switch (type) {
            case 'revenue':
                csv = await this.generateRevenueCSV(query as RevenueQueryDto);
                break;
            case 'top-items':
                csv = await this.generateTopItemsCSV(query as TopItemsQueryDto);
                break;
            case 'orders':
                csv = await this.generateOrdersCSV(query as OrdersQueryDto);
                break;
        }

        const filename = `report-${type}-${dateStr}.csv`;

        return { csv, filename };
    }
}
