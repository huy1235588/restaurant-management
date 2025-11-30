import axiosInstance from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types';
import { Staff, UpdateStaffData, Role, CreateStaffWithAccountData } from '../types';

// Helper to normalize salary from string to number
const normalizeStaff = (staff: any): Staff => ({
    ...staff,
    salary: staff.salary
        ? typeof staff.salary === 'string'
            ? parseFloat(staff.salary)
            : staff.salary
        : staff.salary,
});

const normalizeStaffList = (items: any[]): Staff[] => items.map(normalizeStaff);

export const staffApi = {
    // Get all staff with pagination and filters
    getAll: async (params?: {
        page?: number;
        limit?: number;
        role?: Role;
        isActive?: boolean;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<PaginatedResponse<Staff>> => {
        const response = await axiosInstance.get<
            ApiResponse<{
                items: Staff[];
                total: number;
                page: number;
                limit: number;
            }>
        >('/staff', { params });

        const data = response.data.data;
        return {
            items: normalizeStaffList(data.items),
            pagination: {
                page: data.page,
                limit: data.limit,
                total: data.total,
                totalPages: Math.ceil(data.total / data.limit),
            },
        };
    },

    // Get staff by ID
    getById: async (id: number): Promise<Staff> => {
        const response = await axiosInstance.get<ApiResponse<Staff>>(`/staff/${id}`);
        return normalizeStaff(response.data.data);
    },

    // Get staff by role
    getByRole: async (role: Role): Promise<Staff[]> => {
        const response = await axiosInstance.get<ApiResponse<Staff[]>>(`/staff/role/${role}`);
        return normalizeStaffList(response.data.data);
    },

    // Get staff performance
    getPerformance: async (
        id: number,
        params?: { startDate?: string; endDate?: string }
    ): Promise<any> => {
        const response = await axiosInstance.get<ApiResponse<any>>(`/staff/${id}/performance`, {
            params,
        });
        return response.data.data;
    },

    // Create staff with account (new staff registration)
    createWithAccount: async (data: CreateStaffWithAccountData): Promise<Staff> => {
        const response = await axiosInstance.post<ApiResponse<Staff>>('/auth/staff', data);
        return normalizeStaff(response.data.data);
    },

    // Update staff
    update: async (id: number, data: UpdateStaffData): Promise<Staff> => {
        const response = await axiosInstance.put<ApiResponse<Staff>>(`/staff/${id}`, data);
        return normalizeStaff(response.data.data);
    },

    // Update staff role
    updateRole: async (id: number, role: Role): Promise<Staff> => {
        const response = await axiosInstance.patch<ApiResponse<Staff>>(`/staff/${id}/role`, {
            role,
        });
        return normalizeStaff(response.data.data);
    },

    // Activate staff
    activate: async (id: number): Promise<Staff> => {
        const response = await axiosInstance.patch<ApiResponse<Staff>>(`/staff/${id}/activate`);
        return normalizeStaff(response.data.data);
    },

    // Deactivate staff
    deactivate: async (id: number): Promise<Staff> => {
        const response = await axiosInstance.patch<ApiResponse<Staff>>(`/staff/${id}/deactivate`);
        return normalizeStaff(response.data.data);
    },

    // Delete staff
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/staff/${id}`);
    },
};
