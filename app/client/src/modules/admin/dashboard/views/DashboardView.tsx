'use client';

import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
    TodayStats,
    TableOverview,
    KitchenQueue,
    QuickActions,
    RecentActivity,
} from '../components';
import { useTodayStats } from '../hooks/useTodayStats';
import { useDashboardStatus, useRecentActivity } from '../hooks/useDashboard';

export function DashboardView() {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Fetch data
    const {
        data: todayStats,
        isLoading: statsLoading,
        refetch: refetchStats,
    } = useTodayStats();

    const {
        data: status,
        isLoading: statusLoading,
        refetch: refetchStatus,
    } = useDashboardStatus();

    const {
        data: activityData,
        isLoading: activityLoading,
        refetch: refetchActivity,
    } = useRecentActivity(10);

    const isLoading = statsLoading || statusLoading || activityLoading;

    const handleRefresh = () => {
        refetchStats();
        refetchStatus();
        refetchActivity();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {t('dashboard.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('dashboard.welcomeMessage', { name: user?.fullName || user?.username || '' })}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                </Button>
            </div>

            {/* Today's Stats */}
            <TodayStats stats={todayStats} loading={statsLoading} />

            {/* Quick Actions */}
            <QuickActions />

            {/* Status Section: Tables & Kitchen */}
            <div className="grid gap-6 md:grid-cols-2">
                <TableOverview tables={status?.tables} loading={statusLoading} />
                <KitchenQueue kitchen={status?.kitchen} loading={statusLoading} />
            </div>

            {/* Recent Activity */}
            <RecentActivity
                activities={activityData?.activities}
                loading={activityLoading}
            />
        </div>
    );
}
