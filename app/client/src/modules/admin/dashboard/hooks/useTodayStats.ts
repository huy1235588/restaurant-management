import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { reportsApi } from '../../reports/services/reports.service';
import { reportKeys } from '../../reports/hooks/useReports';

/**
 * Hook to fetch today's stats using reports overview API
 */
export const useTodayStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const params = {
        startDate: today,
        endDate: today,
    };

    return useQuery({
        queryKey: reportKeys.overview(params),
        queryFn: () => reportsApi.getOverview(params),
        staleTime: 60000, // 1 minute
        refetchInterval: 120000, // Auto-refresh every 2 minutes
        refetchOnWindowFocus: true,
    });
};
