import { useQuery } from "@tanstack/react-query";
import { kitchenApi } from "../services/kitchen.service";
import { kitchenKeys } from "../utils/kitchen-query-keys";
import { KitchenOrderFilters } from "../types/kitchen.types";
import { KITCHEN_CONFIG } from "../constants/kitchen.constants";

/**
 * Hook to fetch all kitchen orders with optional filters
 */
export function useKitchenOrders(filters?: KitchenOrderFilters) {
  return useQuery({
    queryKey: kitchenKeys.orders(filters),
    queryFn: () => kitchenApi.getAll(filters),
    staleTime: KITCHEN_CONFIG.ORDERS_STALE_TIME,
    refetchInterval: KITCHEN_CONFIG.REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}
