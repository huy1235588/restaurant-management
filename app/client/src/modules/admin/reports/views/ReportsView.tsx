'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, subDays } from 'date-fns';
import {
    DollarSign,
    ShoppingCart,
    Calendar,
    TrendingUp,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    ReportCard,
    RevenueChart,
    TopItemsChart,
    PaymentMethodChart,
    OrdersChart,
    DateRangePicker,
} from '../components';
import {
    useOverviewReport,
    useRevenueReport,
    useTopItemsReport,
    usePaymentMethodsReport,
    useOrdersReport,
} from '../hooks';
import { DateRange } from '../types';

export function ReportsView() {
    const { t } = useTranslation();
    const today = new Date();

    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: format(subDays(today, 6), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        preset: 'week',
    });

    const queryParams = useMemo(
        () => ({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
        }),
        [dateRange]
    );

    // Fetch all reports
    const {
        data: overview,
        isLoading: overviewLoading,
        refetch: refetchOverview,
    } = useOverviewReport(queryParams);

    const {
        data: revenue,
        isLoading: revenueLoading,
        refetch: refetchRevenue,
    } = useRevenueReport({ ...queryParams, groupBy: 'day' });

    const {
        data: topItems,
        isLoading: topItemsLoading,
        refetch: refetchTopItems,
    } = useTopItemsReport({ ...queryParams, limit: 10 });

    const {
        data: paymentMethods,
        isLoading: paymentMethodsLoading,
        refetch: refetchPaymentMethods,
    } = usePaymentMethodsReport(queryParams);

    const {
        data: orders,
        isLoading: ordersLoading,
        refetch: refetchOrders,
    } = useOrdersReport({ ...queryParams, groupBy: 'hour' });

    const isLoading =
        overviewLoading ||
        revenueLoading ||
        topItemsLoading ||
        paymentMethodsLoading ||
        ordersLoading;

    const handleRefresh = () => {
        refetchOverview();
        refetchRevenue();
        refetchTopItems();
        refetchPaymentMethods();
        refetchOrders();
    };

    const formatCurrency = (value: number | string) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(num);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {t('reports.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('reports.subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
                    loading={overviewLoading}
                    formatValue={formatCurrency}
                />
                <ReportCard
                    title={t('reports.totalOrders')}
                    value={overview?.orders ?? 0}
                    change={overview?.comparison.orders}
                    icon={ShoppingCart}
                    iconColor="text-blue-600"
                    loading={overviewLoading}
                />
                <ReportCard
                    title={t('reports.totalReservations')}
                    value={overview?.reservations ?? 0}
                    change={overview?.comparison.reservations}
                    icon={Calendar}
                    iconColor="text-purple-600"
                    loading={overviewLoading}
                />
                <ReportCard
                    title={t('reports.avgOrderValue')}
                    value={overview?.avgOrderValue ?? 0}
                    change={overview?.comparison.avgOrderValue}
                    icon={TrendingUp}
                    iconColor="text-orange-600"
                    loading={overviewLoading}
                    formatValue={formatCurrency}
                />
            </div>

            {/* Revenue Chart */}
            <RevenueChart
                data={revenue?.data ?? []}
                loading={revenueLoading}
            />

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Items */}
                <TopItemsChart
                    data={topItems?.items ?? []}
                    loading={topItemsLoading}
                />

                {/* Payment Methods */}
                <PaymentMethodChart
                    data={paymentMethods?.methods ?? []}
                    loading={paymentMethodsLoading}
                />
            </div>

            {/* Orders by Hour */}
            <OrdersChart
                data={orders?.data ?? []}
                loading={ordersLoading}
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
