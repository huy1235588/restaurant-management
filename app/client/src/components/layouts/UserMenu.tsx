import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LogOut, Settings, User2, ChevronDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/utils';

interface User {
    username: string;
    fullName?: string;
    email?: string;
    role: string;
    avatar?: string;
}

interface UserMenuProps {
    user: User;
    onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
    const { t } = useTranslation();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleColor = (role: string) => {
        const roleColors: Record<string, string> = {
            admin: 'bg-red-500/10 text-red-600 dark:text-red-400',
            manager: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            staff: 'bg-green-500/10 text-green-600 dark:text-green-400',
            chef: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        };
        return roleColors[role.toLowerCase()] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-10 rounded-full pl-2 pr-3 hover:bg-accent transition-all duration-200 hover:shadow-md group"
                >
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 ring-2 ring-background transition-all duration-200 group-hover:ring-primary/20">
                            <AvatarImage src={getImageUrl(user.avatar) || ''} alt={user.fullName || user.username} />
                            <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground text-xs font-semibold">
                                {getInitials(user.fullName || user.username)}
                            </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 group-hover:opacity-100 group-data-[state=open]:rotate-180" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-64 shadow-lg"
                align="end"
                forceMount
                sideOffset={8}
            >
                <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                            <AvatarImage src={user.avatar || ''} alt={user.fullName || user.username} />
                            <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                                {getInitials(user.fullName || user.username)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1.5 flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-none truncate">
                                {user.fullName || user.username}
                            </p>
                            {user.email && (
                                <p className="text-xs leading-none text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            )}
                            <Badge
                                variant="secondary"
                                className={`w-fit capitalize text-xs font-medium ${getRoleColor(user.role)}`}
                            >
                                <Shield className="h-3 w-3 mr-1" />
                                {user.role}
                            </Badge>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 transition-colors duration-200">
                    <Link href="/admin/profile" className="flex items-center">
                        <User2 className="mr-2 h-4 w-4" />
                        <span className="font-medium">{t('common.profile') || 'Profile'}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 transition-colors duration-200">
                    <Link href="/admin/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span className="font-medium">{t('common.settings') || 'Settings'}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={onLogout}
                    className="cursor-pointer py-2.5 text-destructive focus:text-destructive transition-colors duration-200"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">{t('auth.logout') || 'Logout'}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
