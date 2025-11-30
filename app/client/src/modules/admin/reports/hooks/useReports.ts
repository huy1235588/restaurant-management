import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../services/reports.service';
import {
    ReportQueryParams,
    RevenueQueryParams,
    TopItemsQueryParams,
    OrdersQueryParams,
} from '../types';

/**
 * Query keys for reports
 */
export const reportKeys = {
    all: ['reports'] as const,
    overview: (params?: ReportQueryParams) => [...reportKeys.all, 'overview', params] as const,
    revenue: (params?: RevenueQueryParams) => [...reportKeys.all, 'revenue', params] as const,
    topItems: (params?: TopItemsQueryParams) => [...reportKeys.all, 'top-items', params] as const,
    paymentMethods: (params?: ReportQueryParams) => [...reportKeys.all, 'payment-methods', params] as const,
    orders: (params?: OrdersQueryParams) => [...reportKeys.all, 'orders', params] as const,
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
