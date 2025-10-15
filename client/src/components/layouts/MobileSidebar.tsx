import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { NavItem } from './DashboardSidebar';
import { NavigationItem } from './NavigationItem';

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: NavItem[];
    appName?: string;
}

export function MobileSidebar({ isOpen, onClose, navItems, appName }: MobileSidebarProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="relative z-50 lg:hidden">
            <div
                className="fixed inset-0 bg-gray-900/80"
                onClick={onClose}
            />
            <div className="fixed inset-0 flex">
                <div className="relative mr-16 flex w-full max-w-xs flex-1">
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5"
                            onClick={onClose}
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-950 px-6 pb-4">
                        <div className="flex h-16 shrink-0 items-center">
                            <h1 className="text-xl font-bold">
                                {appName || t('common.appName') || 'Restaurant'}
                            </h1>
                        </div>
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
                                                    onClick={onClose}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
