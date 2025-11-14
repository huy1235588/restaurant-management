import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from './UserMenu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Globe, Bell } from 'lucide-react';
import Image from 'next/image';

interface User {
    username: string;
    fullName?: string;
    email?: string;
    role: string;
    avatar?: string;
}

interface TopBarProps {
    user: User;
    onMenuClick?: () => void;
    onLogout: () => void;
}

export function TopBar({ user, onLogout }: TopBarProps) {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.language === 'vi' ? 'Tiếng Việt' : 'English';
    const languageFlag = i18n.language === 'vi' ? '🇻🇳' : '🇬🇧';

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 transition-all duration-200">
            <div className="flex items-center gap-3">
                {/* Sidebar toggle button - positioned at far left */}
                <SidebarTrigger className="-ml-1 hover:bg-accent transition-colors duration-200" />
                
                {/* Application logo - adjacent to toggle button, pixel position: left-11 (44px) */}
                <div className="flex items-center gap-2">
                    <Image
                        src="/images/logo/logo.png"
                        alt="Restaurant Logo"
                        width={32}
                        height={32}
                        className="h-8 w-8"
                        priority
                    />
                    <span className="font-bold text-lg hidden sm:inline-block">
                        {/* {t('common.appName') || 'Restaurant'} */}
                    </span>
                </div>
                
                <Separator orientation="vertical" className="ml-2 h-4" />
            </div>

            {/* Right side actions */}
            <div className="flex flex-1 items-center gap-2 justify-end">
                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-9 w-9 rounded-full hover:bg-accent transition-all duration-200 hover:scale-105"
                    title={t('common.notifications') || 'Notifications'}
                >
                    <Bell className="h-4 w-4" />
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs shadow-sm"
                    >
                        3
                    </Badge>
                </Button>

                {/* Language switcher */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
                    className="h-9 px-3 rounded-full hover:bg-accent transition-all duration-200 hover:scale-105 group"
                    title={`${t('common.language') || 'Language'}: ${currentLanguage}`}
                >
                    <Globe className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-12" />
                    <span className="text-lg leading-none">{languageFlag}</span>
                </Button>

                {/* Theme toggle */}
                <div className="transition-all duration-200 hover:scale-105">
                    <ThemeToggle />
                </div>

                <Separator orientation="vertical" className="mx-1 h-6" />

                {/* User menu */}
                <UserMenu user={user} onLogout={onLogout} />
            </div>
        </header>
    );
}
