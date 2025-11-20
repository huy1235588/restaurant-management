import { ReservationStatus } from '@prisma/client';

export interface CreateReservationDto {
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
    status?: ReservationStatus;
    notes?: string;
    tags?: string[];
}

export interface UpdateReservationDto {
    customerId?: number;
    customerName?: string;
    phoneNumber?: string;
    email?: string;
    tableId?: number;
    floor?: number;
    preferredTableId?: number;
    reservationDate?: string;
    reservationTime?: string;
    duration?: number;
    headCount?: number;
    specialRequest?: string;
    depositAmount?: number;
    status?: ReservationStatus;
    notes?: string;
    tags?: string[];
    cancellationReason?: string;
}

export interface ReservationResponseDto {
    reservationId: number;
    reservationCode: string;
    customerName: string;
    phoneNumber: string;
    email?: string;
    tableId: number;
    reservationDate: Date;
    reservationTime: Date;
    duration: number;
    headCount: number;
    specialRequest?: string;
    depositAmount?: number;
    status: ReservationStatus;
    notes?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    confirmedAt?: Date | null;
    seatedAt?: Date | null;
    completedAt?: Date | null;
    cancelledAt?: Date | null;
    cancellationReason?: string | null;
    table?: {
        tableId: number;
        tableNumber: string;
        capacity: number;
    };
}
