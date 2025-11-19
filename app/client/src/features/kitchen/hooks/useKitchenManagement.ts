'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { kitchenManagementApi } from '@/services/kitchen-management.service';
import type {
    KitchenOrder,
    KitchenOrderStatus,
    KitchenStation,
    CreateKitchenOrderDto,
    UpdateKitchenOrderDto,
    AssignChefDto,
    AssignStationDto,
    UpdateStatusDto,
    HandleCancellationDto,
    KitchenStats,
} from '@/types/kitchen';
import { PaginatedResponse } from '@/types';

// ============================================
// Query Keys
// ============================================

export const kitchenKeys = {
    all: ['kitchen'] as const,
    lists: () => [...kitchenKeys.all, 'list'] as const,
    list: (filters?: any) => [...kitchenKeys.lists(), filters] as const,
    pending: () => [...kitchenKeys.all, 'pending'] as const,
    details: () => [...kitchenKeys.all, 'detail'] as const,
    detail: (id: number) => [...kitchenKeys.details(), id] as const,
    byChef: (staffId: number) => [...kitchenKeys.all, 'chef', staffId] as const,
    stats: () => [...kitchenKeys.all, 'stats'] as const,
    stations: () => [...kitchenKeys.all, 'stations'] as const,
};

// ============================================
// List Kitchen Orders Hook
// ============================================

export interface UseKitchenOrdersParams {
    status?: KitchenOrderStatus;
    stationId?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    enabled?: boolean;
}

export function useKitchenOrders(params?: UseKitchenOrdersParams) {
    const { enabled = true, ...filters } = params || {};

    const query = useQuery({
        queryKey: kitchenKeys.list(filters),
        queryFn: () => kitchenManagementApi.getAll(filters),
        enabled,
        refetchInterval: 10000, // Auto-refresh every 10 seconds for KDS
        staleTime: 5000,
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
// Pending Kitchen Orders Hook (for KDS)
// ============================================

export function usePendingKitchenOrders(enabled: boolean = true) {
    const query = useQuery({
        queryKey: kitchenKeys.pending(),
        queryFn: () => kitchenManagementApi.getPending(),
        enabled,
        refetchInterval: 5000, // Auto-refresh every 5 seconds
        staleTime: 2000,
    });

    return {
        orders: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================
// Single Kitchen Order Hook
// ============================================

export function useKitchenOrder(id: number | null, enabled: boolean = true) {
    const query = useQuery({
        queryKey: kitchenKeys.detail(id!),
        queryFn: () => kitchenManagementApi.getById(id!),
        enabled: enabled && !!id,
        staleTime: 10000,
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
// Kitchen Orders by Chef Hook
// ============================================

export function useKitchenOrdersByChef(staffId: number | null, enabled: boolean = true) {
    const query = useQuery({
        queryKey: kitchenKeys.byChef(staffId!),
        queryFn: () => kitchenManagementApi.getByChef(staffId!),
        enabled: enabled && !!staffId,
        refetchInterval: 10000,
        staleTime: 5000,
    });

    return {
        orders: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================
// Create Kitchen Order Hook
// ============================================

export function useCreateKitchenOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: CreateKitchenOrderDto) => kitchenManagementApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.stats() });
            toast.success('Kitchen order created successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to create kitchen order');
        },
    });

    return {
        createOrder: mutation.mutate,
        createOrderAsync: mutation.mutateAsync,
        isCreating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Update Kitchen Order Hook
// ============================================

export function useUpdateKitchenOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateKitchenOrderDto }) =>
            kitchenManagementApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.stats() });
            toast.success('Kitchen order updated successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update kitchen order');
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
// Start Preparing Hook
// ============================================

export function useStartPreparing() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, staffId }: { id: number; staffId?: number }) =>
            kitchenManagementApi.startPreparing(id, staffId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.stats() });
            toast.success('Started preparing order');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to start preparing');
        },
    });

    return {
        startPreparing: mutation.mutate,
        startPreparingAsync: mutation.mutateAsync,
        isStarting: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Complete Order Hook
// ============================================

export function useCompleteKitchenOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: number) => kitchenManagementApi.complete(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.stats() });
            toast.success('Order marked as ready!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to complete order');
        },
    });

    return {
        completeOrder: mutation.mutate,
        completeOrderAsync: mutation.mutateAsync,
        isCompleting: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Update Status Hook
// ============================================

export function useUpdateKitchenStatus() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: KitchenOrderStatus }) =>
            kitchenManagementApi.updateStatus(id, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.stats() });
            toast.success(`Status updated to ${data.status}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update status');
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
// Cancel Kitchen Order Hook
// ============================================

export function useHandleCancellation() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, accepted, reason }: { id: number; accepted: boolean; reason?: string }) =>
            kitchenManagementApi.handleCancellation(id, accepted, reason),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.stats() });
            toast.success(variables.accepted ? 'Cancellation accepted' : 'Cancellation rejected');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to handle cancellation');
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
// Update Priority Hook
// ============================================

export function useUpdatePriority() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, priority }: { id: number; priority: number }) =>
            kitchenManagementApi.updatePriority(id, priority),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
            toast.success(`Priority updated to ${data.priority}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update priority');
        },
    });

    return {
        updatePriority: mutation.mutate,
        updatePriorityAsync: mutation.mutateAsync,
        isUpdating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Assign Chef Hook
// ============================================

export function useAssignChef() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, staffId }: { id: number; staffId: number }) =>
            kitchenManagementApi.assignChef(id, staffId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
            toast.success('Chef assigned successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to assign chef');
        },
    });

    return {
        assignChef: mutation.mutate,
        assignChefAsync: mutation.mutateAsync,
        isAssigning: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Assign Station Hook
// ============================================

export function useAssignStation() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, stationId }: { id: number; stationId: number }) =>
            kitchenManagementApi.assignStation(id, stationId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
            queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
            toast.success('Station assigned successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to assign station');
        },
    });

    return {
        assignStation: mutation.mutate,
        assignStationAsync: mutation.mutateAsync,
        isAssigning: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}

// ============================================
// Kitchen Stats Hook
// ============================================

export function useKitchenStats(enabled: boolean = true) {
    const query = useQuery({
        queryKey: kitchenKeys.stats(),
        queryFn: () => kitchenManagementApi.getStats(),
        enabled,
        refetchInterval: 30000, // Refresh every 30 seconds
        staleTime: 15000,
    });

    return {
        stats: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================
// Kitchen Stations Hook
// ============================================

export function useKitchenStations(enabled: boolean = true) {
    const query = useQuery({
        queryKey: kitchenKeys.stations(),
        queryFn: () => kitchenManagementApi.getStations(),
        enabled,
        staleTime: 300000, // 5 minutes (stations don't change often)
    });

    return {
        stations: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================
// Utility Hook - Order Timer
// ============================================

export function useOrderTimer(createdAt: string | Date) {
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    useEffect(() => {
        const calculateElapsed = () => {
            const created = new Date(createdAt);
            const now = new Date();
            const diffMs = now.getTime() - created.getTime();
            const diffMinutes = Math.floor(diffMs / 60000);
            setElapsedMinutes(diffMinutes);
        };

        calculateElapsed();
        const interval = setInterval(calculateElapsed, 1000); // Update every second

        return () => clearInterval(interval);
    }, [createdAt]);

    const getColorClass = useCallback(() => {
        if (elapsedMinutes < 10) return 'text-green-600';
        if (elapsedMinutes < 20) return 'text-yellow-600';
        return 'text-red-600';
    }, [elapsedMinutes]);

    const isOverdue = elapsedMinutes > 20;

    return {
        elapsedMinutes,
        colorClass: getColorClass(),
        isOverdue,
    };
}
