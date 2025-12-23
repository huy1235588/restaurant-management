import axiosInstance from '@/lib/axios';
import {
    ApiResponse,
    OverviewReport,
    RevenueReport,
    TopItemsReport,
    PaymentMethodsReport,
    OrdersReport,
    ReportQueryParams,
    RevenueQueryParams,
    TopItemsQueryParams,
    OrdersQueryParams,
    DashboardQueryParams,
    DashboardApiResponse,
    ExportType,
} from '../types';

export const reportsApi = {
    /**
     * Get all dashboard reports in a single request (batch endpoint)
     * More efficient than calling individual endpoints
     */
    getDashboard: async (params?: DashboardQueryParams): Promise<DashboardApiResponse> => {
        const response = await axiosInstance.get<DashboardApiResponse>(
            '/reports/dashboard',
            { params }
        );
        return response.data;
    },

    /**
     * Get overview report with KPIs
     */
    getOverview: async (params?: ReportQueryParams): Promise<OverviewReport> => {
        const response = await axiosInstance.get<ApiResponse<OverviewReport>>(
            '/reports/overview',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get revenue report with time series data
     */
    getRevenue: async (params?: RevenueQueryParams): Promise<RevenueReport> => {
        const response = await axiosInstance.get<ApiResponse<RevenueReport>>(
            '/reports/revenue',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get top selling items report
     */
    getTopItems: async (params?: TopItemsQueryParams): Promise<TopItemsReport> => {
        const response = await axiosInstance.get<ApiResponse<TopItemsReport>>(
            '/reports/top-items',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get payment methods distribution report
     */
    getPaymentMethods: async (params?: ReportQueryParams): Promise<PaymentMethodsReport> => {
        const response = await axiosInstance.get<ApiResponse<PaymentMethodsReport>>(
            '/reports/payment-methods',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get orders analysis report
     */
    getOrders: async (params?: OrdersQueryParams): Promise<OrdersReport> => {
        const response = await axiosInstance.get<ApiResponse<OrdersReport>>(
            '/reports/orders',
            { params }
        );
        return response.data.data;
    },

    /**
     * Export report to CSV or Excel file - OPTIMIZED
     * Supports streaming for better performance
     * Triggers browser file download
     */
    exportReport: async (
        type: ExportType,
        params?: ReportQueryParams,
        format: 'csv' | 'xlsx' = 'csv'
    ): Promise<void> => {
        const response = await axiosInstance.get(`/reports/export/${type}`, {
            params: { ...params, format },
            responseType: 'blob',
        });

        // Determine MIME type based on format
        const mimeType =
            format === 'xlsx'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'text/csv;charset=utf-8;';

        // Create download link
        const blob = new Blob([response.data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        // Extract filename from Content-Disposition header or generate one
        const contentDisposition = response.headers['content-disposition'];
        let filename = `report-${type}.${format}`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }

        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
};

