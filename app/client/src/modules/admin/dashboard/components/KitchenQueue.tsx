'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, ArrowRight, Clock, Flame, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KitchenQueueData } from '../types';

interface KitchenQueueProps {
    kitchen?: KitchenQueueData;
    loading?: boolean;
}

export function KitchenQueue({ kitchen, loading }: KitchenQueueProps) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-12" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    const total = (kitchen?.pending ?? 0) + (kitchen?.preparing ?? 0) + (kitchen?.ready ?? 0);

    const queueItems = [
        {
            key: 'pending',
            label: t('dashboard.kitchenStatus.pending'),
            count: kitchen?.pending ?? 0,
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        },
        {
            key: 'preparing',
            label: t('dashboard.kitchenStatus.preparing'),
            count: kitchen?.preparing ?? 0,
            icon: Flame,
            color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        },
        {
            key: 'ready',
            label: t('dashboard.kitchenStatus.ready'),
            count: kitchen?.ready ?? 0,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        },
    ];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <ChefHat className="h-5 w-5 text-muted-foreground" />
                    {t('dashboard.kitchenQueue')}
                </CardTitle>
                <Link href="/admin/kitchen">
                    <Button variant="ghost" size="sm" className="gap-1">
                        {t('common.viewItems')}
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm text-muted-foreground">
                        {t('dashboard.totalOrders')}
                    </span>
                    <span className="text-lg font-semibold">{total}</span>
                </div>
                {queueItems.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.label}</span>
                        </div>
                        <Badge
                            variant="secondary"
                            className={cn('font-semibold', item.color)}
                        >
                            {item.count}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
