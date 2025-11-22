import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { billingApi } from '../services';
import type { Bill, CreateBillDto, ApplyDiscountDto, ProcessPaymentDto, BillFilters } from '../types';

export const billingKeys = {
    all: ['bills'] as const,
    lists: () => [...billingKeys.all, 'list'] as const,
    list: (filters: BillFilters & { page?: number; limit?: number }) => [...billingKeys.lists(), filters] as const,
    details: () => [...billingKeys.all, 'detail'] as const,
    detail: (id: number) => [...billingKeys.details(), id] as const,
};

export function useBills(filters: BillFilters & { page?: number; limit?: number } = {}) {
    return useQuery({
        queryKey: billingKeys.list(filters),
        queryFn: () => billingApi.getAll(filters),
        staleTime: 30000,
    });
}

export function useBill(id: number) {
    return useQuery({
        queryKey: billingKeys.detail(id),
        queryFn: () => billingApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateBill() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateBillDto) => billingApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: billingKeys.lists() });
            toast.success('Bill created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create bill');
        },
    });
}

export function useApplyDiscount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ApplyDiscountDto }) => billingApi.applyDiscount(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: billingKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: billingKeys.lists() });
            toast.success('Discount applied successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to apply discount');
        },
    });
}

export function useProcessPayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProcessPaymentDto }) => billingApi.processPayment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: billingKeys.lists() });
            toast.success('Payment processed successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to process payment');
        },
    });
}
