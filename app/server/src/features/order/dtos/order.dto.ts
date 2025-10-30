import { OrderStatus } from '@/shared/types';

export interface CreateOrderDTO {
    tableId: number;
    staffId?: number;
    reservationId?: number;
    customerName?: string;
    customerPhone?: string;
    headCount: number;
    items: Array<{
        itemId: number;
        quantity: number;
        specialRequest?: string;
    }>;
    notes?: string;
}

export interface UpdateOrderDTO {
    status?: OrderStatus;
    notes?: string;
}
