import { User } from './auth';
import { Table } from './table';

// Reservation Types
export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

export interface Customer {
    customerId: number;
    name: string;
    phoneNumber: string;
    email?: string;
    birthday?: string;
    preferences?: Record<string, any>;
    notes?: string;
    isVip: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Reservation {
    reservationId: number;
    reservationCode: string;
    customerId?: number;
    customer?: Customer;
    customerName: string;
    phoneNumber: string;
    email?: string;
    tableId: number;
    table?: Table;
    reservationDate: string;
    reservationTime: string;
    duration: number;
    headCount: number;
    status: ReservationStatus;
    specialRequest?: string;
    depositAmount?: number;
    notes?: string;
    tags?: string[];
    createdBy?: number;
    creator?: User;
    confirmedAt?: string;
    seatedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReservationAudit {
    auditId: number;
    reservationId: number;
    action: 'created' | 'updated' | 'cancelled' | 'status_changed';
    userId: number;
    user?: User;
    changes: Record<string, any>;
    timestamp: string;
}

export interface AvailableTable {
    tableId: number;
    tableNumber: string;
    capacity: number;
    minCapacity?: number;
    floor?: number;
    location?: string;
    isAvailable: boolean;
}

export interface AvailabilityCheck {
    available: boolean;
    tables: AvailableTable[];
    alternatives?: {
        time: string;
        availableCount: number;
    }[];
}

// Form DTOs
export interface ReservationFormData {
    customerId?: number;
    customerName: string;
    phoneNumber: string;
    email?: string;
    tableId?: number;
    floor?: number;
    preferredTableId?: number;
    reservationDate: string;
    reservationTime: string;
    duration?: number;
    headCount: number;
    specialRequest?: string;
    depositAmount?: number;
    notes?: string;
    tags?: string[];
}

export interface CreateReservationDto extends ReservationFormData {}

export interface UpdateReservationDto extends Partial<ReservationFormData> {}

export interface CreateCustomerDto {
    name: string;
    phoneNumber: string;
    email?: string;
    birthday?: string;
    preferences?: Record<string, any>;
    notes?: string;
    isVip?: boolean;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}
