'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, subDays } from 'date-fns';
import {
    DollarSign,
    ShoppingCart,
    Calendar,
    TrendingUp,
    RefreshCw,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ReportCard,
    RevenueChart,
    TopItemsChart,
    PaymentMethodChart,
    OrdersChart,
    DateRangePicker,
    DashboardSkeleton,
    ExportButton,
} from '../components';
import { useDashboardReport, usePrefetchDashboard } from '../hooks';
import { DateRange } from '../types';

export function ReportsView() {
    const { t } = useTranslation();
    const today = new Date();

    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: format(subDays(today, 6), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        preset: 'week',
    });

    const [forceRefresh, setForceRefresh] = useState(false);

    const queryParams = useMemo(
        () => ({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            refresh: forceRefresh,
        }),
        [dateRange, forceRefresh]
    );

    // Use batch dashboard hook instead of 5 separate hooks
    const {
        data: dashboard,
        isLoading,
        isFetching,
        refetch,
    } = useDashboardReport(queryParams);

    // Prefetch common date ranges
    const prefetch = usePrefetchDashboard();

    useEffect(() => {
        // Prefetch today's data
        prefetch({
            startDate: format(today, 'yyyy-MM-dd'),
            endDate: format(today, 'yyyy-MM-dd'),
        });
        // Prefetch last 30 days
        prefetch({
            startDate: format(subDays(today, 29), 'yyyy-MM-dd'),
            endDate: format(today, 'yyyy-MM-dd'),
        });
    }, [prefetch, today]);

    // Reset forceRefresh after fetch
    useEffect(() => {
        if (!isFetching && forceRefresh) {
            setForceRefresh(false);
        }
    }, [isFetching, forceRefresh]);

    const handleRefresh = () => {
        setForceRefresh(true);
        refetch();
    };

    const formatCurrency = (value: number | string) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(num);
    };

    // Show full skeleton on initial load
    if (isLoading && !dashboard) {
        return <DashboardSkeleton />;
    }

    const overview = dashboard?.overview;
    const revenue = dashboard?.revenue;
    const topItems = dashboard?.topItems;
    const paymentMethods = dashboard?.paymentMethods;
    const orders = dashboard?.orders;
    const isCached = dashboard?.cached;
    const cachedAt = dashboard?.cachedAt;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t('reports.title')}
                        </h1>
                        {isCached && cachedAt && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="secondary" className="gap-1">
                                            <Clock className="h-3 w-3" />
                                            {t('reports.cached')}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {t('reports.cachedAt', {
                                                time: format(new Date(cachedAt), 'HH:mm:ss'),
                                            })}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    <p className="text-muted-foreground">
                        {t('reports.subtitle')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                    <ExportButton
                        params={{
                            startDate: dateRange.startDate,
                            endDate: dateRange.endDate,
                        }}
                        disabled={isLoading}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ReportCard
                    title={t('reports.totalRevenue')}
                    value={overview?.revenue ?? 0}
                    change={overview?.comparison.revenue}
                    icon={DollarSign}
                    iconColor="text-green-600"
                    loading={isFetching && !dashboard}
                    formatValue={formatCurrency}
                />
                <ReportCard
                    title={t('reports.totalOrders')}
                    value={overview?.orders ?? 0}
                    change={overview?.comparison.orders}
                    icon={ShoppingCart}
                    iconColor="text-blue-600"
                    loading={isFetching && !dashboard}
                />
                <ReportCard
                    title={t('reports.totalReservations')}
                    value={overview?.reservations ?? 0}
                    change={overview?.comparison.reservations}
                    icon={Calendar}
                    iconColor="text-purple-600"
                    loading={isFetching && !dashboard}
                />
                <ReportCard
                    title={t('reports.avgOrderValue')}
                    value={overview?.avgOrderValue ?? 0}
                    change={overview?.comparison.avgOrderValue}
                    icon={TrendingUp}
                    iconColor="text-orange-600"
                    loading={isFetching && !dashboard}
                    formatValue={formatCurrency}
                />
            </div>

            {/* Revenue Chart */}
            <RevenueChart
                data={revenue?.data ?? []}
                loading={isFetching && !dashboard}
            />

            {/* Charts Grid - Stack on mobile */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Items */}
                <TopItemsChart
                    data={topItems?.items ?? []}
                    loading={isFetching && !dashboard}
                />

                {/* Payment Methods */}
                <PaymentMethodChart
                    data={paymentMethods?.methods ?? []}
                    loading={isFetching && !dashboard}
                />
            </div>

            {/* Orders by Hour */}
            <OrdersChart
                data={orders?.data ?? []}
                loading={isFetching && !dashboard}
                groupBy="hour"
            />

            {/* Summary Stats */}
            {orders?.summary && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            {t('reports.totalOrdersInPeriod')}
                        </p>
                        <p className="text-2xl font-bold">{orders.summary.totalOrders}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            {t('reports.totalAmountInPeriod')}
                        </p>
                        <p className="text-2xl font-bold">
                            {formatCurrency(orders.summary.totalAmount)}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            {t('reports.avgOrderValue')}
                        </p>
                        <p className="text-2xl font-bold">
                            {formatCurrency(orders.summary.avgOrderValue)}
                        </p>
                    </div>
                    {orders.summary.avgPrepTime && (
                        <div className="rounded-lg border bg-card p-4">
                            <p className="text-sm text-muted-foreground">
                                {t('reports.avgPrepTime')}
                            </p>
                            <p className="text-2xl font-bold">
                                {orders.summary.avgPrepTime} {t('common.minutes')}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
