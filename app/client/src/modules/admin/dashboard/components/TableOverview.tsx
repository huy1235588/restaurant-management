'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableProperties, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TableSummary } from '../types';

interface TableOverviewProps {
    tables?: TableSummary;
    loading?: boolean;
}

export function TableOverview({ tables, loading }: TableOverviewProps) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-12" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    const statusItems = [
        {
            key: 'available',
            label: t('dashboard.tableStatus.available'),
            count: tables?.available ?? 0,
            color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        },
        {
            key: 'occupied',
            label: t('dashboard.tableStatus.occupied'),
            count: tables?.occupied ?? 0,
            color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        },
        {
            key: 'reserved',
            label: t('dashboard.tableStatus.reserved'),
            count: tables?.reserved ?? 0,
            color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        },
        {
            key: 'maintenance',
            label: t('dashboard.tableStatus.maintenance'),
            count: tables?.maintenance ?? 0,
            color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        },
    ];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <TableProperties className="h-5 w-5 text-muted-foreground" />
                    {t('dashboard.tableOverview')}
                </CardTitle>
                <Link href="/admin/tables">
                    <Button variant="ghost" size="sm" className="gap-1">
                        {t('common.viewItems')}
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm text-muted-foreground">
                        {t('dashboard.totalTables')}
                    </span>
                    <span className="text-lg font-semibold">{tables?.total ?? 0}</span>
                </div>
                {statusItems.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm">{item.label}</span>
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
