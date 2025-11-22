import axiosInstance from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types";
import {
    Reservation,
    CreateReservationDto,
    UpdateReservationDto,
    ReservationFilters,
    AvailableTable,
} from "../types";

export const reservationApi = {
    getAll: async (
        params?: ReservationFilters & { page?: number; limit?: number }
    ): Promise<PaginatedResponse<Reservation>> => {
        const response = await axiosInstance.get<
            ApiResponse<PaginatedResponse<Reservation>>
        >("/reservations", { params });
        return response.data.data;
    },

    getById: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.get<ApiResponse<Reservation>>(
            `/reservations/${id}`
        );
        return response.data.data;
    },

    create: async (data: CreateReservationDto): Promise<Reservation> => {
        const response = await axiosInstance.post<ApiResponse<Reservation>>(
            "/reservations",
            data
        );
        return response.data.data;
    },

    update: async (
        id: number,
        data: UpdateReservationDto
    ): Promise<Reservation> => {
        const response = await axiosInstance.patch<ApiResponse<Reservation>>(
            `/reservations/${id}`,
            data
        );
        return response.data.data;
    },

    confirm: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.post<ApiResponse<Reservation>>(
            `/reservations/${id}/confirm`
        );
        return response.data.data;
    },

    seat: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.post<ApiResponse<Reservation>>(
            `/reservations/${id}/seat`
        );
        return response.data.data;
    },

    noShow: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.post<ApiResponse<Reservation>>(
            `/reservations/${id}/no-show`
        );
        return response.data.data;
    },

    complete: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.post<ApiResponse<Reservation>>(
            `/reservations/${id}/complete`
        );
        return response.data.data;
    },

    cancel: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/reservations/${id}`);
    },

    getAvailableTables: async (params: {
        date: string;
        time: string;
        duration: number;
        partySize: number;
    }): Promise<AvailableTable[]> => {
        const response = await axiosInstance.get<ApiResponse<AvailableTable[]>>(
            "/reservations/available-tables",
            { params }
        );
        return response.data.data;
    },
};
