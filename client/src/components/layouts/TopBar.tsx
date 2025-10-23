import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from './UserMenu';

interface User {
    username: string;
    fullName?: string;
    email?: string;
    role: string;
    avatar?: string;
}

interface TopBarProps {
    user: User;
    onMenuClick: () => void;
    onLogout: () => void;
}

export function TopBar({ user, onMenuClick, onLogout }: TopBarProps) {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-400 lg:hidden"
                onClick={onMenuClick}
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
                <UserMenu user={user} onLogout={onLogout} />
            </div>
        </div>
    );
}
