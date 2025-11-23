import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { orderApi } from '../services/order.service';
import { CancelOrderDto } from '../types';
import { orderKeys } from './useOrders';

/**
 * Hook to cancel an entire order
 */
export const useCancelOrder = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: CancelOrderDto }) =>
            orderApi.cancelOrder(orderId, data),
        onSuccess: (order) => {
            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(order.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.count({}) });

            // Show success message
            toast.success('Hủy đơn hàng thành công');

            // Navigate to orders list
            router.push('/orders');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Hủy đơn hàng thất bại');
        },
    });
};
