import axiosInstance from "@/lib/axios";
import {
    Bill,
    CreateBillDto,
    ApplyDiscountDto,
    ProcessPaymentDto,
    PaginatedBills,
    ApiResponse,
    BillFilterOptions,
    PaymentResult,
} from "../types";

export const billingApi = {
    /**
     * Get all bills with pagination and filters
     */
    getAll: async (params?: BillFilterOptions): Promise<PaginatedBills> => {
        const response = await axiosInstance.get<
            PaginatedBills & { message?: string }
        >("/bills", { params });
        return {
            data: response.data.data,
            meta: response.data.meta,
        };
    },

    /**
     * Get bill by ID
     */
    getById: async (id: number): Promise<Bill> => {
        const response = await axiosInstance.get<ApiResponse<Bill>>(
            `/bills/${id}`
        );
        return response.data.data;
    },

    /**
     * Create bill from order
     */
    create: async (data: CreateBillDto): Promise<Bill> => {
        const response = await axiosInstance.post<ApiResponse<Bill>>(
            "/bills",
            data
        );
        return response.data.data;
    },

    /**
     * Apply discount to bill
     */
    applyDiscount: async (id: number, data: ApplyDiscountDto): Promise<Bill> => {
        const response = await axiosInstance.patch<ApiResponse<Bill>>(
            `/bills/${id}/discount`,
            data
        );
        return response.data.data;
    },

    /**
     * Process payment for bill
     */
    processPayment: async (
        id: number,
        data: ProcessPaymentDto
    ): Promise<PaymentResult> => {
        const response = await axiosInstance.post<ApiResponse<PaymentResult>>(
            `/bills/${id}/payment`,
            data
        );
        return response.data.data;
    },

    /**
     * Void/delete bill (admin only)
     */
    voidBill: async (id: number, reason: string): Promise<void> => {
        await axiosInstance.delete(`/bills/${id}`, {
            data: { reason },
        });
    },
};
