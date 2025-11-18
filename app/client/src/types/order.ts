import { User } from './auth';

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface OrderItem {
    orderItemId?: number;
    orderId?: number;
    menuItemId: number;
    menuItem?: any; // MenuItem type from menu.ts
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
    status?: OrderStatus;
}

export interface Order {
    orderId: number;
    tableId?: number;
    table?: any; // Table type from table.ts
    customerId?: number;
    staffId?: number;
    staff?: User;
    orderType: OrderType;
    status: OrderStatus;
    orderTime: string;
    specialRequests?: string;
    totalAmount: number;
    taxAmount: number;
    discountAmount: number;
    finalAmount: number;
    orderItems: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderFormData {
    tableId?: number;
    orderType: OrderType;
    orderItems: {
        menuItemId: number;
        quantity: number;
        notes?: string;
    }[];
    specialRequests?: string;
}

// Socket Events
export interface SocketOrder {
    orderId: number;
    status: OrderStatus;
    tableId?: number;
    orderType: OrderType;
}
