'use client';

import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { NavItem } from './DashboardSidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: NavItem[];
    appName?: string;
}

export function MobileSidebar({ isOpen, onClose, navItems, appName }: MobileSidebarProps) {
    const { t } = useTranslation();
    const pathname = usePathname();

    if (!isOpen) return null;

    return (
        <div className="relative z-50 md:hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/80"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-full max-w-xs flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="text-lg font-bold">
                        {appName || t('common.appName') || 'Restaurant'}
                    </h1>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            const Icon = item.icon;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                                            isActive
                                                ? 'bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400'
                                                : 'text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        )}
                                    >
                                        <Icon className="h-5 w-5 shrink-0" />
                                        {item.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </div>
    );
}
