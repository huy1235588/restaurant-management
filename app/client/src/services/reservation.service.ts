import axiosInstance from '@/lib/axios';
import {
    Reservation,
    ReservationFormData,
    ApiResponse,
    PaginatedResponse,
    ReservationStatus
} from '@/types';

export const reservationApi = {
    // Get all reservations
    getAll: async (params?: {
        status?: ReservationStatus;
        date?: string;
        tableId?: number;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Reservation>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Reservation>>>(
            '/reservations',
            { params }
        );
        return response.data.data;
    },

    // Get reservation by ID
    getById: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.get<ApiResponse<Reservation>>(
            `/reservations/${id}`
        );
        return response.data.data;
    },

    // Create reservation
    create: async (data: ReservationFormData): Promise<Reservation> => {
        const response = await axiosInstance.post<ApiResponse<Reservation>>(
            '/reservations',
            data
        );
        return response.data.data;
    },

    // Update reservation
    update: async (id: number, data: Partial<ReservationFormData>): Promise<Reservation> => {
        const response = await axiosInstance.put<ApiResponse<Reservation>>(
            `/reservations/${id}`,
            data
        );
        return response.data.data;
    },

    // Update reservation status
    updateStatus: async (id: number, status: ReservationStatus): Promise<Reservation> => {
        const response = await axiosInstance.patch<ApiResponse<Reservation>>(
            `/reservations/${id}/status`,
            { status }
        );
        return response.data.data;
    },

    // Delete reservation
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/reservations/${id}`);
    },
};
