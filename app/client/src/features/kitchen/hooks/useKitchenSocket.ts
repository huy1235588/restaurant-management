'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/contexts/SocketContext';
import { kitchenKeys } from './useKitchenManagement';
import { toast } from 'sonner';
import type { KitchenOrder } from '@/types/kitchen';

/**
 * WebSocket Hook for Kitchen Management
 * Listens to real-time kitchen events from backend
 */
export function useKitchenSocket(enabled: boolean = true) {
    const { kitchenSocket: socket, orderSocket, isConnected } = useSocket();
    const queryClient = useQueryClient();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio notification
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/sounds/new-order.mp3'); // Add this sound file to public/sounds/
            audioRef.current.volume = 0.7;
        }
    }, []);

    // Play audio notification
    const playNotificationSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(err => {
                console.warn('Could not play notification sound:', err);
            });
        }
    }, []);

    // Handle new kitchen order received event
    const handleKitchenOrderReceived = useCallback((data: KitchenOrder) => {
        console.log('[Kitchen Socket] New order received:', data);
        
        // Invalidate kitchen orders list
        queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
        queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
        
        // Play audio alert
        playNotificationSound();
        
        // Show notification with high priority
        toast.warning(`🔔 New Order ${data.order?.orderNumber || data.orderId}!`, {
            description: `Table ${data.order?.tableId} - ${data.order?.orderItems?.length || 0} item(s)`,
            duration: 15000, // Show for 15 seconds
            action: {
                label: 'View',
                onClick: () => {
                    // Could navigate to order detail or open modal
                    console.log('Navigate to order:', data.kitchenOrderId);
                },
            },
        });
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New Kitchen Order!`, {
                body: `Table ${data.order?.tableId} - ${data.order?.orderItems?.length || 0} items`,
                icon: '/icon-192x192.png',
                tag: `kitchen-order-${data.kitchenOrderId}`,
                requireInteraction: true, // Keep notification until user interacts
            });
        }
    }, [queryClient, playNotificationSound]);

    // Handle kitchen order updated event
    const handleKitchenOrderUpdated = useCallback((data: Partial<KitchenOrder> & { kitchenOrderId: number }) => {
        console.log('[Kitchen Socket] Order updated:', data);
        
        // Update cache directly
        queryClient.setQueryData(kitchenKeys.detail(data.kitchenOrderId), (old: KitchenOrder | undefined) => {
            if (old) {
                return { ...old, ...data };
            }
            return old;
        });
        
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
        queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
        
        // Show notification if status changed
        if (data.status) {
            toast.info(`Order ${data.kitchenOrderId} updated`, {
                description: `Status: ${data.status}`,
            });
        }
    }, [queryClient]);

    // Handle kitchen order status changed event
    const handleKitchenStatusChanged = useCallback((data: { kitchenOrderId: number; status: string; staffId?: number }) => {
        console.log('[Kitchen Socket] Status changed:', data);
        
        // Update cache
        queryClient.setQueryData(kitchenKeys.detail(data.kitchenOrderId), (old: KitchenOrder | undefined) => {
            if (old) {
                return { ...old, status: data.status as any, staffId: data.staffId || old.staffId };
            }
            return old;
        });
        
        queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
        queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
    }, [queryClient]);

    // Handle order confirmed (sent to kitchen)
    const handleOrderConfirmed = useCallback((data: { orderId: number; orderNumber: string; tableId: number; items: any[] }) => {
        console.log('[Kitchen Socket] Order confirmed and sent to kitchen:', data);
        
        // Invalidate all lists to refetch
        queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
        queryClient.invalidateQueries({ queryKey: kitchenKeys.pending() });
        
        // Play notification sound
        playNotificationSound();
        
        toast.info(`Order ${data.orderNumber} confirmed`, {
            description: `Table ${data.tableId} - ${data.items.length} item(s)`,
        });
    }, [queryClient, playNotificationSound]);

    // Handle order item added event
    const handleOrderItemAdded = useCallback((data: { orderId: number; items: any[]; kitchenOrderId?: number }) => {
        console.log('[Kitchen Socket] Items added to order:', data);
        
        // If we have kitchenOrderId, invalidate specific order
        if (data.kitchenOrderId) {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
        }
        
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
        
        toast.info(`${data.items.length} item(s) added to order ${data.orderId}`);
    }, [queryClient]);

    // Handle order cancel request event
    const handleOrderCancelRequest = useCallback((data: { 
        orderId: number; 
        kitchenOrderId?: number;
        itemId?: number; 
        requestedBy: number; 
        reason: string;
        orderNumber: string;
    }) => {
        console.log('[Kitchen Socket] Cancel request received:', data);
        
        // Play alert sound
        playNotificationSound();
        
        // Show prominent notification requiring action
        if (data.itemId) {
            toast.warning(`⚠️ Item Cancellation Request`, {
                description: `Order ${data.orderNumber} - Item ID: ${data.itemId}\nReason: ${data.reason}`,
                duration: 20000, // Show for 20 seconds
                action: {
                    label: 'Handle',
                    onClick: () => {
                        console.log('Open cancellation modal for item:', data.itemId);
                    },
                },
            });
        } else {
            toast.error(`❌ Order Cancellation Request`, {
                description: `Order ${data.orderNumber}\nReason: ${data.reason}`,
                duration: 20000,
                action: {
                    label: 'Handle',
                    onClick: () => {
                        console.log('Open cancellation modal for order:', data.orderId);
                    },
                },
            });
        }
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Cancellation Request!`, {
                body: `Order ${data.orderNumber}\n${data.reason}`,
                icon: '/icon-192x192.png',
                tag: `cancel-request-${data.orderId}-${data.itemId || 'full'}`,
                requireInteraction: true,
            });
        }
        
        // Invalidate queries
        if (data.kitchenOrderId) {
            queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
        }
        queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
    }, [queryClient, playNotificationSound]);

    // Handle order item status changed
    const handleOrderItemStatusChanged = useCallback((data: { orderId: number; kitchenOrderId?: number; itemId: number; status: string }) => {
        console.log('[Kitchen Socket] Order item status changed:', data);
        
        // Update cache if we have kitchenOrderId
        if (data.kitchenOrderId) {
            queryClient.setQueryData(kitchenKeys.detail(data.kitchenOrderId), (old: KitchenOrder | undefined) => {
                if (old && old.order?.orderItems) {
                    const updatedItems = old.order.orderItems.map((item: any) => 
                        item.orderItemId === data.itemId 
                            ? { ...item, status: data.status as any }
                            : item
                    );
                    return { 
                        ...old, 
                        order: {
                            ...old.order,
                            orderItems: updatedItems
                        }
                    };
                }
                return old;
            });
            
            queryClient.invalidateQueries({ queryKey: kitchenKeys.detail(data.kitchenOrderId) });
        }
        
        queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
    }, [queryClient]);

    // Handle chef assigned event
    const handleChefAssigned = useCallback((data: { kitchenOrderId: number; staffId: number; staffName: string }) => {
        console.log('[Kitchen Socket] Chef assigned:', data);
        
        queryClient.setQueryData(kitchenKeys.detail(data.kitchenOrderId), (old: KitchenOrder | undefined) => {
            if (old) {
                return { ...old, staffId: data.staffId };
            }
            return old;
        });
        
        queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
        
        toast.success(`Chef ${data.staffName} assigned to order ${data.kitchenOrderId}`);
    }, [queryClient]);

    // Handle station assigned event
    const handleStationAssigned = useCallback((data: { kitchenOrderId: number; stationId: number; stationName: string }) => {
        console.log('[Kitchen Socket] Station assigned:', data);
        
        queryClient.setQueryData(kitchenKeys.detail(data.kitchenOrderId), (old: KitchenOrder | undefined) => {
            if (old) {
                return { ...old, stationId: data.stationId };
            }
            return old;
        });
        
        queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
        
        toast.info(`Station ${data.stationName} assigned`);
    }, [queryClient]);

    // Handle priority changed event
    const handlePriorityChanged = useCallback((data: { kitchenOrderId: number; priority: number }) => {
        console.log('[Kitchen Socket] Priority changed:', data);
        
        queryClient.setQueryData(kitchenKeys.detail(data.kitchenOrderId), (old: KitchenOrder | undefined) => {
            if (old) {
                return { ...old, priority: data.priority };
            }
            return old;
        });
        
        queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });
        
        // Show notification if high priority
        if (data.priority >= 8) {
            toast.warning(`⚡ Order ${data.kitchenOrderId} marked as HIGH PRIORITY (${data.priority})`);
        }
    }, [queryClient]);

    // Setup event listeners
    useEffect(() => {
        if (!enabled || !isConnected) return;

        console.log('[Kitchen Socket] Setting up event listeners');

        // Join kitchen room to receive all kitchen events
        socket.joinRoom('kitchen');

        // Register kitchen event listeners
        socket.onKitchenOrderReceived(handleKitchenOrderReceived);
        socket.onKitchenOrderUpdated(handleKitchenOrderUpdated as any);
        socket.onKitchenStatusChanged(handleKitchenStatusChanged);
        socket.onKitchenChefAssigned(handleChefAssigned);
        socket.onKitchenStationAssigned(handleStationAssigned);
        socket.onKitchenPriorityChanged(handlePriorityChanged);

        // Register order event listeners
        orderSocket.onOrderConfirmed(handleOrderConfirmed as any);
        orderSocket.onOrderItemAdded(handleOrderItemAdded as any);
        orderSocket.onOrderCancelRequest(handleOrderCancelRequest);
        orderSocket.onOrderItemStatusChanged(handleOrderItemStatusChanged as any);

        // Cleanup on unmount
        return () => {
            console.log('[Kitchen Socket] Cleaning up event listeners');
            
            socket.leaveRoom('kitchen');
            
            socket.offKitchenOrderReceived(handleKitchenOrderReceived);
            socket.offKitchenOrderUpdated(handleKitchenOrderUpdated as any);
            socket.offKitchenStatusChanged(handleKitchenStatusChanged as any);
            socket.offKitchenChefAssigned(handleChefAssigned as any);
            socket.offKitchenStationAssigned(handleStationAssigned as any);
            socket.offKitchenPriorityChanged(handlePriorityChanged as any);

            orderSocket.offOrderConfirmed(handleOrderConfirmed as any);
            orderSocket.offOrderItemAdded(handleOrderItemAdded as any);
            orderSocket.offOrderCancelRequest(handleOrderCancelRequest as any);
            orderSocket.offOrderItemStatusChanged(handleOrderItemStatusChanged as any);
        };
    }, [
        enabled,
        isConnected,
        socket,
        handleKitchenOrderReceived,
        handleKitchenOrderUpdated,
        handleKitchenStatusChanged,
        handleOrderConfirmed,
        handleOrderItemAdded,
        handleOrderCancelRequest,
        handleOrderItemStatusChanged,
        handleChefAssigned,
        handleStationAssigned,
        handlePriorityChanged,
    ]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return {
        isConnected,
        playNotificationSound,
    };
}
