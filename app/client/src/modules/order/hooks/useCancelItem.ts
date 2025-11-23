import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderApi } from '../services/order.service';
import { CancelItemDto } from '../types';
import { orderKeys } from './useOrders';

/**
 * Hook to cancel an order item
 */
export const useCancelItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            orderItemId,
            data,
        }: {
            orderId: number;
            orderItemId: number;
            data: CancelItemDto;
        }) => orderApi.cancelItem(orderId, orderItemId, data),
        onSuccess: (order) => {
            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(order.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Show success message
            toast.success('Hủy món thành công');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Hủy món thất bại');
        },
    });
};
