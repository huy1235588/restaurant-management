'use client';

import { useTranslation } from 'react-i18next';
import { DollarSign, ShoppingCart, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp as TrendingUpIcon, TrendingDown, Minus } from 'lucide-react';
import type { TodayStatsData } from '../types';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    iconColor: string;
    loading?: boolean;
    formatValue?: (value: number) => string;
}

function StatCard({
    title,
    value,
    change,
    icon: Icon,
    iconColor,
    loading,
    formatValue,
}: StatCardProps) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const displayValue = formatValue ? formatValue(numValue) : numValue.toLocaleString();
    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;
    const isNeutral = change === undefined || change === 0;

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        <p className="text-2xl font-bold tracking-tight">
                            {displayValue}
                        </p>
                        {change !== undefined && (
                            <div
                                className={cn(
                                    'flex items-center gap-1 text-sm font-medium',
                                    isPositive && 'text-green-600 dark:text-green-400',
                                    isNegative && 'text-red-600 dark:text-red-400',
                                    isNeutral && 'text-muted-foreground'
                                )}
                            >
                                {isPositive && <TrendingUpIcon className="h-4 w-4" />}
                                {isNegative && <TrendingDown className="h-4 w-4" />}
                                {isNeutral && <Minus className="h-4 w-4" />}
                                <span>
                                    {isPositive && '+'}
                                    {change}%
                                </span>
                                <span className="text-muted-foreground font-normal">
                                    {t('dashboard.vsYesterday')}
                                </span>
                            </div>
                        )}
                    </div>
                    <div
                        className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-full',
                            iconColor
                        )}
                    >
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface TodayStatsProps {
    stats?: TodayStatsData;
    loading?: boolean;
}

export function TodayStats({ stats, loading }: TodayStatsProps) {
    const { t } = useTranslation();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title={t('dashboard.todayRevenue')}
                value={stats?.revenue ?? 0}
                change={stats?.comparison.revenue}
                icon={DollarSign}
                iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                loading={loading}
                formatValue={formatCurrency}
            />
            <StatCard
                title={t('dashboard.todayOrders')}
                value={stats?.orders ?? 0}
                change={stats?.comparison.orders}
                icon={ShoppingCart}
                iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                loading={loading}
            />
            <StatCard
                title={t('dashboard.pendingReservations')}
                value={stats?.reservations ?? 0}
                change={stats?.comparison.reservations}
                icon={Calendar}
                iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                loading={loading}
            />
            <StatCard
                title={t('dashboard.stats.avgOrderValue')}
                value={stats?.avgOrderValue ?? 0}
                change={stats?.comparison.avgOrderValue}
                icon={TrendingUp}
                iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                loading={loading}
                formatValue={formatCurrency}
            />
        </div>
    );
}
