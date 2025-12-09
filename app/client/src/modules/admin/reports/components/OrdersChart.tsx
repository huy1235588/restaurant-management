'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OrdersDataPoint } from '../types';

interface OrdersChartProps {
    data: OrdersDataPoint[];
    loading?: boolean;
    title?: string;
    groupBy?: 'hour' | 'status';
}

export function OrdersChart({
    data,
    loading = false,
    title,
    groupBy = 'hour',
}: OrdersChartProps) {
    const { t } = useTranslation();

    const chartData = useMemo(() => {
        return data.map((point) => ({
            ...point,
            displayLabel: groupBy === 'status' ? t(`order.status.${point.label}`) : point.label,
        }));
    }, [data, groupBy, t]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    {title || (groupBy === 'hour' ? t('reports.ordersByHour') : t('reports.ordersByStatus'))}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        {t('common.noData')}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="displayLabel"
                                className="text-xs"
                                tick={{ fill: 'var(--muted-foreground)' }}
                                interval={groupBy === 'hour' ? 2 : 0}
                            />
                            <YAxis
                                className="text-xs"
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number, name: string) => {
                                    if (name === 'count') {
                                        return [value, t('reports.orderCount')];
                                    }
                                    return [
                                        new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(value),
                                        t('reports.amount'),
                                    ];
                                }}
                            />
                            <Bar
                                dataKey="count"
                                name="count"
                                fill="var(--primary)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
