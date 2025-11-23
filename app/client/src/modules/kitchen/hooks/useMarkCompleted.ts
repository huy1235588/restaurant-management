import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kitchenApi } from "../services/kitchen.service";
import { kitchenQueryKeys } from "../utils/kitchen-query-keys";
import { toast } from "sonner";
import { KitchenOrderStatus } from "../types/kitchen.types";

/**
 * Hook to mark a kitchen order as completed (picked up)
 */
export function useMarkCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => kitchenApi.markCompleted(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: kitchenQueryKeys.all });

      const previousOrders = queryClient.getQueryData(kitchenQueryKeys.list());

      // Optimistically update to "completed" status
      queryClient.setQueryData(kitchenQueryKeys.list(), (old: any) => {
        if (!old) return old;
        return old.map((order: any) =>
          order.kitchenOrderId === id
            ? { ...order, status: KitchenOrderStatus.COMPLETED }
            : order
        );
      });

      return { previousOrders };
    },

    onSuccess: () => {
      toast.success("Order completed!");
      queryClient.invalidateQueries({ queryKey: kitchenQueryKeys.list() });
    },

    onError: (error: any, id, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          kitchenQueryKeys.list(),
          context.previousOrders
        );
      }

      const errorMessage =
        error?.response?.data?.message || "Failed to mark order as completed";
      toast.error(errorMessage);
    },
  });
}
