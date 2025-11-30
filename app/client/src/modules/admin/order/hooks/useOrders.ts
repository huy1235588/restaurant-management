import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../services/order.service";
import { OrderFilterOptions } from "../types";

/**
 * React Query keys for orders
 */
export const orderKeys = {
    all: ["orders"] as const,
    lists: () => [...orderKeys.all, "list"] as const,
    list: (filters?: OrderFilterOptions) =>
        [...orderKeys.lists(), filters] as const,
    details: () => [...orderKeys.all, "detail"] as const,
    detail: (id: number) => [...orderKeys.details(), id] as const,
    count: (filters?: Partial<OrderFilterOptions>) =>
        [...orderKeys.all, "count", filters] as const,
};

/**
 * Hook to fetch all orders with pagination and filters
 */
export const useOrders = (filters?: OrderFilterOptions) => {
    return useQuery({
        queryKey: orderKeys.list(filters),
        queryFn: () => orderApi.getAll(filters),
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: true,
    });
};
