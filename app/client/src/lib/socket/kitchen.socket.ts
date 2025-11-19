import { KitchenOrder } from '@/types';
import { BaseSocketService, SocketEventCallback } from './base';

/**
 * Kitchen Socket Service
 * Handles real-time kitchen events
 */
class KitchenSocketService extends BaseSocketService {
    /**
     * Listen to kitchen order received event
     */
    onKitchenOrderReceived(callback: (order: KitchenOrder) => void) {
        this.addEventListener<KitchenOrder>('kitchen:order-received', callback);
    }

    /**
     * Listen to kitchen order updated event
     */
    onKitchenOrderUpdated(callback: (order: KitchenOrder) => void) {
        this.addEventListener<KitchenOrder>('kitchen:order-updated', callback);
    }

    /**
     * Listen to kitchen order ready event (entire order ready)
     */
    onKitchenOrderReady(callback: (data: { orderId: number; orderNumber: string; tableId: number; prepTimeActual: number }) => void) {
        this.addEventListener('kitchen:order_ready', callback);
    }

    /**
     * Listen to kitchen item ready event (single item ready)
     */
    onKitchenItemReady(callback: (data: { orderId: number; itemId: number; itemName: string }) => void) {
        this.addEventListener('kitchen:item_ready', callback);
    }

    /**
     * Listen to kitchen cancel accepted event
     */
    onKitchenCancelAccepted(callback: (data: { orderId: number; itemId?: number }) => void) {
        this.addEventListener('kitchen:cancel_accepted', callback);
    }

    /**
     * Listen to kitchen cancel rejected event
     */
    onKitchenCancelRejected(callback: (data: { orderId: number; itemId?: number; reason: string }) => void) {
        this.addEventListener('kitchen:cancel_rejected', callback);
    }

    /**
     * Listen to kitchen status changed event
     */
    onKitchenStatusChanged(callback: (data: { kitchenOrderId: number; status: string; staffId?: number }) => void) {
        this.addEventListener('kitchen:status_changed', callback);
    }

    /**
     * Listen to kitchen chef assigned event
     */
    onKitchenChefAssigned(callback: (data: { kitchenOrderId: number; staffId: number; staffName: string }) => void) {
        this.addEventListener('kitchen:chef_assigned', callback);
    }

    /**
     * Listen to kitchen station assigned event
     */
    onKitchenStationAssigned(callback: (data: { kitchenOrderId: number; stationId: number; stationName: string }) => void) {
        this.addEventListener('kitchen:station_assigned', callback);
    }

    /**
     * Listen to kitchen priority changed event
     */
    onKitchenPriorityChanged(callback: (data: { kitchenOrderId: number; priority: number }) => void) {
        this.addEventListener('kitchen:priority_changed', callback);
    }

    /**
     * Remove kitchen order received listener
     */
    offKitchenOrderReceived(callback: (order: KitchenOrder) => void) {
        this.removeEventListener('kitchen:order-received', callback);
    }

    /**
     * Remove kitchen order updated listener
     */
    offKitchenOrderUpdated(callback: (order: KitchenOrder) => void) {
        this.removeEventListener('kitchen:order-updated', callback);
    }

    /**
     * Remove kitchen order ready listener
     */
    offKitchenOrderReady(callback: SocketEventCallback) {
        this.removeEventListener('kitchen:order_ready', callback);
    }

    /**
     * Remove kitchen item ready listener
     */
    offKitchenItemReady(callback: SocketEventCallback) {
        this.removeEventListener('kitchen:item_ready', callback);
    }

    /**
     * Remove kitchen cancel accepted listener
     */
    offKitchenCancelAccepted(callback: SocketEventCallback) {
        this.removeEventListener('kitchen:cancel_accepted', callback);
    }

    /**
     * Remove kitchen cancel rejected listener
     */
    offKitchenCancelRejected(callback: SocketEventCallback) {
        this.removeEventListener('kitchen:cancel_rejected', callback);
    }

    /**
     * Remove kitchen status changed listener
     */
    offKitchenStatusChanged(callback: SocketEventCallback) {
        this.removeEventListener('kitchen:status_changed', callback);
    }

    /**
     * Remove kitchen chef assigned listener
     */
    offKitchenChefAssigned(callback: SocketEventCallback) {
        this.removeEventListener('kitchen:chef_assigned', callback);
    }

    /**
     * Remove kitchen station assigned listener
     */
    offKitchenStationAssigned(callback: SocketEventCallback) {
        this.removeEventListener('kitchen:station_assigned', callback);
    }

    /**
     * Remove kitchen priority changed listener
     */
    offKitchenPriorityChanged(callback: SocketEventCallback) {
        this.removeEventListener('kitchen:priority_changed', callback);
    }
}

// Export singleton instance
export const kitchenSocketService = new KitchenSocketService();
export default kitchenSocketService;
