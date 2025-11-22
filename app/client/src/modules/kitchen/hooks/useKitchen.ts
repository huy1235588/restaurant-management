import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { kitchenApi } from "../services";
import type { KitchenOrder, KitchenFilters } from "../types";

export const kitchenKeys = {
    all: ["kitchen-orders"] as const,
    lists: () => [...kitchenKeys.all, "list"] as const,
    list: (filters: KitchenFilters) =>
        [...kitchenKeys.lists(), filters] as const,
    details: () => [...kitchenKeys.all, "detail"] as const,
    detail: (id: number) => [...kitchenKeys.details(), id] as const,
};

export function useKitchenOrders(filters: KitchenFilters = {}) {
    return useQuery({
        queryKey: kitchenKeys.list(filters),
        queryFn: () => kitchenApi.getAll(filters),
        refetchInterval: 5000, // Auto-refresh every 5 seconds
        staleTime: 0,
    });
}

export function useKitchenOrder(id: number) {
    return useQuery({
        queryKey: kitchenKeys.detail(id),
        queryFn: () => kitchenApi.getById(id),
        enabled: !!id,
    });
}

export function useStartOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => kitchenApi.start(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            toast.success("Order started");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to start order"
            );
        },
    });
}

export function useMarkReady() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => kitchenApi.markReady(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            toast.success("Order marked as ready");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to mark order ready"
            );
        },
    });
}

export function useMarkCompleted() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => kitchenApi.markCompleted(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
            toast.success("Order completed");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to complete order"
            );
        },
    });
}
