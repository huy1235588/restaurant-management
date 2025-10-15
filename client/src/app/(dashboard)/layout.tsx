'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    ShoppingCart,
    UtensilsCrossed,
    Users,
    Receipt,
    Calendar,
    BarChart3,
    Settings,
    ChefHat,
    Table,
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { DashboardSidebar, NavItem } from '@/components/layouts/DashboardSidebar';
import { MobileSidebar } from '@/components/layouts/MobileSidebar';
import { TopBar } from '@/components/layouts/TopBar';

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Orders',
        href: '/orders',
        icon: ShoppingCart,
        permission: 'orders.read',
    },
    {
        title: 'Kitchen',
        href: '/kitchen',
        icon: ChefHat,
        permission: 'kitchen.read',
    },
    {
        title: 'Tables',
        href: '/tables',
        icon: Table,
        permission: 'tables.read',
    },
    {
        title: 'Menu',
        href: '/menu',
        icon: UtensilsCrossed,
        permission: 'menu.read',
    },
    {
        title: 'Reservations',
        href: '/reservations',
        icon: Calendar,
        permission: 'reservations.read',
    },
    {
        title: 'Bills',
        href: '/bills',
        icon: Receipt,
        permission: 'bills.read',
    },
    {
        title: 'Staff',
        href: '/staff',
        icon: Users,
        permission: 'staff.read',
        roles: ['admin', 'manager'],
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
        permission: 'reports.read',
        roles: ['admin', 'manager'],
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Don't redirect while loading - wait for session verification
        if (isLoading) {
            return;
        }

        // Only redirect if not authenticated after loading completes
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    const filteredNavItems = navItems.filter((item) => {
        if (!user) return false;

        // Check role-based access
        if (item.roles && !item.roles.includes(user.role)) {
            return false;
        }

        // Check permission-based access
        if (item.permission && !hasPermission(user.role, item.permission)) {
            return false;
        }

        return true;
    });

    // Show loading state while verifying authentication
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner size="lg" message="Verifying session..." />
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar - Desktop */}
            <DashboardSidebar navItems={filteredNavItems} />

            {/* Mobile sidebar */}
            <MobileSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                navItems={filteredNavItems}
            />

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <TopBar
                    user={user}
                    onMenuClick={() => setSidebarOpen(true)}
                    onLogout={handleLogout}
                />

                {/* Page content */}
                <main className="py-8 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
