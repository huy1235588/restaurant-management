import axiosInstance from '@/lib/axios';
import {
    Reservation,
    ReservationFormData,
    CreateReservationDto,
    UpdateReservationDto,
    Customer,
    CreateCustomerDto,
    UpdateCustomerDto,
    AvailabilityCheck,
    ApiResponse,
    PaginatedResponse,
    ReservationStatus
} from '@/types';

export const reservationApi = {
    // ========== Reservation CRUD ==========
    
    // Get all reservations with filters
    getAll: async (params?: {
        page?: number;
        limit?: number;
        status?: ReservationStatus | ReservationStatus[];
        date?: string;
        startDate?: string;
        endDate?: string;
        tableId?: number;
        floor?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
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

    // Get reservation by code
    getByCode: async (code: string): Promise<Reservation> => {
        const response = await axiosInstance.get<ApiResponse<Reservation>>(
            `/reservations/code/${code}`
        );
        return response.data.data;
    },

    // Create reservation
    create: async (data: CreateReservationDto): Promise<Reservation> => {
        const response = await axiosInstance.post<ApiResponse<Reservation>>(
            '/reservations',
            data
        );
        return response.data.data;
    },

    // Update reservation
    update: async (id: number, data: UpdateReservationDto): Promise<Reservation> => {
        const response = await axiosInstance.put<ApiResponse<Reservation>>(
            `/reservations/${id}`,
            data
        );
        return response.data.data;
    },

    // Delete reservation
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/reservations/${id}`);
    },

    // ========== Status Management ==========
    
    // Cancel reservation
    cancel: async (id: number, reason?: string): Promise<Reservation> => {
        const response = await axiosInstance.patch<ApiResponse<Reservation>>(
            `/reservations/${id}/cancel`,
            { reason }
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

    // Mark as seated
    markAsSeated: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.patch<ApiResponse<Reservation>>(
            `/reservations/${id}/seated`
        );
        return response.data.data;
    },

    // Mark as completed
    markAsCompleted: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.patch<ApiResponse<Reservation>>(
            `/reservations/${id}/complete`
        );
        return response.data.data;
    },

    // Mark as no-show
    markAsNoShow: async (id: number): Promise<Reservation> => {
        const response = await axiosInstance.patch<ApiResponse<Reservation>>(
            `/reservations/${id}/no-show`
        );
        return response.data.data;
    },

    // ========== Availability ==========
    
    // Check table availability
    checkAvailability: async (params: {
        date: string;
        partySize: number;
        duration?: number;
        floor?: number;
    }): Promise<AvailabilityCheck> => {
        const response = await axiosInstance.get<ApiResponse<AvailabilityCheck>>(
            '/reservations/check-availability',
            { params }
        );
        return response.data.data;
    },

    // ========== Customer Management ==========
    
    // Get all customers
    getAllCustomers: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isVip?: boolean;
    }): Promise<PaginatedResponse<Customer>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Customer>>>(
            '/customers',
            { params }
        );
        return response.data.data;
    },

    // Get customer by ID
    getCustomerById: async (id: number): Promise<Customer> => {
        const response = await axiosInstance.get<ApiResponse<Customer>>(
            `/customers/${id}`
        );
        return response.data.data;
    },

    // Create customer
    createCustomer: async (data: CreateCustomerDto): Promise<Customer> => {
        const response = await axiosInstance.post<ApiResponse<Customer>>(
            '/customers',
            data
        );
        return response.data.data;
    },

    // Update customer
    updateCustomer: async (id: number, data: UpdateCustomerDto): Promise<Customer> => {
        const response = await axiosInstance.patch<ApiResponse<Customer>>(
            `/customers/${id}`,
            data
        );
        return response.data.data;
    },

    // Get customer reservation history
    getCustomerHistory: async (id: number): Promise<Reservation[]> => {
        const response = await axiosInstance.get<ApiResponse<Reservation[]>>(
            `/customers/${id}/history`
        );
        return response.data.data;
    },

    // Search customers (autocomplete)
    searchCustomers: async (query: string): Promise<Customer[]> => {
        const response = await axiosInstance.get<ApiResponse<Customer[]>>(
            '/customers/search',
            { params: { query } }
        );
        return response.data.data;
    },

    // Get reservations by phone number
    getByPhone: async (phoneNumber: string): Promise<Reservation[]> => {
        const response = await axiosInstance.get<ApiResponse<Reservation[]>>(
            `/reservations/phone/${phoneNumber}`
        );
        return response.data.data;
    },

    // ========== Bulk Operations ==========
    
    // Bulk confirm reservations
    bulkConfirm: async (ids: number[]): Promise<{ success: number; failed: number }> => {
        const response = await axiosInstance.post<ApiResponse<{ success: number; failed: number }>>(
            '/reservations/bulk/confirm',
            { ids }
        );
        return response.data.data;
    },

    // Bulk cancel reservations
    bulkCancel: async (ids: number[], reason?: string): Promise<{ success: number; failed: number }> => {
        const response = await axiosInstance.post<ApiResponse<{ success: number; failed: number }>>(
            '/reservations/bulk/cancel',
            { ids, reason }
        );
        return response.data.data;
    },
};
