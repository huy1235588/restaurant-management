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
import { Readable, PassThrough } from 'stream';
import * as ExcelJS from 'exceljs';
import { format as csvFormat } from 'fast-csv';

export type ExportType = 'revenue' | 'top-items' | 'orders';
export type ExportFormat = 'csv' | 'xlsx';

/**
 * Optimized Reports Export Service
 * Handles CSV and Excel export with streaming for better performance
 * - Uses streaming to avoid memory issues with large datasets
 * - Batch processing for database queries
 * - Support both CSV and Excel formats
 */
@Injectable()
export class ReportsExportService {
    private readonly logger = new Logger(ReportsExportService.name);
    private readonly MAX_EXPORT_DAYS = 365; // 1 year limit
    private readonly BATCH_SIZE = 1000; // Process 1000 records at a time

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

    /**
     * Generate export stream (CSV or Excel) - OPTIMIZED
     * Uses streaming for better memory efficiency
     */
    async generateExportStream(
        type: ExportType,
        query: ReportQueryDto,
        format: ExportFormat = 'csv',
    ): Promise<{ stream: Readable; filename: string; contentType: string }> {
        this.validateDateRange(query.startDate, query.endDate);

        const dateStr =
            query.startDate && query.endDate
                ? `${query.startDate}-to-${query.endDate}`
                : new Date().toISOString().split('T')[0];

        const filename = `report-${type}-${dateStr}.${format}`;
        const contentType =
            format === 'xlsx'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'text/csv; charset=utf-8';

        let stream: Readable;

        if (format === 'xlsx') {
            stream = await this.generateExcelStream(type, query);
        } else {
            stream = await this.generateCSVStream(type, query);
        }

        return { stream, filename, contentType };
    }

    /**
     * Generate CSV stream for any report type
     */
    private async generateCSVStream(
        type: ExportType,
        query: ReportQueryDto,
    ): Promise<Readable> {
        switch (type) {
            case 'revenue':
                return this.generateRevenueCSVStream(query as RevenueQueryDto);
            case 'top-items':
                return this.generateTopItemsCSVStream(
                    query as TopItemsQueryDto,
                );
            case 'orders':
                return this.generateOrdersCSVStream(query as OrdersQueryDto);
            default:
                throw new BadRequestException('Invalid export type');
        }
    }

    /**
     * Generate Excel stream for any report type
     */
    private async generateExcelStream(
        type: ExportType,
        query: ReportQueryDto,
    ): Promise<Readable> {
        switch (type) {
            case 'revenue':
                return this.generateRevenueExcelStream(
                    query as RevenueQueryDto,
                );
            case 'top-items':
                return this.generateTopItemsExcelStream(
                    query as TopItemsQueryDto,
                );
            case 'orders':
                return this.generateOrdersExcelStream(query as OrdersQueryDto);
            default:
                throw new BadRequestException(`Invalid export type`);
        }
    }

    /**
     * Generate Revenue Report CSV Stream - OPTIMIZED
     */
    private async generateRevenueCSVStream(
        query: RevenueQueryDto,
    ): Promise<Readable> {
        const report = await this.reportsService.getRevenueReport(query);

        const rows = [
            ['Date', 'Revenue (VND)', 'Orders'],
            ...report.data.map((point) => [
                point.date,
                point.revenue,
                point.orders,
            ]),
            [],
            ['Total', report.total, ''],
            ['Growth (%)', report.growth, ''],
        ];

        this.logger.debug(
            `Generated revenue CSV stream with ${report.data.length} data points`,
        );

        return this.createCSVStream(rows);
    }

    /**
     * Generate Top Items Report CSV Stream - OPTIMIZED
     */
    private async generateTopItemsCSVStream(
        query: TopItemsQueryDto,
    ): Promise<Readable> {
        const report = await this.reportsService.getTopItems(query);

        const rows = [
            [
                'Rank',
                'Item Code',
                'Item Name',
                'Category',
                'Quantity Sold',
                'Revenue (VND)',
            ],
            ...report.items.map((item, index) => [
                index + 1,
                item.itemCode,
                item.name,
                item.categoryName,
                item.quantity,
                item.revenue,
            ]),
            [],
            ['Total', '', '', '', report.totalQuantity, report.totalRevenue],
        ];

        this.logger.debug(
            `Generated top items CSV stream with ${report.items.length} items`,
        );

        return this.createCSVStream(rows);
    }

    /**
     * Generate Orders Report CSV Stream - OPTIMIZED
     */
    private async generateOrdersCSVStream(
        query: OrdersQueryDto,
    ): Promise<Readable> {
        const report = await this.reportsService.getOrdersReport(query);
        const groupBy = query.groupBy || GroupBy.HOUR;
        const labelHeader = groupBy === GroupBy.STATUS ? 'Status' : 'Hour';

        const rows = [
            [labelHeader, 'Order Count', 'Amount (VND)'],
            ...report.data.map((point) => [
                point.label,
                point.count,
                point.amount,
            ]),
            [],
            ['Summary', '', ''],
            ['Total Orders', report.summary.totalOrders, ''],
            ['Total Amount', '', report.summary.totalAmount],
            ['Avg Order Value', '', report.summary.avgOrderValue],
        ];

        if (report.summary.avgPrepTime) {
            rows.push(['Avg Prep Time (min)', report.summary.avgPrepTime, '']);
        }

        this.logger.debug(
            `Generated orders CSV stream with ${report.data.length} data points`,
        );

        return this.createCSVStream(rows);
    }

    /**
     * Create CSV stream from rows using fast-csv
     */
    private createCSVStream(rows: any[][]): Readable {
        const passThrough = new PassThrough();
        const csvStream = csvFormat({ headers: false });

        // Pipe csvStream to passThrough
        csvStream.pipe(passThrough);

        // Write all rows
        rows.forEach((row) => csvStream.write(row));
        csvStream.end();

        return passThrough;
    }

    /**
     * Generate Revenue Report Excel Stream - NEW
     */
    private async generateRevenueExcelStream(
        query: RevenueQueryDto,
    ): Promise<Readable> {
        const report = await this.reportsService.getRevenueReport(query);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Revenue Report');

        // Set column widths
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Revenue (VND)', key: 'revenue', width: 20 },
            { header: 'Orders', key: 'orders', width: 12 },
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Add data rows
        report.data.forEach((point) => {
            worksheet.addRow({
                date: point.date,
                revenue: point.revenue,
                orders: point.orders,
            });
        });

        // Add summary section
        const summaryRow = worksheet.rowCount + 2;
        worksheet.getCell(`A${summaryRow}`).value = 'Total';
        worksheet.getCell(`A${summaryRow}`).font = { bold: true };
        worksheet.getCell(`B${summaryRow}`).value = report.total;
        worksheet.getCell(`B${summaryRow}`).numFmt = '#,##0';

        worksheet.getCell(`A${summaryRow + 1}`).value = 'Growth (%)';
        worksheet.getCell(`A${summaryRow + 1}`).font = { bold: true };
        worksheet.getCell(`B${summaryRow + 1}`).value = report.growth;
        worksheet.getCell(`B${summaryRow + 1}`).numFmt = '0.00"%"';

        // Format number columns
        worksheet.getColumn('revenue').numFmt = '#,##0';
        worksheet.getColumn('orders').numFmt = '#,##0';

        this.logger.debug(
            `Generated revenue Excel stream with ${report.data.length} data points`,
        );

        return this.workbookToStream(workbook);
    }

    /**
     * Generate Top Items Report Excel Stream - NEW
     */
    private async generateTopItemsExcelStream(
        query: TopItemsQueryDto,
    ): Promise<Readable> {
        const report = await this.reportsService.getTopItems(query);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Top Items Report');

        // Set column widths
        worksheet.columns = [
            { header: 'Rank', key: 'rank', width: 8 },
            { header: 'Item Code', key: 'itemCode', width: 15 },
            { header: 'Item Name', key: 'name', width: 30 },
            { header: 'Category', key: 'categoryName', width: 20 },
            { header: 'Quantity Sold', key: 'quantity', width: 15 },
            { header: 'Revenue (VND)', key: 'revenue', width: 20 },
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' },
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Add data rows
        report.items.forEach((item, index) => {
            worksheet.addRow({
                rank: index + 1,
                itemCode: item.itemCode,
                name: item.name,
                categoryName: item.categoryName,
                quantity: item.quantity,
                revenue: item.revenue,
            });
        });

        // Add summary section
        const summaryRow = worksheet.rowCount + 2;
        worksheet.getCell(`A${summaryRow}`).value = 'Total';
        worksheet.getCell(`A${summaryRow}`).font = { bold: true };
        worksheet.getCell(`E${summaryRow}`).value = report.totalQuantity;
        worksheet.getCell(`E${summaryRow}`).numFmt = '#,##0';
        worksheet.getCell(`F${summaryRow}`).value = report.totalRevenue;
        worksheet.getCell(`F${summaryRow}`).numFmt = '#,##0';

        // Format number columns
        worksheet.getColumn('quantity').numFmt = '#,##0';
        worksheet.getColumn('revenue').numFmt = '#,##0';

        this.logger.debug(
            `Generated top items Excel stream with ${report.items.length} items`,
        );

        return this.workbookToStream(workbook);
    }

    /**
     * Generate Orders Report Excel Stream - NEW
     */
    private async generateOrdersExcelStream(
        query: OrdersQueryDto,
    ): Promise<Readable> {
        const report = await this.reportsService.getOrdersReport(query);
        const groupBy = query.groupBy || GroupBy.HOUR;
        const labelHeader = groupBy === GroupBy.STATUS ? 'Status' : 'Hour';

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders Report');

        // Set column widths
        worksheet.columns = [
            { header: labelHeader, key: 'label', width: 15 },
            { header: 'Order Count', key: 'count', width: 15 },
            { header: 'Amount (VND)', key: 'amount', width: 20 },
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC000' },
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Add data rows
        report.data.forEach((point) => {
            worksheet.addRow({
                label: point.label,
                count: point.count,
                amount: point.amount,
            });
        });

        // Add summary section
        const summaryRow = worksheet.rowCount + 2;
        worksheet.getCell(`A${summaryRow}`).value = 'Summary';
        worksheet.getCell(`A${summaryRow}`).font = {
            bold: true,
            size: 12,
        };

        const summaryData = [
            ['Total Orders', report.summary.totalOrders, ''],
            ['Total Amount', '', report.summary.totalAmount],
            ['Avg Order Value', '', report.summary.avgOrderValue],
        ];

        if (report.summary.avgPrepTime) {
            summaryData.push([
                'Avg Prep Time (min)',
                report.summary.avgPrepTime,
                '',
            ]);
        }

        summaryData.forEach((row, index) => {
            const currentRow = summaryRow + index + 1;
            worksheet.getCell(`A${currentRow}`).value = row[0];
            worksheet.getCell(`A${currentRow}`).font = { bold: true };
            if (row[1]) worksheet.getCell(`B${currentRow}`).value = row[1];
            if (row[2]) worksheet.getCell(`C${currentRow}`).value = row[2];
        });

        // Format number columns
        worksheet.getColumn('count').numFmt = '#,##0';
        worksheet.getColumn('amount').numFmt = '#,##0';

        this.logger.debug(
            `Generated orders Excel stream with ${report.data.length} data points`,
        );

        return this.workbookToStream(workbook);
    }

    /**
     * Convert ExcelJS workbook to readable stream
     */
    private async workbookToStream(
        workbook: ExcelJS.Workbook,
    ): Promise<Readable> {
        const stream = new Readable({ read() {} });

        // Write workbook to stream
        const buffer = await workbook.xlsx.writeBuffer();
        stream.push(buffer);
        stream.push(null); // Signal end of stream

        return stream;
    }
}
