import { PaymentMethod } from '@/shared/types';

export interface CreateBillDTO {
    orderId: number;
    tableId: number;
    staffId?: number;
    subtotal: number;
    taxAmount: number;
    taxRate: number;
    discountAmount: number;
    serviceCharge: number;
    totalAmount: number;
    notes?: string;
}

export interface ProcessPaymentDTO {
    billId: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    cardNumber?: string;
    cardHolderName?: string;
    notes?: string;
}
