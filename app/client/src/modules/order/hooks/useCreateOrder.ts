import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { orderApi } from '../services/order.service';
import { CreateOrderDto } from '../types';
import { orderKeys } from './useOrders';

/**
 * Hook to create a new order
 */
export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: CreateOrderDto) => orderApi.create(data),
        onSuccess: (order) => {
            // Invalidate orders list
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.count({}) });
            
            // Show success message
            toast.success('Tạo đơn hàng thành công');
            
            // Navigate to order detail
            router.push(`/orders/${order.orderId}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Tạo đơn hàng thất bại');
        },
    });
};
