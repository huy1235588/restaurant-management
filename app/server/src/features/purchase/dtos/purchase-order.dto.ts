export interface CreatePurchaseOrderDto {
    supplierId: number;
    expectedDate?: string;
    notes?: string;
    items: CreatePurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemDto {
    ingredientId: number;
    quantity: number;
    unit: string;
    unitPrice: number;
}

export interface UpdatePurchaseOrderDto {
    supplierId?: number;
    expectedDate?: string;
    status?: 'pending' | 'ordered' | 'received' | 'cancelled';
    notes?: string;
}

export interface ReceivePurchaseOrderDto {
    receivedDate?: string;
    items: ReceivePurchaseOrderItemDto[];
}

export interface ReceivePurchaseOrderItemDto {
    itemId: number;
    receivedQuantity: number;
    batchNumber: string;
    expiryDate?: string;
}

export interface PurchaseOrderQueryDto {
    filters?: {
        supplierId?: number;
        status?: 'pending' | 'ordered' | 'received' | 'cancelled';
        fromDate?: string;
        toDate?: string;
    };
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
