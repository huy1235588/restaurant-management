import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderApi } from '../services/order.service';
import { orderKeys } from './useOrders';

/**
 * Hook to mark an order item as served
 */
export const useMarkItemServed = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            orderItemId,
        }: {
            orderId: number;
            orderItemId: number;
        }) => orderApi.markItemServed(orderId, orderItemId),
        onSuccess: (order) => {
            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(order.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Show success message
            toast.success('Đánh dấu đã phục vụ thành công');
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || 'Đánh dấu đã phục vụ thất bại'
            );
        },
    });
};
