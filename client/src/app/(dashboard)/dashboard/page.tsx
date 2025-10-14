'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    DollarSign,
    ShoppingCart,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/types';

interface StatCard {
    title: string;
    value: string;
    description: string;
    icon: any;
    trend?: string;
    permission?: string;
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<StatCard[]>([]);

    useEffect(() => {
        if (!user) return;

        // Define stats based on user role
        const allStats: StatCard[] = [
            {
                title: t('dashboard.todayRevenue') || 'Today Revenue',
                value: '$2,345',
                description: '+12% from yesterday',
                icon: DollarSign,
                trend: '+12%',
                permission: 'reports.read',
            },
            {
                title: t('dashboard.totalOrders') || 'Total Orders',
                value: '45',
                description: 'Active orders today',
                icon: ShoppingCart,
                permission: 'orders.read',
            },
            {
                title: t('dashboard.activeCustomers') || 'Active Customers',
                value: '32',
                description: 'Currently dining',
                icon: Users,
                permission: 'tables.read',
            },
            {
                title: t('dashboard.completedOrders') || 'Completed',
                value: '28',
                description: 'Orders completed today',
                icon: CheckCircle,
                permission: 'orders.read',
            },
        ];

        // Filter stats based on permissions
        const filteredStats = allStats.filter((stat) => {
            if (!stat.permission) return true;
            return hasPermission(user.role, stat.permission);
        });

        setStats(filteredStats);
    }, [user, t]);

    if (!user) return null;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('dashboard.welcome') || 'Welcome back'}, {user.fullName || user.username}!
                </h1>
                <p className="text-muted-foreground mt-2">
                    {t('dashboard.subtitle') || 'Here\'s what\'s happening with your restaurant today.'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                            {stat.trend && (
                                <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    {stat.trend}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Role-specific content */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t('dashboard.recentActivity') || 'Recent Activity'}</CardTitle>
                        <CardDescription>
                            {t('dashboard.recentActivityDesc') || 'Latest updates from your restaurant'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Sample activity items */}
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        New order from Table 5
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        2 minutes ago
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">$45.00</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Order #1234 completed
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        5 minutes ago
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Table 8 requested service
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        10 minutes ago
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">
                                    <Clock className="h-4 w-4 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t('dashboard.quickActions') || 'Quick Actions'}</CardTitle>
                        <CardDescription>
                            {t('dashboard.quickActionsDesc') || 'Common tasks'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        {hasPermission(user.role, 'orders.create') && (
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
                                Create New Order
                            </button>
                        )}
                        {hasPermission(user.role, 'tables.update') && (
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4">
                                Manage Tables
                            </button>
                        )}
                        {hasPermission(user.role, 'menu.read') && (
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4">
                                View Menu
                            </button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
