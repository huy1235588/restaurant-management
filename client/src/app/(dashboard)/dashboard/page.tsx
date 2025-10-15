'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    DollarSign,
    ShoppingCart,
    Users,
    CheckCircle,
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/types';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';

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

    // Sample activities data
    const activities = [
        {
            id: 1,
            title: 'New order from Table 5',
            time: '2 minutes ago',
            amount: 45.00,
        },
        {
            id: 2,
            title: 'Order #1234 completed',
            time: '5 minutes ago',
            type: 'completed' as const,
        },
        {
            id: 3,
            title: 'Table 8 requested service',
            time: '10 minutes ago',
            type: 'pending' as const,
        },
    ];

    // Quick actions data
    const quickActions = user ? [
        ...(hasPermission(user.role, 'orders.create') ? [{
            label: 'Create New Order',
            onClick: () => console.log('Create order'),
            variant: 'default' as const,
        }] : []),
        ...(hasPermission(user.role, 'tables.update') ? [{
            label: 'Manage Tables',
            onClick: () => console.log('Manage tables'),
            variant: 'outline' as const,
        }] : []),
        ...(hasPermission(user.role, 'menu.read') ? [{
            label: 'View Menu',
            onClick: () => console.log('View menu'),
            variant: 'outline' as const,
        }] : []),
    ] : [];

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
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        description={stat.description}
                        icon={stat.icon}
                        trend={stat.trend}
                    />
                ))}
            </div>

            {/* Role-specific content */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <ActivityFeed
                    activities={activities}
                    title={t('dashboard.recentActivity') || 'Recent Activity'}
                    description={t('dashboard.recentActivityDesc') || 'Latest updates from your restaurant'}
                />
                <QuickActions
                    actions={quickActions}
                    title={t('dashboard.quickActions') || 'Quick Actions'}
                    description={t('dashboard.quickActionsDesc') || 'Common tasks'}
                />
            </div>
        </div>
    );
}
