import { Order } from '@/types';
import { BaseSocketService, SocketEventCallback } from './base';

/**
 * Order Socket Service
 * Handles real-time order events
 */
class OrderSocketService extends BaseSocketService {
    /**
     * Listen to order created event
     */
    onOrderCreated(callback: (order: Order) => void) {
        this.addEventListener<Order>('order:created', callback);
    }

    /**
     * Listen to order updated event
     */
    onOrderUpdated(callback: (order: Order) => void) {
        this.addEventListener<Order>('order:updated', callback);
    }

    /**
     * Listen to order status changed event
     */
    onOrderStatusChanged(callback: (data: { orderId: number; status: string }) => void) {
        this.addEventListener<{ orderId: number; status: string }>('order:status-changed', callback);
    }

    /**
     * Listen to order confirmed event (sent to kitchen)
     */
    onOrderConfirmed(callback: (data: { orderId: number; orderNumber: string; confirmedAt: string }) => void) {
        this.addEventListener('order:confirmed', callback);
    }

    /**
     * Listen to order items added event
     */
    onOrderItemAdded(callback: (data: { orderId: number; items: any[]; newTotalAmount: number; newFinalAmount: number }) => void) {
        this.addEventListener('order:item_added', callback);
    }

    /**
     * Listen to order item status changed event
     */
    onOrderItemStatusChanged(callback: (data: { orderId: number; itemId: number; status: string }) => void) {
        this.addEventListener('order:item_status_changed', callback);
    }

    /**
     * Listen to order cancel request event
     */
    onOrderCancelRequest(callback: (data: { 
        orderId: number; 
        itemId?: number; 
        requestedBy: number; 
        reason: string;
        orderNumber: string;
    }) => void) {
        this.addEventListener('order:cancel_request', callback);
    }

    /**
     * Remove order created listener
     */
    offOrderCreated(callback: (order: Order) => void) {
        this.removeEventListener('order:created', callback);
    }

    /**
     * Remove order updated listener
     */
    offOrderUpdated(callback: (order: Order) => void) {
        this.removeEventListener('order:updated', callback);
    }

    /**
     * Remove order status changed listener
     */
    offOrderStatusChanged(callback: (data: { orderId: number; status: string }) => void) {
        this.removeEventListener('order:status-changed', callback);
    }

    /**
     * Remove order confirmed listener
     */
    offOrderConfirmed(callback: (data: { orderId: number; orderNumber: string; confirmedAt: string }) => void) {
        this.removeEventListener('order:confirmed', callback);
    }

    /**
     * Remove order item added listener
     */
    offOrderItemAdded(callback: SocketEventCallback) {
        this.removeEventListener('order:item_added', callback);
    }

    /**
     * Remove order item status changed listener
     */
    offOrderItemStatusChanged(callback: SocketEventCallback) {
        this.removeEventListener('order:item_status_changed', callback);
    }

    /**
     * Remove order cancel request listener
     */
    offOrderCancelRequest(callback: SocketEventCallback) {
        this.removeEventListener('order:cancel_request', callback);
    }
}

// Export singleton instance
export const orderSocketService = new OrderSocketService();
export default orderSocketService;
