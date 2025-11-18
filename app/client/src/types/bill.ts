import { Order } from './order';
import { User } from './auth';

// Bill Types
export type PaymentMethod = 'cash' | 'card' | 'banking' | 'momo' | 'other';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface Payment {
    paymentId: number;
    billId: number;
    paymentMethod: PaymentMethod;
    paymentAmount: number;
    paymentStatus: PaymentStatus;
    transactionId?: string;
    paymentTime?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Bill {
    billId: number;
    orderId: number;
    order?: Order;
    billNumber: string;
    billDate: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    serviceCharge: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    payments?: Payment[];
    cashierId?: number;
    cashier?: User;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
