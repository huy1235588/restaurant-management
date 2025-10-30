// User và Authentication Types
export type UserRole = 'admin' | 'manager' | 'waiter' | 'chef' | 'bartender' | 'cashier';

export interface User {
    accountId: number;
    username: string;
    email: string;
    fullName?: string;
    phoneNumber?: string;
    role: UserRole;
    isActive: boolean;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface OrderItem {
    orderItemId?: number;
    orderId?: number;
    menuItemId: number;
    menuItem?: MenuItem;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
    status?: OrderStatus;
}

export interface Order {
    orderId: number;
    tableId?: number;
    table?: Table;
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

// Menu Types
export interface MenuItem {
    itemId: number;
    itemCode: string;
    itemName: string;
    categoryId: number;
    category?: Category;
    price: number;
    cost?: number;
    description?: string;
    imageUrl?: string;
    isAvailable: boolean;
    isActive: boolean;
    preparationTime?: number;
    spicyLevel?: number;
    isVegetarian?: boolean;
    calories?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    categoryId: number;
    categoryName: string;
    description?: string;
    displayOrder?: number;
    isActive: boolean;
    imageUrl?: string;
    menuItems?: MenuItem[];
    createdAt: string;
    updatedAt: string;
}

// Table Types
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface Table {
    tableId: number;
    tableNumber: string;
    tableName?: string;
    capacity: number;
    minCapacity?: number;
    floor?: number;
    section?: string;
    status: TableStatus;
    isActive: boolean;
    qrCode?: string;
    currentOrder?: Order;
    createdAt: string;
    updatedAt: string;
}

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

// Reservation Types
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export interface Reservation {
    reservationId: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    tableId?: number;
    table?: Table;
    partySize: number;
    reservationDate: string;
    reservationTime: string;
    duration?: number;
    status: ReservationStatus;
    specialRequests?: string;
    staffId?: number;
    staff?: User;
    createdAt: string;
    updatedAt: string;
}

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

// Socket Events
export interface SocketOrder {
    orderId: number;
    status: OrderStatus;
    tableId?: number;
    orderType: OrderType;
}

export interface SocketTable {
    tableId: number;
    status: TableStatus;
    tableNumber: string;
}

// Dashboard Statistics
export interface DashboardStats {
    todayRevenue: number;
    todayOrders: number;
    activeOrders: number;
    availableTables: number;
    pendingReservations: number;
}

export interface RevenueChartData {
    date: string;
    revenue: number;
    orders: number;
}

export interface CategorySalesData {
    categoryName: string;
    sales: number;
    percentage: number;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}


export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

// Form Types
export interface LoginFormData {
    username: string;
    password: string;
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

export interface ReservationFormData {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    partySize: number;
    reservationDate: string;
    reservationTime: string;
    specialRequests?: string;
}

// Permission mapping for RBAC
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    admin: ['*'], // Full access
    manager: [
        'dashboard.view',
        'orders.view',
        'orders.create',
        'orders.update',
        'orders.delete',
        'menu.view',
        'menu.create',
        'menu.update',
        'menu.delete',
        'tables.view',
        'tables.update',
        'reservations.view',
        'reservations.create',
        'reservations.update',
        'bills.view',
        'staff.view',
        'reports.view',
    ],
    waiter: [
        'dashboard.view',
        'orders.view',
        'orders.create',
        'orders.update',
        'menu.view',
        'tables.view',
        'tables.update',
        'reservations.view',
        'reservations.create',
    ],
    chef: [
        'kitchen.view',
        'orders.view',
        'orders.update',
        'menu.view',
    ],
    bartender: [
        'kitchen.view',
        'orders.view',
        'orders.update',
        'menu.view',
    ],
    cashier: [
        'dashboard.view',
        'orders.view',
        'bills.view',
        'bills.create',
        'bills.update',
        'payments.create',
    ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.includes('*') || permissions.includes(permission);
}

// ============================================
// INVENTORY MANAGEMENT TYPES
// ============================================

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
    menuItem?: MenuItem;
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