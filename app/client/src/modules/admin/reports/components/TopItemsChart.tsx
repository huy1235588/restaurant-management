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
    Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TopItemData } from '../types';

interface TopItemsChartProps {
    data: TopItemData[];
    loading?: boolean;
    title?: string;
}

const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

export function TopItemsChart({ data, loading = false, title }: TopItemsChartProps) {
    const { t } = useTranslation();

    const chartData = useMemo(() => {
        return data.map((item, index) => ({
            ...item,
            displayName: item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name,
            color: COLORS[index % COLORS.length],
        }));
    }, [data]);

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
                    {title || t('reports.topSellingItems')}
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
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                type="number"
                                className="text-xs"
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <YAxis
                                type="category"
                                dataKey="displayName"
                                className="text-xs"
                                tick={{ fill: 'var(--muted-foreground)' }}
                                width={100}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number, name: string) => {
                                    if (name === 'quantity') {
                                        return [value, t('reports.quantitySold')];
                                    }
                                    return [
                                        new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(value),
                                        t('reports.revenue'),
                                    ];
                                }}
                                labelFormatter={(label) => label}
                            />
                            <Bar dataKey="quantity" name="quantity" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
