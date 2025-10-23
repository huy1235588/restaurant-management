export interface CreatePaymentDto {
    billId: number;
    paymentMethod: 'cash' | 'card' | 'momo' | 'bank_transfer';
    amount: number;
    transactionId?: string;
    cardNumber?: string;
    cardHolderName?: string;
    notes?: string;
}

export interface UpdatePaymentDto {
    paymentMethod?: 'cash' | 'card' | 'momo' | 'bank_transfer';
    amount?: number;
    transactionId?: string;
    cardNumber?: string;
    cardHolderName?: string;
    status?: 'pending' | 'paid' | 'refunded' | 'cancelled';
    notes?: string;
}

export interface PaymentResponseDto {
    paymentId: number;
    billId: number;
    paymentMethod: 'cash' | 'card' | 'momo' | 'bank_transfer';
    amount: number;
    transactionId?: string;
    cardNumber?: string;
    cardHolderName?: string;
    status: 'pending' | 'paid' | 'refunded' | 'cancelled';
    notes?: string;
    paymentDate: Date;
    createdAt: Date;
    bill?: {
        billNumber: string;
        totalAmount: number;
    };
}
