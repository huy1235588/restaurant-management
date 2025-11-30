'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    Tag,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/types/permissions';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { DashboardSidebar, NavItem, NavGroup } from '@/components/layouts/DashboardSidebar';
import { MobileSidebar } from '@/components/layouts/MobileSidebar';
import { TopBar } from '@/components/layouts/TopBar';
import { useTranslation } from 'react-i18next';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const { t } = useTranslation();

    // Define navigation groups for better organization
    const navGroups: NavGroup[] = [
        {
            title: t('sidebar.overview') || 'Overview',
            items: [
                {
                    title: t('sidebar.dashboard'),
                    href: '/admin/dashboard',
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            title: t('sidebar.operations') || 'Operations',
            items: [
                {
                    title: t('sidebar.orders'),
                    href: '/admin/orders',
                    icon: ShoppingCart,
                    permission: 'orders.read',
                },
                {
                    title: t('sidebar.kitchen'),
                    href: '/admin/kitchen',
                    icon: ChefHat,
                    permission: 'kitchen.read',
                },
                {
                    title: t('sidebar.tables'),
                    href: '/admin/tables',
                    icon: Table,
                    permission: 'tables.read',
                },
            ],
        },
        {
            title: t('sidebar.management') || 'Management',
            items: [
                {
                    title: t('sidebar.menu'),
                    href: '/admin/menu',
                    icon: UtensilsCrossed,
                    permission: 'menu.read',
                },
                {
                    title: t('sidebar.category'),
                    href: '/admin/categories',
                    icon: Tag,
                    permission: 'category.read',
                },
                {
                    title: t('sidebar.reservations'),
                    href: '/admin/reservations',
                    icon: Calendar,
                    permission: 'reservations.read',
                },
                {
                    title: t('sidebar.bills'),
                    href: '/admin/bills',
                    icon: Receipt,
                    permission: 'bills.read',
                },
            ],
        },
        {
            title: t('sidebar.administration') || 'Administration',
            items: [
                {
                    title: t('sidebar.staff'),
                    href: '/admin/staff',
                    icon: Users,
                    permission: 'staff.read',
                    roles: ['admin', 'manager'],
                },
                {
                    title: t('sidebar.reports'),
                    href: '/admin/reports',
                    icon: BarChart3,
                    permission: 'reports.read',
                    roles: ['admin', 'manager'],
                },
                {
                    title: t('sidebar.settings'),
                    href: '/admin/settings',
                    icon: Settings,
                },
            ],
        },
    ];

    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
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

    const handleLogout = async () => {
        await logout(); // useAuth handles everything
    };

    // Filter navigation groups based on user permissions and roles
    const filteredNavGroups: NavGroup[] = navGroups.map((group) => ({
        ...group,
        items: group.items.filter((item) => {
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
        }),
    })).filter((group) => group.items.length > 0);

    // Flatten nav groups for mobile sidebar
    const flattenedNavItems: NavItem[] = filteredNavGroups.flatMap(
        (group) => group.items
    );

    // Show loading state while verifying authentication
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner size="lg" message={t('auth.verifyingSession')} />
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <SidebarProvider>
            {/* Sidebar - Desktop */}
            <DashboardSidebar navGroups={filteredNavGroups} />

            {/* Mobile sidebar */}
            <MobileSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                navItems={flattenedNavItems}
            />

            {/* Main content area */}
            <SidebarInset>
                {/* Top bar */}
                <TopBar
                    user={user}
                    onLogout={handleLogout}
                />

                {/* Page content with responsive padding based on sidebar state */}
                <main className="flex-1 overflow-auto transition-all duration-300">
                    <div className="sm:p-6 md:p-6 lg:p-8 grid-adaptive">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
