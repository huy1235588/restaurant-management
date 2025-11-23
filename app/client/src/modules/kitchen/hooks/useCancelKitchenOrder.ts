import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kitchenApi } from "../services/kitchen.service";
import { kitchenKeys } from "../utils/kitchen-query-keys";
import { toast } from "sonner";

/**
 * Hook to cancel a kitchen order
 */
export function useCancelKitchenOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => kitchenApi.cancel(id),

    onSuccess: () => {
      toast.success("Order cancelled");
      queryClient.invalidateQueries({ queryKey: kitchenKeys.orders() });
    },

    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to cancel order";
      toast.error(errorMessage);
    },
  });
}
