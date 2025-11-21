// Reservation status enum
export type ReservationStatus =
    | 'pending'
    | 'confirmed'
    | 'seated'
    | 'completed'
    | 'cancelled'
    | 'no_show';

// Customer interface
export interface Customer {
    customerId: number;
    name: string;
    phoneNumber: string;
    email?: string;
    birthday?: string;
    preferences?: any;
    notes?: string;
    isVip: boolean;
    createdAt: string;
    updatedAt: string;
}

// Restaurant Table interface
export interface RestaurantTable {
    tableId: number;
    tableNumber: string;
    tableName?: string;
    capacity: number;
    minCapacity: number;
    floor: number;
    section?: string;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Main Reservation interface
export interface Reservation {
    reservationId: number;
    id?: number; // Alias for reservationId
    reservationCode: string;
    customerName: string;
    phoneNumber: string;
    email?: string;
    customerId?: number;
    tableId: number;
    reservationDate: string;
    reservationTime: string;
    duration: number;
    partySize: number;
    status: ReservationStatus;
    specialRequest?: string;
    depositAmount?: number;
    notes?: string;
    tags?: string[];
    createdBy?: number;
    confirmedAt?: string;
    seatedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
    // Relations
    customer?: Customer;
    table?: RestaurantTable;
    audits?: ReservationAudit[];
}

// Reservation Audit interface
export interface ReservationAudit {
    auditId: number;
    reservationId: number;
    action: string;
    userId?: number;
    changes?: any;
    createdAt: string;
    user?: {
        staffId: number;
        fullName: string;
    };
}

// DTOs

export interface CreateReservationDto {
    customerId?: number;
    customerName: string;
    phoneNumber: string; // Fixed: was customerPhone
    email?: string; // Fixed: was customerEmail
    tableId?: number;
    floor?: number;
    preferredTableId?: number;
    reservationDate: string;
    reservationTime: string;
    duration?: number;
    partySize: number;
    specialRequest?: string;
    depositAmount?: number;
    notes?: string;
    tags?: string[];
}

export interface UpdateReservationDto {
    customerName?: string;
    phoneNumber?: string; // Fixed: was customerPhone
    email?: string; // Fixed: was customerEmail
    tableId?: number;
    reservationDate?: string;
    reservationTime?: string;
    duration?: number;
    partySize?: number;
    specialRequest?: string;
    depositAmount?: number;
    notes?: string;
    tags?: string[];
}

export interface CancelReservationDto {
    reason?: string;
}

export interface CheckAvailabilityDto {
    date: string;
    partySize: number;
    duration?: number; // Optional - defaults to 120 on backend
    floor?: number;
    section?: string;
}

export interface ReservationFilterOptions {
    page?: number;
    limit?: number;
    status?: ReservationStatus;
    date?: string;
    startDate?: string;
    endDate?: string;
    tableId?: number;
    search?: string;
    sortBy?: 'reservationDate' | 'reservationTime' | 'createdAt' | 'status';
    sortOrder?: 'asc' | 'desc';
}

// Pagination

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationInfo;
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
