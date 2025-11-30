'use client';

import { Role, ALL_ROLES } from '../types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StaffFiltersProps {
    role?: Role;
    isActive?: boolean;
    onRoleChange: (role: Role | undefined) => void;
    onStatusChange: (isActive: boolean | undefined) => void;
    onClear: () => void;
}

export function StaffFilters({
    role,
    isActive,
    onRoleChange,
    onStatusChange,
    onClear,
}: StaffFiltersProps) {
    const { t } = useTranslation();

    const hasFilters = role !== undefined || isActive !== undefined;

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <Select
                value={role || 'all'}
                onValueChange={(value) => onRoleChange(value === 'all' ? undefined : (value as Role))}
            >
                <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('staff.filterByRole')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('staff.allRoles')}</SelectItem>
                    {ALL_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                            {t(`roles.${r}`)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
                value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
                onValueChange={(value) => {
                    if (value === 'all') onStatusChange(undefined);
                    else if (value === 'active') onStatusChange(true);
                    else onStatusChange(false);
                }}
            >
                <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('staff.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('staff.allStatuses')}</SelectItem>
                    <SelectItem value="active">{t('common.active')}</SelectItem>
                    <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={onClear} className="h-9">
                    <X className="w-4 h-4 mr-1" />
                    {t('staff.clearFilters')}
                </Button>
            )}
        </div>
    );
}
