import { OrderStatus } from './order';

// Kitchen Types
export interface KitchenOrder {
    orderId: number;
    tableNumber: string;
    orderTime: string;
    items: KitchenOrderItem[];
    priority: 'low' | 'normal' | 'high';
    estimatedTime?: number;
}

export interface KitchenOrderItem {
    orderItemId: number;
    itemName: string;
    quantity: number;
    notes?: string;
    status: OrderStatus;
    preparationTime?: number;
}
