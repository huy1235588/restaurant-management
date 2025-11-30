import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../services/order.service";
import { orderKeys } from "./useOrders";

/**
 * Hook to fetch a single order by ID
 */
export const useOrderById = (id: number | null) => {
    return useQuery({
        queryKey: orderKeys.detail(id!),
        queryFn: () => orderApi.getById(id!),
        enabled: !!id && id > 0,
        staleTime: 10000, // 10 seconds
        refetchOnWindowFocus: true,
    });
};
