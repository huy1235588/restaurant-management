import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItemProps {
    href: string;
    icon: LucideIcon;
    title: string;
    onClick?: () => void;
}

export function NavigationItem({ href, icon: Icon, title, onClick }: NavigationItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(href + '/');

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                isActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
        >
            <Icon className="h-5 w-5 shrink-0" />
            {title}
        </Link>
    );
}
