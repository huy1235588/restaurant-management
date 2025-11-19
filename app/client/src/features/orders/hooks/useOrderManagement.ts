'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderApi } from '@/services/order.service';
import type {
    Order,
    CreateOrderDto,
    UpdateOrderDto,
    AddOrderItemsDto,
    OrderStatus,
    OrderReportByTable,
    OrderReportPopularItems,
    OrderReportByWaiter,
    OrderReportCustomerHistory,
} from '@/types/order';
import { PaginatedResponse } from '@/types';

// ============================================
// Query Keys
// ============================================

export const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (filters?: any) => [...orderKeys.lists(), filters] as const,
    details: () => [...orderKeys.all, 'detail'] as const,
    detail: (id: number) => [...orderKeys.details(), id] as const,
    reports: () => [...orderKeys.all, 'reports'] as const,
    reportByTable: (filters?: any) => [...orderKeys.reports(), 'table', filters] as const,
    reportPopularItems: (filters?: any) => [...orderKeys.reports(), 'popular', filters] as const,
    reportWaiterPerformance: (filters?: any) => [...orderKeys.reports(), 'waiter', filters] as const,
    reportCustomerHistory: (phone: string) => [...orderKeys.reports(), 'customer', phone] as const,
};

// ============================================
// List Orders Hook
// ============================================

export interface UseOrdersParams {
    tableId?: number;
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    enabled?: boolean;
}

export function useOrders(params?: UseOrdersParams) {
    const { enabled = true, ...filters } = params || {};

    const query = useQuery({
        queryKey: orderKeys.list(filters),
        queryFn: () => orderApi.getAll(filters),
        enabled,
        staleTime: 30000, // 30 seconds
    });

    return {
        orders: query.data?.items || [],
        pagination: query.data?.pagination,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================
// Single Order Hook
// ============================================

export function useOrder(id: number | null, enabled: boolean = true) {
    const query = useQuery({
        queryKey: orderKeys.detail(id!),
        queryFn: () => orderApi.getById(id!),
        enabled: enabled && !!id,
        staleTime: 30000,
    });

    return {
        order: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================
// Create Order Hook
// ============================================

export function useCreateOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: CreateOrderDto) => orderApi.create(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success(`Order ${data.orderNumber} created successfully`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to create order');
        },
    });

    return {
        createOrder: mutation.mutate,
        createOrderAsync: mutation.mutateAsync,
        isCreating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
    };
}

// ============================================
// Update Order Hook
// ============================================

export function useUpdateOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateOrderDto }) =>
            orderApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
            toast.success(`Order ${data.orderNumber} updated successfully`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update order');
        },
    });

    return {
        updateOrder: mutation.mutate,
        updateOrderAsync: mutation.mutateAsync,
        isUpdating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Update Order Status Hook
// ============================================

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
            orderApi.updateStatus(id, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
            toast.success(`Order status updated to ${data.status}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update order status');
        },
    });

    return {
        updateStatus: mutation.mutate,
        updateStatusAsync: mutation.mutateAsync,
        isUpdating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Cancel Order Hook
// ============================================

export function useCancelOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            orderApi.cancel(id, reason),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
            toast.success(`Order ${data.orderNumber} cancelled`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to cancel order');
        },
    });

    return {
        cancelOrder: mutation.mutate,
        cancelOrderAsync: mutation.mutateAsync,
        isCancelling: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Delete Order Hook
// ============================================

export function useDeleteOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: number) => orderApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success('Order deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to delete order');
        },
    });

    return {
        deleteOrder: mutation.mutate,
        deleteOrderAsync: mutation.mutateAsync,
        isDeleting: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Add Order Items Hook
// ============================================

export function useAddOrderItems() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: AddOrderItemsDto }) =>
            orderApi.addItems(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
            toast.success('Items added to order successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to add items to order');
        },
    });

    return {
        addItems: mutation.mutate,
        addItemsAsync: mutation.mutateAsync,
        isAdding: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Update Order Item Status Hook
// ============================================

export function useUpdateOrderItemStatus() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ orderId, itemId, status }: { orderId: number; itemId: number; status: OrderStatus }) =>
            orderApi.updateItemStatus(orderId, itemId, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
            toast.success('Item status updated');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update item status');
        },
    });

    return {
        updateItemStatus: mutation.mutate,
        updateItemStatusAsync: mutation.mutateAsync,
        isUpdating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Reports Hooks
// ============================================

export function useSalesByTable(params?: {
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
}) {
    const { enabled = true, ...filters } = params || {};

    const query = useQuery({
        queryKey: orderKeys.reportByTable(filters),
        queryFn: () => orderApi.getReportByTable(filters),
        enabled,
        staleTime: 60000, // 1 minute
    });

    return {
        salesByTable: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

export function usePopularItems(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    enabled?: boolean;
}) {
    const { enabled = true, ...filters } = params || {};

    const query = useQuery({
        queryKey: orderKeys.reportPopularItems(filters),
        queryFn: () => orderApi.getReportPopularItems(filters),
        enabled,
        staleTime: 60000,
    });

    return {
        popularItems: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useWaiterPerformance(params?: {
    startDate?: string;
    endDate?: string;
    staffId?: number;
    enabled?: boolean;
}) {
    const { enabled = true, ...filters } = params || {};

    const query = useQuery({
        queryKey: orderKeys.reportWaiterPerformance(filters),
        queryFn: () => orderApi.getReportByWaiter(filters),
        enabled,
        staleTime: 60000,
    });

    return {
        waiterPerformance: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCustomerHistory(phone: string | null, enabled: boolean = true) {
    const query = useQuery({
        queryKey: orderKeys.reportCustomerHistory(phone!),
        queryFn: () => orderApi.getReportCustomerHistory(phone!),
        enabled: enabled && !!phone,
        staleTime: 60000,
    });

    return {
        customerHistory: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
