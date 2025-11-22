// Billing types based on backend schema

export enum PaymentMethod {
    CASH = 'cash',
    CARD = 'card',
    MOMO = 'momo',
    BANK_TRANSFER = 'bank-transfer',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    PARTIAL = 'partial',
    REFUNDED = 'refunded',
}

export interface BillItem {
    billItemId: number;
    billId: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface Payment {
    paymentId: number;
    billId: number;
    amount: number;
    method: PaymentMethod;
    transactionId?: string | null;
    paidAt: string;
}

export interface Bill {
    billId: number;
    billNumber: string;
    orderId: number;
    subtotal: number;
    taxAmount: number;
    serviceCharge: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    changeAmount: number;
    paymentMethod?: PaymentMethod | null;
    paymentStatus: PaymentStatus;
    paidAt?: string | null;
    billItems?: BillItem[];
    payments?: Payment[];
    order?: {
        orderNumber: string;
        table: {
            tableNumber: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateBillDto {
    orderId: number;
}

export interface ApplyDiscountDto {
    amount: number;
    reason: string;
}

export interface ProcessPaymentDto {
    method: PaymentMethod;
    amount: number;
    transactionId?: string;
}

export interface BillFilters {
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    startDate?: string;
    endDate?: string;
}
