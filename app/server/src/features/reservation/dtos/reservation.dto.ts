export interface CreateReservationDto {
    customerName: string;
    phoneNumber: string;
    email?: string;
    tableId: number;
    reservationDate: string;
    reservationTime: string;
    duration?: number;
    headCount: number;
    specialRequest?: string;
    depositAmount?: number;
    notes?: string;
}

export interface UpdateReservationDto {
    customerName?: string;
    phoneNumber?: string;
    email?: string;
    tableId?: number;
    reservationDate?: string;
    reservationTime?: string;
    duration?: number;
    headCount?: number;
    specialRequest?: string;
    depositAmount?: number;
    status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
    notes?: string;
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
    status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    table?: {
        tableId: number;
        tableNumber: string;
        capacity: number;
    };
}
