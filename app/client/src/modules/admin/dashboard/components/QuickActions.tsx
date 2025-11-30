'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Plus,
    Calendar,
    ChefHat,
    BarChart3,
    ClipboardList,
} from 'lucide-react';

interface QuickAction {
    label: string;
    href: string;
    icon: React.ElementType;
    color: string;
}

export function QuickActions() {
    const { t } = useTranslation();

    const actions: QuickAction[] = [
        {
            label: t('dashboard.quickActions.newOrder'),
            href: '/admin/orders?action=create',
            icon: Plus,
            color: 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50',
        },
        {
            label: t('dashboard.quickActions.newReservation'),
            href: '/admin/reservations?action=create',
            icon: Calendar,
            color: 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50',
        },
        {
            label: t('dashboard.quickActions.viewKitchen'),
            href: '/admin/kitchen',
            icon: ChefHat,
            color: 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50',
        },
        {
            label: t('dashboard.quickActions.viewReports'),
            href: '/admin/reports',
            icon: BarChart3,
            color: 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50',
        },
        {
            label: t('dashboard.quickActions.viewOrders'),
            href: '/admin/orders',
            icon: ClipboardList,
            color: 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50',
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                    {t('dashboard.quickActions.title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {actions.map((action) => (
                        <Link key={action.href} href={action.href}>
                            <Button
                                variant="ghost"
                                className={`w-full h-auto flex-col gap-2 py-4 ${action.color}`}
                            >
                                <action.icon className="h-6 w-6" />
                                <span className="text-xs font-medium text-center leading-tight">
                                    {action.label}
                                </span>
                            </Button>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
