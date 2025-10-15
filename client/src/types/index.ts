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
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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
