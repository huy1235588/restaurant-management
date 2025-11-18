import { User } from './auth';

// Ingredient Types
export interface IngredientCategory {
    categoryId: number;
    categoryName: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Ingredient {
    ingredientId: number;
    ingredientCode: string;
    ingredientName: string;
    unit: string;
    categoryId?: number;
    category?: IngredientCategory;
    minimumStock: number;
    currentStock: number;
    unitCost?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Recipe {
    recipeId: number;
    itemId: number;
    ingredientId: number;
    ingredient?: Ingredient;
    menuItem?: any; // MenuItem type
    quantity: number;
    unit: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Supplier Types
export interface Supplier {
    supplierId: number;
    supplierCode: string;
    supplierName: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    taxCode?: string;
    paymentTerms?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Purchase Order Types
export type PurchaseOrderStatus = 'pending' | 'ordered' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
    itemId: number;
    purchaseOrderId: number;
    ingredientId: number;
    ingredient?: Ingredient;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
    receivedQuantity: number;
    createdAt: string;
}

export interface PurchaseOrder {
    purchaseOrderId: number;
    orderNumber: string;
    supplierId: number;
    supplier?: Supplier;
    staffId?: number;
    staff?: User;
    orderDate: string;
    expectedDate?: string;
    receivedDate?: string;
    status: PurchaseOrderStatus;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    notes?: string;
    items?: PurchaseOrderItem[];
    createdAt: string;
    updatedAt: string;
}

// Stock Transaction Types
export type TransactionType = 'in' | 'out' | 'adjustment' | 'waste';

export interface StockTransaction {
    transactionId: number;
    ingredientId: number;
    ingredient?: Ingredient;
    transactionType: TransactionType;
    quantity: number;
    unit: string;
    referenceType?: string;
    referenceId?: number;
    staffId?: number;
    staff?: User;
    notes?: string;
    transactionDate: string;
    createdAt: string;
}

// Batch Types
export interface IngredientBatch {
    batchId: number;
    ingredientId: number;
    ingredient?: Ingredient;
    purchaseOrderId?: number;
    purchaseOrder?: PurchaseOrder;
    batchNumber: string;
    quantity: number;
    remainingQuantity: number;
    unit: string;
    unitCost?: number;
    expiryDate?: string;
    receivedDate: string;
    createdAt: string;
    updatedAt: string;
}

// Alert Types
export type StockAlertType = 'low_stock' | 'expiring_soon' | 'expired';

export interface StockAlert {
    alertId: number;
    ingredientId: number;
    ingredient?: Ingredient;
    alertType: StockAlertType;
    message: string;
    isResolved: boolean;
    resolvedAt?: string;
    resolvedBy?: number;
    resolver?: User;
    createdAt: string;
}

// DTOs for Create/Update
export interface CreateIngredientDto {
    ingredientCode: string;
    ingredientName: string;
    unit: string;
    categoryId?: number;
    minimumStock?: number;
    unitCost?: number;
}

export interface UpdateIngredientDto {
    ingredientCode?: string;
    ingredientName?: string;
    unit?: string;
    categoryId?: number | null;
    minimumStock?: number;
    unitCost?: number;
    isActive?: boolean;
}

export interface CreateSupplierDto {
    supplierCode: string;
    supplierName: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    taxCode?: string;
    paymentTerms?: string;
}

export interface UpdateSupplierDto {
    supplierCode?: string;
    supplierName?: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    taxCode?: string;
    paymentTerms?: string;
    isActive?: boolean;
}

export interface CreatePurchaseOrderItemDto {
    ingredientId: number;
    quantity: number;
    unit: string;
    unitPrice: number;
}

export interface CreatePurchaseOrderDto {
    supplierId: number;
    expectedDate?: string;
    notes?: string;
    items: CreatePurchaseOrderItemDto[];
}

export interface UpdatePurchaseOrderDto {
    supplierId?: number;
    expectedDate?: string;
    status?: PurchaseOrderStatus;
    notes?: string;
}

export interface ReceivePurchaseOrderItemDto {
    itemId: number;
    receivedQuantity: number;
    batchNumber: string;
    expiryDate?: string;
}

export interface ReceivePurchaseOrderDto {
    receivedDate?: string;
    items: ReceivePurchaseOrderItemDto[];
}

export interface StockAdjustmentDto {
    ingredientId: number;
    newQuantity: number;
    notes?: string;
}

export interface CreateStockTransactionDto {
    ingredientId: number;
    transactionType: TransactionType;
    quantity: number;
    unit: string;
    referenceType?: string;
    referenceId?: number;
    notes?: string;
}
