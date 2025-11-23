import { KitchenOrderFilters } from "../types/kitchen.types";

/**
 * React Query key factory for kitchen module
 */
export const kitchenQueryKeys = {
  all: ["kitchen"] as const,
  list: (filters?: KitchenOrderFilters) =>
    [...kitchenQueryKeys.all, "orders", filters] as const,
  detail: (id: number) => [...kitchenQueryKeys.all, "order", id] as const,
  
  // Legacy aliases
  orders: (filters?: KitchenOrderFilters) =>
    [...kitchenQueryKeys.all, "orders", filters] as const,
  order: (id: number) => [...kitchenQueryKeys.all, "order", id] as const,
};
