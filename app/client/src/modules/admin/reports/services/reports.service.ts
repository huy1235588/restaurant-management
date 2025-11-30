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
} from '../types';

export const reportsApi = {
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
};
