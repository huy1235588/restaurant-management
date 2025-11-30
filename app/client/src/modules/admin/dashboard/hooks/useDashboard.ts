import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/dashboard.service';

/**
 * Query keys for dashboard
 */
export const dashboardKeys = {
    all: ['dashboard'] as const,
    status: () => [...dashboardKeys.all, 'status'] as const,
    recentActivity: (limit?: number) =>
        [...dashboardKeys.all, 'recent-activity', limit] as const,
};

/**
 * Hook to fetch dashboard status
 */
export const useDashboardStatus = () => {
    return useQuery({
        queryKey: dashboardKeys.status(),
        queryFn: () => dashboardApi.getStatus(),
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Auto-refresh every 60 seconds
        refetchOnWindowFocus: true,
    });
};

/**
 * Hook to fetch recent activity
 */
export const useRecentActivity = (limit: number = 10) => {
    return useQuery({
        queryKey: dashboardKeys.recentActivity(limit),
        queryFn: () => dashboardApi.getRecentActivity({ limit }),
        staleTime: 30000,
        refetchInterval: 60000,
        refetchOnWindowFocus: true,
    });
};
