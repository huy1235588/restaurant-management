export interface CreateStockTransactionDto {
    ingredientId: number;
    transactionType: 'in' | 'out' | 'adjustment' | 'waste';
    quantity: number;
    unit: string;
    referenceType?: string;
    referenceId?: number;
    notes?: string;
}

export interface StockAdjustmentDto {
    ingredientId: number;
    newQuantity: number;
    notes?: string;
}

export interface StockTransactionQueryDto {
    page?: number;
    limit?: number;
    ingredientId?: number;
    transactionType?: 'in' | 'out' | 'adjustment' | 'waste';
    fromDate?: string;
    toDate?: string;
}

export interface CreateIngredientBatchDto {
    ingredientId: number;
    purchaseOrderId?: number;
    batchNumber: string;
    quantity: number;
    unit: string;
    unitCost?: number;
    expiryDate?: string;
    receivedDate: string;
}

export interface StockAlertQueryDto {
    page?: number;
    limit?: number;
    alertType?: 'low_stock' | 'expiring_soon' | 'expired';
    isResolved?: boolean;
}

export interface ResolveStockAlertDto {
    notes?: string;
}
