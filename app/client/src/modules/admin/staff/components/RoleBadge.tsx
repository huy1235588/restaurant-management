'use client';

import { Role, ROLE_COLORS } from '../types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface RoleBadgeProps {
    role: Role;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, className, size = 'md' }: RoleBadgeProps) {
    const { t } = useTranslation();
    const colors = ROLE_COLORS[role];

    const sizeClasses = {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-xs px-2 py-1',
        lg: 'text-sm px-3 py-1.5',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full font-medium border',
                colors.bg,
                colors.text,
                colors.border,
                sizeClasses[size],
                className
            )}
        >
            {t(`roles.${role}`)}
        </span>
    );
}
