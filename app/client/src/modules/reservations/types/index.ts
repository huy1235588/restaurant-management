// Reservation types based on backend schema

export enum ReservationStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SEATED = 'seated',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    NO_SHOW = 'no-show',
}

export interface Reservation {
    reservationId: number;
    reservationCode: string;
    customerName: string;
    phoneNumber: string;
    email?: string | null;
    tableId: number;
    reservationDate: string;
    reservationTime: string;
    partySize: number;
    duration: number;
    status: ReservationStatus;
    specialRequest?: string | null;
    depositAmount?: number | null;
    table?: {
        tableId: number;
        tableNumber: string;
        capacity: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateReservationDto {
    customerName: string;
    phoneNumber: string;
    email?: string;
    tableId: number;
    reservationDate: string;
    reservationTime: string;
    partySize: number;
    duration?: number;
    specialRequest?: string;
    depositAmount?: number;
}

export interface UpdateReservationDto extends Partial<CreateReservationDto> {}

export interface ReservationFilters {
    status?: ReservationStatus;
    tableId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export interface AvailableTable {
    tableId: number;
    tableNumber: string;
    capacity: number;
    location?: string;
}
