import axiosInstance from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types";
import {
    Bill,
    CreateBillDto,
    ApplyDiscountDto,
    ProcessPaymentDto,
    BillFilters,
} from "../types";

export const billingApi = {
    getAll: async (
        params?: BillFilters & { page?: number; limit?: number }
    ): Promise<PaginatedResponse<Bill>> => {
        const response = await axiosInstance.get<
            ApiResponse<PaginatedResponse<Bill>>
        >("/bills", { params });
        return response.data.data;
    },

    getById: async (id: number): Promise<Bill> => {
        const response = await axiosInstance.get<ApiResponse<Bill>>(
            `/bills/${id}`
        );
        return response.data.data;
    },

    create: async (data: CreateBillDto): Promise<Bill> => {
        const response = await axiosInstance.post<ApiResponse<Bill>>(
            "/bills",
            data
        );
        return response.data.data;
    },

    applyDiscount: async (
        id: number,
        data: ApplyDiscountDto
    ): Promise<Bill> => {
        const response = await axiosInstance.patch<ApiResponse<Bill>>(
            `/bills/${id}/discount`,
            data
        );
        return response.data.data;
    },

    processPayment: async (
        id: number,
        data: ProcessPaymentDto
    ): Promise<Bill> => {
        const response = await axiosInstance.post<ApiResponse<Bill>>(
            `/bills/${id}/payment`,
            data
        );
        return response.data.data;
    },

    voidBill: async (id: number, reason: string): Promise<void> => {
        await axiosInstance.delete(`/bills/${id}`, { data: { reason } });
    },
};
