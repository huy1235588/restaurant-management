'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportCardProps {
    title: string;
    value: string | number;
    change?: number; // percentage change
    icon: LucideIcon;
    iconColor?: string;
    loading?: boolean;
    formatValue?: (value: string | number) => string;
}

export function ReportCard({
    title,
    value,
    change,
    icon: Icon,
    iconColor = 'text-primary',
    loading = false,
    formatValue,
}: ReportCardProps) {
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

    const displayValue = formatValue ? formatValue(value) : value;
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
                                {isPositive && <TrendingUp className="h-4 w-4" />}
                                {isNegative && <TrendingDown className="h-4 w-4" />}
                                {isNeutral && <Minus className="h-4 w-4" />}
                                <span>
                                    {isPositive && '+'}
                                    {change}%
                                </span>
                                <span className="text-muted-foreground font-normal">
                                    {t('reports.vsPrevious')}
                                </span>
                            </div>
                        )}
                    </div>
                    <div
                        className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-full bg-primary/10',
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
