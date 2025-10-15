import { useTranslation } from 'react-i18next';
import { LucideIcon } from 'lucide-react';
import { NavigationItem } from './NavigationItem';

export interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    permission?: string;
    roles?: string[];
}

interface DashboardSidebarProps {
    navItems: NavItem[];
    appName?: string;
}

export function DashboardSidebar({ navItems, appName }: DashboardSidebarProps) {
    const { t } = useTranslation();

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 pb-4">
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {appName || t('common.appName') || 'Restaurant'}
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navItems.map((item) => (
                                    <li key={item.href}>
                                        <NavigationItem
                                            href={item.href}
                                            icon={item.icon}
                                            title={item.title}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
