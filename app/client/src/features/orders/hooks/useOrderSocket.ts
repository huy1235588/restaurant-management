'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/contexts/SocketContext';
import { orderKeys } from './useOrderManagement';
import { toast } from 'sonner';
import type { Order } from '@/types/order';

/**
 * WebSocket Hook for Order Management
 * Listens to real-time order events from backend
 */
export function useOrderSocket(enabled: boolean = true) {
    const { orderSocket: socket, kitchenSocket, isConnected } = useSocket();
    const queryClient = useQueryClient();

    // Handle new order created event
    const handleOrderCreated = useCallback((data: any) => {
        console.log('[Order Socket] New order created:', data);
        
        // Invalidate orders list to refetch
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        
        // Show notification
        toast.info(`New order ${data.orderNumber} created`, {
            description: `Table ${data.table?.tableNumber || data.tableId}`,
        });
    }, [queryClient]);

    // Handle order status changed event
    const handleOrderStatusChanged = useCallback((data: { orderId: number; status: string; tableId: number }) => {
        console.log('[Order Socket] Order status changed:', data);
        
        // Update cache directly for better UX
        queryClient.setQueryData(orderKeys.detail(data.orderId), (old: Order | undefined) => {
            if (old) {
                return { ...old, status: data.status as any };
            }
            return old;
        });
        
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
    }, [queryClient]);

    // Handle order confirmed event (sent to kitchen)
    const handleOrderConfirmed = useCallback((data: { orderId: number; orderNumber: string; confirmedAt: string }) => {
        console.log('[Order Socket] Order confirmed:', data);
        
        // Update status in cache
        queryClient.setQueryData(orderKeys.detail(data.orderId), (old: Order | undefined) => {
            if (old) {
                return { ...old, status: 'confirmed' as any, confirmedAt: data.confirmedAt };
            }
            return old;
        });
        
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        
        toast.success(`Order ${data.orderNumber} sent to kitchen`);
    }, [queryClient]);

    // Handle kitchen order ready event
    const handleKitchenOrderReady = useCallback((data: { orderId: number; orderNumber: string; tableId: number; prepTimeActual: number }) => {
        console.log('[Order Socket] Kitchen order ready:', data);
        
        // Update status
        queryClient.setQueryData(orderKeys.detail(data.orderId), (old: Order | undefined) => {
            if (old) {
                return { ...old, status: 'ready' as any };
            }
            return old;
        });
        
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
        
        // Show prominent notification with audio
        toast.success(`🍽️ Order ${data.orderNumber} is ready!`, {
            description: `Table ${data.tableId} - Prep time: ${data.prepTimeActual}min`,
            duration: 10000, // Show for 10 seconds
        });
        
        // Play audio notification (if user granted permission)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Order ${data.orderNumber} Ready!`, {
                body: `Table ${data.tableId} - Please deliver to customer`,
                icon: '/icon-192x192.png',
                tag: `order-ready-${data.orderId}`,
            });
        }
    }, [queryClient]);

    // Handle kitchen item ready event
    const handleKitchenItemReady = useCallback((data: { orderId: number; itemId: number; itemName: string }) => {
        console.log('[Order Socket] Kitchen item ready:', data);
        
        // Update item status in cache
        queryClient.setQueryData(orderKeys.detail(data.orderId), (old: Order | undefined) => {
            if (old) {
                const updatedItems = old.orderItems.map(item => 
                    item.orderItemId === data.itemId 
                        ? { ...item, status: 'ready' as any }
                        : item
                );
                return { ...old, orderItems: updatedItems };
            }
            return old;
        });
        
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
        
        toast.info(`Item "${data.itemName}" is ready`);
    }, [queryClient]);

    // Handle kitchen cancel accepted event
    const handleKitchenCancelAccepted = useCallback((data: { orderId: number; itemId?: number }) => {
        console.log('[Order Socket] Kitchen accepted cancellation:', data);
        
        if (data.itemId) {
            // Item cancellation accepted
            queryClient.setQueryData(orderKeys.detail(data.orderId), (old: Order | undefined) => {
                if (old) {
                    const updatedItems = old.orderItems.map(item => 
                        item.orderItemId === data.itemId 
                            ? { ...item, status: 'cancelled' as any }
                            : item
                    );
                    return { ...old, orderItems: updatedItems };
                }
                return old;
            });
            toast.success('Item cancellation accepted by kitchen');
        } else {
            // Order cancellation accepted
            queryClient.setQueryData(orderKeys.detail(data.orderId), (old: Order | undefined) => {
                if (old) {
                    return { ...old, status: 'cancelled' as any };
                }
                return old;
            });
            toast.success('Order cancellation accepted by kitchen');
        }
        
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
    }, [queryClient]);

    // Handle kitchen cancel rejected event
    const handleKitchenCancelRejected = useCallback((data: { orderId: number; itemId?: number; reason: string }) => {
        console.log('[Order Socket] Kitchen rejected cancellation:', data);
        
        toast.error('Cancellation rejected by kitchen', {
            description: data.reason,
            duration: 8000,
        });
    }, []);

    // Handle order item added event
    const handleOrderItemAdded = useCallback((data: { orderId: number; items: any[]; newTotalAmount: number; newFinalAmount: number }) => {
        console.log('[Order Socket] Items added to order:', data);
        
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        
        toast.info(`${data.items.length} item(s) added to order`);
    }, [queryClient]);

    // Handle order item status changed
    const handleOrderItemStatusChanged = useCallback((data: { orderId: number; itemId: number; status: string }) => {
        console.log('[Order Socket] Order item status changed:', data);
        
        queryClient.setQueryData(orderKeys.detail(data.orderId), (old: Order | undefined) => {
            if (old) {
                const updatedItems = old.orderItems.map(item => 
                    item.orderItemId === data.itemId 
                        ? { ...item, status: data.status as any }
                        : item
                );
                return { ...old, orderItems: updatedItems };
            }
            return old;
        });
        
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
    }, [queryClient]);

    // Setup event listeners
    useEffect(() => {
        if (!enabled || !isConnected) return;

        console.log('[Order Socket] Setting up event listeners');

        // Join waiters room to receive all order events
        socket.joinRoom('waiters');

        // Register order event listeners
        socket.onOrderCreated(handleOrderCreated);
        socket.onOrderStatusChanged(handleOrderStatusChanged as any);
        socket.onOrderConfirmed(handleOrderConfirmed);
        socket.onOrderItemAdded(handleOrderItemAdded);
        socket.onOrderItemStatusChanged(handleOrderItemStatusChanged);

        // Register kitchen event listeners
        kitchenSocket.onKitchenOrderReady(handleKitchenOrderReady);
        kitchenSocket.onKitchenItemReady(handleKitchenItemReady);
        kitchenSocket.onKitchenCancelAccepted(handleKitchenCancelAccepted);
        kitchenSocket.onKitchenCancelRejected(handleKitchenCancelRejected);

        // Cleanup on unmount
        return () => {
            console.log('[Order Socket] Cleaning up event listeners');
            
            socket.leaveRoom('waiters');
            
            socket.offOrderCreated(handleOrderCreated);
            socket.offOrderStatusChanged(handleOrderStatusChanged as any);
            socket.offOrderConfirmed(handleOrderConfirmed);
            socket.offOrderItemAdded(handleOrderItemAdded as any);
            socket.offOrderItemStatusChanged(handleOrderItemStatusChanged as any);

            kitchenSocket.offKitchenOrderReady(handleKitchenOrderReady as any);
            kitchenSocket.offKitchenItemReady(handleKitchenItemReady as any);
            kitchenSocket.offKitchenCancelAccepted(handleKitchenCancelAccepted as any);
            kitchenSocket.offKitchenCancelRejected(handleKitchenCancelRejected as any);
        };
    }, [
        enabled,
        isConnected,
        socket,
        handleOrderCreated,
        handleOrderStatusChanged,
        handleOrderConfirmed,
        handleKitchenOrderReady,
        handleKitchenItemReady,
        handleKitchenCancelAccepted,
        handleKitchenCancelRejected,
        handleOrderItemAdded,
        handleOrderItemStatusChanged,
    ]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return {
        isConnected,
    };
}
