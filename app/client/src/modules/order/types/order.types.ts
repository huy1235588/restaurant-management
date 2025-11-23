// Order status enum
export type OrderStatus =
    | 'pending' // Just created, not sent to kitchen
    | 'confirmed' // Sent to kitchen, awaiting preparation
    | 'ready' // All items ready, waiting for pickup
    | 'serving' // Delivered to table, customer eating
    | 'completed' // Finished and paid
    | 'cancelled'; // Cancelled by waiter or kitchen

// Order item status enum
export type OrderItemStatus =
    | 'pending' // Not started
    | 'ready' // Finished
    | 'served' // Delivered to customer
    | 'cancelled'; // Cancelled

// Menu Item interface (minimal - full version in menu module)
export interface MenuItem {
    itemId: number;
    itemName: string;
    itemCode?: string;
    imageUrl?: string | null;
    price: number;
    categoryId: number;
    isAvailable: boolean;
}

// Restaurant Table interface (minimal - full version in tables module)
export interface RestaurantTable {
    tableId: number;
    tableNumber: string;
    tableName?: string | null;
    capacity: number;
    floor: number;
    section?: string | null;
    status: string;
}

// Staff interface (minimal - full version in staff module)
export interface Staff {
    staffId: number;
    fullName: string;
    username?: string;
    role?: string;
}

// Order Item interface
export interface OrderItem {
    orderItemId: number;
    orderId: number;
    itemId: number;
    menuItem: MenuItem;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specialRequest?: string | null;
    status: OrderItemStatus;
    createdAt: string;
    updatedAt: string;
}

// Main Order interface
export interface Order {
    orderId: number;
    orderNumber: string;
    tableId: number;
    table: RestaurantTable;
    staffId?: number | null;
    staff?: Staff | null;
    reservationId?: number | null;
    customerName?: string | null;
    customerPhone?: string | null;
    partySize: number;
    status: OrderStatus;
    notes?: string | null;
    // Financial fields
    totalAmount: number;
    discountAmount: number;
    taxAmount: number;
    finalAmount: number;
    // Timestamps
    orderTime: string;
    confirmedAt?: string | null;
    completedAt?: string | null;
    cancelledAt?: string | null;
    cancellationReason?: string | null;
    createdAt: string;
    updatedAt: string;
    // Relations
    orderItems: OrderItem[];
}

// DTOs

export interface CreateOrderItemDto {
    itemId: number;
    quantity: number;
    specialRequest?: string;
}

export interface CreateOrderDto {
    tableId: number;
    reservationId?: number;
    customerName?: string;
    customerPhone?: string;
    partySize: number;
    notes?: string;
    items: CreateOrderItemDto[];
}

export interface AddItemsDto {
    items: CreateOrderItemDto[];
}

export interface CancelItemDto {
    reason: string;
}

export interface CancelOrderDto {
    reason: string;
}

export interface UpdateOrderStatusDto {
    status: OrderStatus;
}

export interface MarkItemServedDto {
    orderItemId: number;
}

// Filter & Pagination

export interface OrderFilterOptions {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    tableId?: number;
    staffId?: number;
    startDate?: string;
    endDate?: string;
    search?: string; // Search by order number, customer name, phone
    sortBy?: 'orderTime' | 'createdAt' | 'totalAmount' | 'status';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedOrders {
    data: Order[];
    meta: PaginationInfo;
}

// API Response wrapper
export interface ApiResponse<T> {
    success?: boolean;
    data: T;
    message?: string;
}

// WebSocket Events

export interface OrderCreatedEvent {
    orderId: number;
    orderNumber: string;
    tableId: number;
}

export interface OrderUpdatedEvent {
    orderId: number;
    orderNumber: string;
    status: OrderStatus;
}

export interface OrderItemsAddedEvent {
    orderId: number;
    orderNumber: string;
    items: OrderItem[];
}

export interface OrderItemCancelledEvent {
    orderId: number;
    orderNumber: string;
    orderItemId: number;
}

export interface OrderCancelledEvent {
    orderId: number;
    orderNumber: string;
    reason: string;
}

export interface KitchenOrderReadyEvent {
    orderId: number;
    orderNumber: string;
}

// UI State

export interface ShoppingCartItem {
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
    specialRequests?: string;
}

export interface CreateOrderFormData {
    // Step 1: Table
    tableId?: number;
    
    // Step 2: Customer
    customerName?: string;
    customerPhone?: string;
    partySize: number;
    reservationId?: number;
    
    // Step 3: Menu Items
    items: ShoppingCartItem[];
    
    // Step 4: Review
    notes?: string;
}

export interface EditOrderFormData {
    orderId: number;
    currentItems: OrderItem[];
    currentTotal: number;
    newItems: ShoppingCartItem[];
}
