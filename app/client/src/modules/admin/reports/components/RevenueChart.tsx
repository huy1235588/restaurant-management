'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueDataPoint } from '../types';
import { format, parseISO } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface RevenueChartProps {
    data: RevenueDataPoint[];
    loading?: boolean;
    title?: string;
}

export function RevenueChart({ data, loading = false, title }: RevenueChartProps) {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'vi' ? vi : enUS;

    const chartData = useMemo(() => {
        return data.map((point) => ({
            ...point,
            displayDate: format(parseISO(point.date), 'dd/MM', { locale }),
            formattedRevenue: new Intl.NumberFormat('vi-VN').format(point.revenue),
        }));
    }, [data, locale]);

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

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
                    {title || t('reports.revenueOverTime')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        {t('common.noData')}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="displayDate"
                                className="text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                                tickFormatter={formatCurrency}
                                className="text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number) => [
                                    new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(value),
                                    t('reports.revenue'),
                                ]}
                                labelFormatter={(label) => `${t('common.date')}: ${label}`}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                name={t('reports.revenue')}
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
