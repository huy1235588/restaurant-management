import { useQuery } from "@tanstack/react-query";
import { billingApi } from "../services/billing.service";
import { billKeys } from "./useBills";

/**
 * Hook to fetch a single bill by ID
 */
export const useBill = (id: number | null) => {
    return useQuery({
        queryKey: billKeys.detail(id!),
        queryFn: () => billingApi.getById(id!),
        enabled: !!id && id > 0,
        staleTime: 10000, // 10 seconds
        refetchOnWindowFocus: true,
    });
};
