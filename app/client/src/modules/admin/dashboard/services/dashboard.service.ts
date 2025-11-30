import axiosInstance from '@/lib/axios';
import {
    ApiResponse,
    DashboardStatus,
    RecentActivityResponse,
    RecentActivityQueryParams,
} from '../types';

export const dashboardApi = {
    /**
     * Get current operational status (tables + kitchen)
     */
    getStatus: async (): Promise<DashboardStatus> => {
        const response = await axiosInstance.get<ApiResponse<DashboardStatus>>(
            '/dashboard/status'
        );
        return response.data.data;
    },

    /**
     * Get recent activity
     */
    getRecentActivity: async (
        params?: RecentActivityQueryParams
    ): Promise<RecentActivityResponse> => {
        const response = await axiosInstance.get<ApiResponse<RecentActivityResponse>>(
            '/dashboard/recent-activity',
            { params }
        );
        return response.data.data;
    },
};
