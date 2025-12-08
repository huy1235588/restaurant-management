import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderApi } from "../services/order.service";
import { orderKeys } from "./useOrders";

/**
 * Hook to confirm order (change status from pending to confirmed)
 */
export const useConfirmOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: number) => orderApi.confirmOrder(orderId),
        retry: 1,
        onSuccess: (order) => {
            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(order.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Show success message
            toast.success("Xác nhận đơn hàng thành công");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Xác nhận đơn hàng thất bại"
            );
        },
    });
};
