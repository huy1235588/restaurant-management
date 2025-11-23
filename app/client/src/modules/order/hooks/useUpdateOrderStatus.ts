import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderApi } from "../services/order.service";
import { UpdateOrderStatusDto } from "../types";
import { orderKeys } from "./useOrders";

/**
 * Hook to update order status
 */
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            data,
        }: {
            orderId: number;
            data: UpdateOrderStatusDto;
        }) => orderApi.updateStatus(orderId, data),
        onSuccess: (order) => {
            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(order.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Show success message
            toast.success("Cập nhật trạng thái thành công");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Cập nhật trạng thái thất bại"
            );
        },
    });
};
