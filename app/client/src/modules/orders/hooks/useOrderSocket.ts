import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { orderSocketService } from '../services/order-socket.service';
import { orderKeys } from './useOrders';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage WebSocket connection for orders
 * Automatically connects/disconnects and handles events
 */
export const useOrderSocket = (options?: { autoConnect?: boolean }) => {
    const { autoConnect = true } = options || {};
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    useEffect(() => {
        if (!autoConnect) return;

        // Connect to socket
        orderSocketService.connect();

        // Subscribe to order events
        const unsubscribe = orderSocketService.subscribeToOrderEvents({
            onCreated: (data) => {
                // Invalidate orders list
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
                queryClient.invalidateQueries({ queryKey: orderKeys.count() });
                
                toast.success(`Đơn hàng mới #${data.order.id} đã được tạo`);
            },

            onStatusChanged: (data) => {
                // Invalidate specific order and lists
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.order.id) });
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
                
                toast.info(
                    `Đơn hàng #${data.order.id} đã chuyển sang ${t(`orders.status.${data.newStatus}`)}`
                );
            },

            onItemsAdded: (data) => {
                // Invalidate specific order and kitchen queue
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.order.id) });
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
                queryClient.invalidateQueries({ queryKey: orderKeys.kitchenQueue() });
                
                toast.success(`Đã thêm món vào đơn hàng #${data.order.id}`);
            },

            onItemCancelled: (data) => {
                // Invalidate specific order and kitchen queue
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.order.id) });
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
                queryClient.invalidateQueries({ queryKey: orderKeys.kitchenQueue() });
                
                toast.info(`Đã hủy món trong đơn hàng #${data.order.id}`);
            },

            onOrderCancelled: (data) => {
                // Invalidate all order queries
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.order.id) });
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
                queryClient.invalidateQueries({ queryKey: orderKeys.count() });
                queryClient.invalidateQueries({ queryKey: orderKeys.kitchenQueue() });
                
                toast.warning(`Đơn hàng #${data.order.id} đã bị hủy`);
            },

            onKitchenOrderDone: (data) => {
                // Invalidate kitchen queue and related order
                queryClient.invalidateQueries({ queryKey: orderKeys.kitchenQueue() });
                if (data.kitchenOrder.orderId) {
                    queryClient.invalidateQueries({
                        queryKey: orderKeys.detail(data.kitchenOrder.orderId),
                    });
                }
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
                
                toast.success('Món đã sẵn sàng phục vụ! 🍽️');
            },

            onItemServed: (data) => {
                // Invalidate specific order
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.order.id) });
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
                
                toast.success(`Đã phục vụ món trong đơn hàng #${data.order.id}`);
            },
        });

        // Cleanup on unmount
        return () => {
            unsubscribe();
            orderSocketService.disconnect();
        };
    }, [autoConnect, queryClient, t]);

    return {
        isConnected: orderSocketService.isConnected(),
        joinOrder: (orderId: number) => orderSocketService.joinOrder(orderId),
        leaveOrder: (orderId: number) => orderSocketService.leaveOrder(orderId),
    };
};

/**
 * Hook to subscribe to a specific order's updates
 */
export const useOrderRealtime = (orderId: number | null) => {
    useEffect(() => {
        if (!orderId) return;

        // Join order room
        orderSocketService.joinOrder(orderId);

        // Leave room on unmount
        return () => {
            orderSocketService.leaveOrder(orderId);
        };
    }, [orderId]);
};
