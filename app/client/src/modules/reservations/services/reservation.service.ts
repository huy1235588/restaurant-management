import axiosInstance from "@/lib/axios";
import {
    Reservation,
    CreateReservationDto,
    UpdateReservationDto,
    CancelReservationDto,
    CheckAvailabilityDto,
    PaginatedResponse,
    ApiResponse,
    ReservationFilterOptions,
    SeatReservationResponse,
} from "../types";

export const reservationApi = {
    // Get all reservations with pagination and filters
    getAll: async (
        params?: ReservationFilterOptions
    ): Promise<PaginatedResponse<Reservation>> => {
        const response = await axiosInstance.get<
            ApiResponse<PaginatedResponse<Reservation>>
        >("/reservations", { params });
        return response.data.data;
    },

    // Get reservation by ID
    getById: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.get<ApiResponse<Reservation>>(
            `/reservations/${id}`
        );
        return response.data.data;
    },

    // Get reservation by code
    getByCode: async (code: string): Promise<Reservation> => {
        const response = await axiosInstance.get<ApiResponse<Reservation>>(
            `/reservations/code/${code}`
        );
        return response.data.data;
    },

    // Get reservations by phone number
    getByPhone: async (phone: string): Promise<Reservation[]> => {
        const response = await axiosInstance.get<ApiResponse<Reservation[]>>(
            `/reservations/phone/${phone}`
        );
        return response.data.data;
    },

    // Check table availability
    checkAvailability: async (params: CheckAvailabilityDto): Promise<any[]> => {
        const response = await axiosInstance.get<ApiResponse<any[]>>(
            "/reservations/check-availability",
            { params }
        );
        return response.data.data;
    },

    // Create new reservation
    create: async (data: CreateReservationDto): Promise<Reservation> => {
        const response = await axiosInstance.post<ApiResponse<Reservation>>(
            "/reservations",
            data
        );
        return response.data.data;
    },

    // Update reservation
    update: async (
        id: number,
        data: UpdateReservationDto
    ): Promise<Reservation> => {
        const response = await axiosInstance.put<ApiResponse<Reservation>>(
            `/reservations/${id}`,
            data
        );
        return response.data.data;
    },

    // Confirm reservation
    confirm: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.patch<ApiResponse<Reservation>>(
            `/reservations/${id}/confirm`
        );
        return response.data.data;
    },

    // Mark as seated (check-in) and auto-create order
    seat: async (id: number): Promise<SeatReservationResponse> => {
        const response = await axiosInstance.patch<
            ApiResponse<SeatReservationResponse>
        >(`/reservations/${id}/seated`);
        return response.data.data;
    },

    // Complete reservation
    complete: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.patch<ApiResponse<Reservation>>(
            `/reservations/${id}/complete`
        );
        return response.data.data;
    },

    // Cancel reservation
    cancel: async (
        id: number,
        data?: CancelReservationDto
    ): Promise<Reservation> => {
        const response = await axiosInstance.patch<ApiResponse<Reservation>>(
            `/reservations/${id}/cancel`,
            data || {}
        );
        return response.data.data;
    },

    // Mark as no-show
    markNoShow: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.patch<ApiResponse<Reservation>>(
            `/reservations/${id}/no-show`
        );
        return response.data.data;
    },
};
