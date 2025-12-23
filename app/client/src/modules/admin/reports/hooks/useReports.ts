import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { reportsApi } from '../services/reports.service';
import {
    ReportQueryParams,
    RevenueQueryParams,
    TopItemsQueryParams,
    OrdersQueryParams,
    DashboardQueryParams,
    DashboardApiResponse,
    ExportType,
} from '../types';

/**
 * Query keys for reports
 */
export const reportKeys = {
    all: ['reports'] as const,
    dashboard: (params?: DashboardQueryParams) => [...reportKeys.all, 'dashboard', params] as const,
    overview: (params?: ReportQueryParams) => [...reportKeys.all, 'overview', params] as const,
    revenue: (params?: RevenueQueryParams) => [...reportKeys.all, 'revenue', params] as const,
    topItems: (params?: TopItemsQueryParams) => [...reportKeys.all, 'top-items', params] as const,
    paymentMethods: (params?: ReportQueryParams) => [...reportKeys.all, 'payment-methods', params] as const,
    orders: (params?: OrdersQueryParams) => [...reportKeys.all, 'orders', params] as const,
};

/**
 * Hook to fetch all dashboard reports in a single request (batch)
 * This is more efficient than calling individual hooks
 */
export const useDashboardReport = (params?: DashboardQueryParams) => {
    return useQuery({
        queryKey: reportKeys.dashboard(params),
        queryFn: () => reportsApi.getDashboard(params),
        staleTime: 60000, // 1 minute
        refetchOnWindowFocus: false,
        select: (response: DashboardApiResponse) => ({
            ...response.data,
            cached: response.cached,
            cachedAt: response.cachedAt,
        }),
    });
};

/**
 * Hook to prefetch dashboard data for common date ranges
 */
export const usePrefetchDashboard = () => {
    const queryClient = useQueryClient();

    const prefetch = useCallback(
        async (params: DashboardQueryParams) => {
            await queryClient.prefetchQuery({
                queryKey: reportKeys.dashboard(params),
                queryFn: () => reportsApi.getDashboard(params),
                staleTime: 60000,
            });
        },
        [queryClient]
    );

    return prefetch;
};

/**
 * Hook to export reports - OPTIMIZED
 * Supports CSV and Excel formats
 */
export const useExportReport = () => {
    const exportReport = useCallback(
        async (
            type: ExportType,
            params?: ReportQueryParams,
            format: 'csv' | 'xlsx' = 'csv'
        ) => {
            await reportsApi.exportReport(type, params, format);
        },
        []
    );

    return { exportReport };
};

/**
 * Hook to fetch overview report
 */
export const useOverviewReport = (params?: ReportQueryParams) => {
    return useQuery({
        queryKey: reportKeys.overview(params),
        queryFn: () => reportsApi.getOverview(params),
        staleTime: 60000, // 1 minute
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook to fetch revenue report
 */
export const useRevenueReport = (params?: RevenueQueryParams) => {
    return useQuery({
        queryKey: reportKeys.revenue(params),
        queryFn: () => reportsApi.getRevenue(params),
        staleTime: 60000,
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook to fetch top items report
 */
export const useTopItemsReport = (params?: TopItemsQueryParams) => {
    return useQuery({
        queryKey: reportKeys.topItems(params),
        queryFn: () => reportsApi.getTopItems(params),
        staleTime: 60000,
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook to fetch payment methods report
 */
export const usePaymentMethodsReport = (params?: ReportQueryParams) => {
    return useQuery({
        queryKey: reportKeys.paymentMethods(params),
        queryFn: () => reportsApi.getPaymentMethods(params),
        staleTime: 60000,
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook to fetch orders report
 */
export const useOrdersReport = (params?: OrdersQueryParams) => {
    return useQuery({
        queryKey: reportKeys.orders(params),
        queryFn: () => reportsApi.getOrders(params),
        staleTime: 60000,
        refetchOnWindowFocus: false,
    });
};
