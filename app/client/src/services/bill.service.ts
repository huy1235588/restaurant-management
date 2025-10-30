import axiosInstance from '@/lib/axios';
import { Bill, Payment, ApiResponse, PaginatedResponse, PaymentMethod } from '@/types';

export const billApi = {
    // Get all bills
    getAll: async (params?: {
        date?: string;
        paymentStatus?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Bill>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Bill>>>(
            '/bills',
            { params }
        );
        return response.data.data;
    },

    // Get bill by ID
    getById: async (id: number): Promise<Bill> => {
        const response = await axiosInstance.get<ApiResponse<Bill>>(`/bills/${id}`);
        return response.data.data;
    },

    // Create bill
    create: async (data: { orderId: number; notes?: string }): Promise<Bill> => {
        const response = await axiosInstance.post<ApiResponse<Bill>>('/bills', data);
        return response.data.data;
    },

    // Update bill
    update: async (id: number, data: Partial<Bill>): Promise<Bill> => {
        const response = await axiosInstance.put<ApiResponse<Bill>>(`/bills/${id}`, data);
        return response.data.data;
    },

    // Process payment
    processPayment: async (
        id: number,
        data: {
            paymentMethod: PaymentMethod;
            paymentAmount: number;
            transactionId?: string;
            notes?: string;
        }
    ): Promise<Bill> => {
        const response = await axiosInstance.patch<ApiResponse<Bill>>(
            `/bills/${id}/payment`,
            data
        );
        return response.data.data;
    },

    // Delete bill
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/bills/${id}`);
    },
};

export const paymentApi = {
    // Get payments by bill
    getByBill: async (billId: number): Promise<Payment[]> => {
        const response = await axiosInstance.get<ApiResponse<Payment[]>>(
            `/payments/bill/${billId}`
        );
        return response.data.data;
    },
};
