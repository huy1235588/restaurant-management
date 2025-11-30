'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { orderApi } from "../services/order.service";
import { AddItemsDto } from "../types";
import { orderKeys } from "./useOrders";

/**
 * Hook to add items to an existing order
 */
export const useAddItems = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: ({
            orderId,
            data,
        }: {
            orderId: number;
            data: AddItemsDto;
        }) => orderApi.addItems(orderId, data),
        onSuccess: (order) => {
            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(order.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Show success message
            toast.success("Thêm món thành công");

            // Navigate back to order detail
            router.push(`/orders/${order.orderId}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Thêm món thất bại");
        },
    });
};
