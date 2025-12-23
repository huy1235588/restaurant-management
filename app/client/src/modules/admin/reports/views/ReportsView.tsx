'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, subDays, isValid, parseISO } from 'date-fns';
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
    // DateRangePicker,
    DashboardSkeleton,
    ExportButton,
} from '../components';
import { useDashboardReport } from '../hooks';
import { DateRangePicker } from '@/components/ui/date-range-picker';

export function ReportsView() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const today = new Date();

    // Map i18n language to locale format
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

    // Initialize date range from URL or default to last 7 days
    const getInitialDateRange = () => {
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        if (startDateParam && endDateParam) {
            const startDate = parseISO(startDateParam);
            const endDate = parseISO(endDateParam);

            if (isValid(startDate) && isValid(endDate)) {
                return {
                    startDate: format(startDate, 'yyyy-MM-dd'),
                    endDate: format(endDate, 'yyyy-MM-dd'),
                };
            }
        }

        return {
            startDate: format(subDays(today, 6), 'yyyy-MM-dd'),
            endDate: format(today, 'yyyy-MM-dd'),
        };
    };

    const [dateRange, setDateRange] = useState(getInitialDateRange);

    const [forceRefresh, setForceRefresh] = useState(false);

    // Update URL when date range changes
    useEffect(() => {
        const params = new URLSearchParams();
        params.set('startDate', dateRange.startDate);
        params.set('endDate', dateRange.endDate);

        router.replace(`?${params.toString()}`, { scroll: false });
    }, [dateRange, router]);

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
                    <DateRangePicker
                        initialDateFrom={parseISO(dateRange.startDate)}
                        initialDateTo={parseISO(dateRange.endDate)}
                        onUpdate={(values) => {
                            if (values.range.from && values.range.to) {
                                setDateRange({
                                    startDate: format(values.range.from, 'yyyy-MM-dd'),
                                    endDate: format(values.range.to, 'yyyy-MM-dd'),
                                });
                            }
                        }}
                        align="center"
                        locale={locale}
                        showCompare={false}
                        translations={{
                            today: t('dateRangePicker.today'),
                            yesterday: t('dateRangePicker.yesterday'),
                            last7: t('dateRangePicker.last7'),
                            last14: t('dateRangePicker.last14'),
                            last30: t('dateRangePicker.last30'),
                            thisWeek: t('dateRangePicker.thisWeek'),
                            lastWeek: t('dateRangePicker.lastWeek'),
                            thisMonth: t('dateRangePicker.thisMonth'),
                            lastMonth: t('dateRangePicker.lastMonth'),
                            compare: t('dateRangePicker.compare'),
                            cancel: t('dateRangePicker.cancel'),
                            update: t('dateRangePicker.update'),
                            selectPreset: t('dateRangePicker.selectPreset'),
                        }}
                    />
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
            {/* {orders?.summary && (
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
            )} */}
        </div>
    );
}
