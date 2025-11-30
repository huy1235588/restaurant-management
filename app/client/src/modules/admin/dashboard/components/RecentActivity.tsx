'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Activity,
    ShoppingCart,
    Calendar,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityItem } from '../types';

interface RecentActivityProps {
    activities?: ActivityItem[];
    loading?: boolean;
}

const getActivityIcon = (type: ActivityItem['type'], action: string) => {
    if (type === 'order') {
        switch (action) {
            case 'created':
                return ShoppingCart;
            case 'completed':
                return CheckCircle;
            case 'cancelled':
                return XCircle;
            default:
                return Clock;
        }
    }

    if (type === 'reservation') {
        switch (action) {
            case 'created':
            case 'confirmed':
                return Calendar;
            case 'seated':
                return UserCheck;
            case 'completed':
                return CheckCircle;
            case 'cancelled':
            case 'no_show':
                return XCircle;
            default:
                return Clock;
        }
    }

    // payment
    return CreditCard;
};

const getActivityColor = (type: ActivityItem['type'], action: string) => {
    if (action === 'cancelled' || action === 'no_show') {
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    }

    if (action === 'completed') {
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    }

    switch (type) {
        case 'order':
            return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        case 'reservation':
            return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
        case 'payment':
            return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
        default:
            return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
};

export function RecentActivity({ activities, loading }: RecentActivityProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const locale = i18n.language === 'vi' ? vi : enUS;

    const handleActivityClick = (activity: ActivityItem) => {
        const { type, metadata } = activity;

        switch (type) {
            case 'order':
                router.push(`/admin/orders/${metadata.entityId}`);
                break;
            case 'reservation':
                router.push(`/admin/reservations/${metadata.entityId}`);
                break;
            case 'payment':
                router.push(`/admin/bills/${metadata.entityId}`);
                break;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    {t('dashboard.recentActivity.title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    {!activities || activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <Activity className="h-8 w-8 mb-2" />
                            <p className="text-sm">{t('dashboard.recentActivity.empty')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activities.map((activity, index) => {
                                const Icon = getActivityIcon(activity.type, activity.action);
                                const colorClass = getActivityColor(activity.type, activity.action);

                                return (
                                    <div
                                        key={activity.id}
                                        className={cn(
                                            'flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                                            'hover:bg-muted/50'
                                        )}
                                        onClick={() => handleActivityClick(activity)}
                                    >
                                        <div
                                            className={cn(
                                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                                colorClass
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-snug">
                                                {activity.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(activity.timestamp), {
                                                        addSuffix: true,
                                                        locale,
                                                    })}
                                                </span>
                                                {activity.metadata.amount && activity.metadata.amount > 0 && (
                                                    <>
                                                        <span className="text-xs text-muted-foreground">•</span>
                                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                                            {new Intl.NumberFormat('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND',
                                                                maximumFractionDigits: 0,
                                                            }).format(activity.metadata.amount)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {/* Vertical timeline line */}
                                        {index < activities.length - 1 && (
                                            <div className="absolute left-7 top-12 h-full w-px bg-border" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
