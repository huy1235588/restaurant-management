import { useQuery } from "@tanstack/react-query";
import { billingApi } from "../services/billing.service";
import { BillFilterOptions } from "../types";
import { BILLING_QUERY_KEYS } from "../constants";

/**
 * React Query keys for bills
 */
export const billKeys = {
    all: BILLING_QUERY_KEYS.bills,
    lists: () => [...billKeys.all, "list"] as const,
    list: (filters?: BillFilterOptions) =>
        [...billKeys.lists(), filters] as const,
    details: () => [...billKeys.all, "detail"] as const,
    detail: (id: number) => [...billKeys.details(), id] as const,
};

/**
 * Hook to fetch all bills with pagination and filters
 */
export const useBills = (filters?: BillFilterOptions) => {
    return useQuery({
        queryKey: billKeys.list(filters),
        queryFn: () => billingApi.getAll(filters),
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: true,
    });
};
