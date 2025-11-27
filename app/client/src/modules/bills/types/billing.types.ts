// Payment status enum
export type PaymentStatus = "pending" | "paid" | "refunded" | "cancelled";

// Payment method enum
export type PaymentMethod = "cash" | "card" | "e-wallet" | "transfer";

// Menu Item interface (minimal - full version in menu module)
export interface MenuItem {
    itemId: number;
    itemName: string;
    itemCode?: string;
    imageUrl?: string | null;
    price: number;
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

// Order interface (minimal - full version in order module)
export interface Order {
    orderId: number;
    orderNumber: string;
    tableId: number;
    status: string;
    totalAmount: string;
    orderTime: string;
}

// Bill Item interface
export interface BillItem {
    billItemId: number;
    billId: number;
    itemId: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discount: number;
    total: number;
    menuItem?: MenuItem;
    createdAt?: string;
}

// Payment interface
export interface Payment {
    paymentId: number;
    billId: number;
    paymentMethod: PaymentMethod;
    amount: number;
    transactionId?: string | null;
    cardNumber?: string | null;
    cardHolderName?: string | null;
    notes?: string | null;
    status: PaymentStatus;
    createdAt: string;
}

// Main Bill interface
export interface Bill {
    billId: number;
    billNumber: string;
    orderId: number;
    tableId: number;
    staffId: number | null;
    // Financial fields
    subtotal: number;
    taxAmount: number;
    taxRate: number;
    serviceCharge: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    changeAmount: number;
    // Status
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod | null;
    notes: string | null;
    // Timestamps
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    // Relations
    order?: Order;
    table?: RestaurantTable;
    staff?: Staff | null;
    billItems?: BillItem[];
    payments?: Payment[];
}

// DTOs

export interface CreateBillDto {
    orderId: number;
}

export interface ApplyDiscountDto {
    amount?: number;
    percentage?: number;
    reason: string;
}

export interface ProcessPaymentDto {
    amount: number;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    cardNumber?: string;
    cardHolderName?: string;
    notes?: string;
}

export interface VoidBillDto {
    reason: string;
}

// Filter & Pagination

export interface BillFilterOptions {
    page?: number;
    limit?: number;
    paymentStatus?: PaymentStatus;
    startDate?: string;
    endDate?: string;
    tableId?: number;
    staffId?: number;
    search?: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedBills {
    data: Bill[];
    meta: PaginationInfo;
}

// API Response wrapper
export interface ApiResponse<T> {
    message?: string;
    data: T;
}

// Payment result from processPayment
export interface PaymentResult {
    payment: Payment;
    bill: Bill;
}
