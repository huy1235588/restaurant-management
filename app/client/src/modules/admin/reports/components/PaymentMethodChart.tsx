'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentMethodData, PaymentMethod } from '../types';

interface PaymentMethodChartProps {
    data: PaymentMethodData[];
    loading?: boolean;
    title?: string;
}

const COLORS = {
    cash: '#22c55e', // green
    card: '#3b82f6', // blue
    momo: '#ec4899', // pink
    bank_transfer: '#f59e0b', // amber
};

export function PaymentMethodChart({
    data,
    loading = false,
    title,
}: PaymentMethodChartProps) {
    const { t } = useTranslation();

    const chartData = useMemo(() => {
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        return data.map((item) => ({
            ...item,
            name: t(`reports.paymentMethodLabels.${item.method}`) || item.method,
            color: COLORS[item.method] || '#6b7280',
            percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0',
        }));
    }, [data, t]);

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
                    {title || t('reports.paymentMethods')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        {t('common.noData')}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, payload }) => `${name}: ${payload?.percentage || 0}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="amount"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
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
                                    t('reports.amount'),
                                ]}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
