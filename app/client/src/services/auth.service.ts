import axiosInstance from '@/lib/axios';
import {
    User,
    LoginCredentials,
    AuthResponse,
    ApiResponse
} from '@/types';

export const authApi = {
    // Login
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
            '/auth/login',
            credentials
        );
        
        // Tokens are handled via HttpOnly cookies
        // Only accessToken returned for memory storage
        // DO NOT save to localStorage for security
        
        return response.data.data;
    },

    // Register
    register: async (data: {
        username: string;
        email: string;
        password: string;
        fullName?: string;
        phoneNumber?: string;
    }): Promise<AuthResponse> => {
        const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
            '/auth/register',
            data
        );
        return response.data.data;
    },

    // Get current user
    me: async (): Promise<User> => {
        const response = await axiosInstance.get<ApiResponse<User>>('/auth/me');
        return response.data.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        try {
            await axiosInstance.post('/auth/logout');
        } finally {
            // No localStorage to clear - tokens are in cookies/memory only
        }
    },

    // Logout from all devices
    logoutAll: async (): Promise<void> => {
        try {
            await axiosInstance.post('/auth/logout-all');
        } finally {
            // No localStorage to clear - tokens are in cookies/memory only
        }
    },

    // Refresh token
    refreshToken: async (): Promise<{ accessToken: string }> => {
        const response = await axiosInstance.post<ApiResponse<{ accessToken: string }>>(
            '/auth/refresh'
        );
        
        // Return new access token for memory storage
        // Refresh token is handled via HttpOnly cookie
        return response.data.data;
    },
};
