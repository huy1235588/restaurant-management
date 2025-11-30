import { useQuery } from "@tanstack/react-query";
import { kitchenApi } from "../services/kitchen.service";
import { kitchenQueryKeys } from "../utils/kitchen-query-keys";
import { KITCHEN_CONFIG } from "../constants/kitchen.constants";

/**
 * Hook to fetch a single kitchen order by ID
 */
export function useKitchenOrderById(id: number | null) {
    return useQuery({
        queryKey: kitchenQueryKeys.order(id!),
        queryFn: () => kitchenApi.getById(id!),
        enabled: id !== null && id !== undefined,
        staleTime: KITCHEN_CONFIG.ORDER_DETAIL_STALE_TIME,
        refetchOnWindowFocus: true,
    });
}
