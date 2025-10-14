'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
    LogOut,
    Menu,
    X,
    ChefHat,
    Table,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/types';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
    title: string;
    href: string;
    icon: any;
    permission?: string;
    roles?: string[];
}

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
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
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

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
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
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying session...</p>
                </div>
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
            <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 pb-4">
                    {/* Logo */}
                    <div className="flex h-16 shrink-0 items-center">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {t('common.appName') || 'Restaurant'}
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {filteredNavItems.map((item) => {
                                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                                                        isActive
                                                            ? 'bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400'
                                                            : 'text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    )}
                                                >
                                                    <item.icon className="h-5 w-5 shrink-0" />
                                                    {item.title}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="relative z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-gray-900/80"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed inset-0 flex">
                        <div className="relative mr-16 flex w-full max-w-xs flex-1">
                            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                <button
                                    type="button"
                                    className="-m-2.5 p-2.5"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <X className="h-6 w-6 text-white" />
                                </button>
                            </div>
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-950 px-6 pb-4">
                                <div className="flex h-16 shrink-0 items-center">
                                    <h1 className="text-xl font-bold">{t('common.appName')}</h1>
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {filteredNavItems.map((item) => {
                                                    const isActive = pathname === item.href;
                                                    return (
                                                        <li key={item.href}>
                                                            <Link
                                                                href={item.href}
                                                                onClick={() => setSidebarOpen(false)}
                                                                className={cn(
                                                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                                                    isActive
                                                                        ? 'bg-gray-100 dark:bg-gray-800 text-indigo-600'
                                                                        : 'text-gray-700 dark:text-gray-400 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                                )}
                                                            >
                                                                <item.icon className="h-5 w-5 shrink-0" />
                                                                {item.title}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-400 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Separator */}
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 lg:hidden" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
                        {/* Language switcher */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
                        >
                            {i18n.language === 'vi' ? '🇻🇳' : '🇬🇧'}
                        </Button>

                        {/* Theme toggle */}
                        <ThemeToggle />

                        {/* User menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar>
                                        <AvatarImage src={user.avatar || ''} alt={user.fullName || user.username} />
                                        <AvatarFallback>
                                            {(user.fullName || user.username).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email || ''}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground capitalize">
                                            {user.role}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-8 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
