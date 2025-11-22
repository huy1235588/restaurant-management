import { BaseSocketService } from '@/lib/socket/base';
import { Order, KitchenOrder } from '../types';

export type OrderEventData = {
    order: Order;
};

export type KitchenOrderEventData = {
    kitchenOrder: KitchenOrder;
};

export type OrderItemEventData = {
    order: Order;
    itemId: number;
};

export type OrderStatusEventData = {
    order: Order;
    oldStatus: string;
    newStatus: string;
};

/**
 * Order Socket Service
 * Manages WebSocket connections and events for order management
 */
class OrderSocketService extends BaseSocketService {
    /**
     * Join order room to receive updates for a specific order
     */
    joinOrder(orderId: number) {
        this.emit('join:order', { orderId });
    }

    /**
     * Leave order room
     */
    leaveOrder(orderId: number) {
        this.emit('leave:order', { orderId });
    }

    /**
     * Subscribe to order created event
     */
    onOrderCreated(callback: (data: OrderEventData) => void) {
        this.addEventListener<OrderEventData>('order:created', callback);
        return () => this.removeEventListener('order:created', callback);
    }

    /**
     * Subscribe to order status changed event
     */
    onOrderStatusChanged(callback: (data: OrderStatusEventData) => void) {
        this.addEventListener<OrderStatusEventData>('order:status-changed', callback);
        return () => this.removeEventListener('order:status-changed', callback);
    }

    /**
     * Subscribe to items added event
     */
    onItemsAdded(callback: (data: OrderEventData) => void) {
        this.addEventListener<OrderEventData>('order:items-added', callback);
        return () => this.removeEventListener('order:items-added', callback);
    }

    /**
     * Subscribe to item cancelled event
     */
    onItemCancelled(callback: (data: OrderItemEventData) => void) {
        this.addEventListener<OrderItemEventData>('order:item-cancelled', callback);
        return () => this.removeEventListener('order:item-cancelled', callback);
    }

    /**
     * Subscribe to order cancelled event
     */
    onOrderCancelled(callback: (data: OrderEventData) => void) {
        this.addEventListener<OrderEventData>('order:cancelled', callback);
        return () => this.removeEventListener('order:cancelled', callback);
    }

    /**
     * Subscribe to kitchen order done event
     */
    onKitchenOrderDone(callback: (data: KitchenOrderEventData) => void) {
        this.addEventListener<KitchenOrderEventData>('kitchen:order-done', callback);
        return () => this.removeEventListener('kitchen:order-done', callback);
    }

    /**
     * Subscribe to item served event
     */
    onItemServed(callback: (data: OrderItemEventData) => void) {
        this.addEventListener<OrderItemEventData>('order:item-served', callback);
        return () => this.removeEventListener('order:item-served', callback);
    }

    /**
     * Subscribe to all order events at once
     */
    subscribeToOrderEvents(callbacks: {
        onCreated?: (data: OrderEventData) => void;
        onStatusChanged?: (data: OrderStatusEventData) => void;
        onItemsAdded?: (data: OrderEventData) => void;
        onItemCancelled?: (data: OrderItemEventData) => void;
        onOrderCancelled?: (data: OrderEventData) => void;
        onKitchenOrderDone?: (data: KitchenOrderEventData) => void;
        onItemServed?: (data: OrderItemEventData) => void;
    }) {
        const unsubscribers: (() => void)[] = [];

        if (callbacks.onCreated) {
            unsubscribers.push(this.onOrderCreated(callbacks.onCreated));
        }
        if (callbacks.onStatusChanged) {
            unsubscribers.push(this.onOrderStatusChanged(callbacks.onStatusChanged));
        }
        if (callbacks.onItemsAdded) {
            unsubscribers.push(this.onItemsAdded(callbacks.onItemsAdded));
        }
        if (callbacks.onItemCancelled) {
            unsubscribers.push(this.onItemCancelled(callbacks.onItemCancelled));
        }
        if (callbacks.onOrderCancelled) {
            unsubscribers.push(this.onOrderCancelled(callbacks.onOrderCancelled));
        }
        if (callbacks.onKitchenOrderDone) {
            unsubscribers.push(this.onKitchenOrderDone(callbacks.onKitchenOrderDone));
        }
        if (callbacks.onItemServed) {
            unsubscribers.push(this.onItemServed(callbacks.onItemServed));
        }

        // Return cleanup function to unsubscribe all
        return () => {
            unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
    }
}

// Export singleton instance
export const orderSocketService = new OrderSocketService();
