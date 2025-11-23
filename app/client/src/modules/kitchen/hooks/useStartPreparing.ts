import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kitchenApi } from "../services/kitchen.service";
import { kitchenQueryKeys } from "../utils/kitchen-query-keys";
import { toast } from "sonner";
import { KitchenOrderStatus } from "../types/kitchen.types";

/**
 * Hook to start preparing a kitchen order
 */
export function useStartPreparing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => kitchenApi.startPreparing(id),

    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: kitchenQueryKeys.all });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData(kitchenQueryKeys.list());

      // Optimistically update to "ready" status
      queryClient.setQueryData(kitchenQueryKeys.list(), (old: any) => {
        if (!old) return old;
        return old.map((order: any) =>
          order.kitchenOrderId === id
            ? {
                ...order,
                status: KitchenOrderStatus.READY,
                startedAt: new Date().toISOString(),
              }
            : order
        );
      });

      return { previousOrders };
    },

    onSuccess: () => {
      toast.success("Order preparation started!");
      queryClient.invalidateQueries({ queryKey: kitchenQueryKeys.list() });
    },

    onError: (error: any, id, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(
          kitchenQueryKeys.list(),
          context.previousOrders
        );
      }

      const errorMessage =
        error?.response?.data?.message || "Failed to start order preparation";
      toast.error(errorMessage);
    },
  });
}
