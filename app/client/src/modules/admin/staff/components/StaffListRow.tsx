'use client';

import { Staff } from '../types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, UserCog, Mail, Phone } from 'lucide-react';
import { RoleBadge } from './RoleBadge';
import { formatDate } from '../utils';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface StaffListRowProps {
    staff: Staff;
    onEdit: (staff: Staff) => void;
    onDelete: (staff: Staff) => void;
    onViewDetails: (staff: Staff) => void;
    onChangeRole: (staff: Staff) => void;
    onToggleStatus: (staff: Staff) => Promise<void>;
    canChangeRole?: boolean;
    canDelete?: boolean;
}

export function StaffListRow({
    staff,
    onEdit,
    onDelete,
    onViewDetails,
    onChangeRole,
    onToggleStatus,
    canChangeRole = false,
    canDelete = false,
}: StaffListRowProps) {
    const { t } = useTranslation();

    const handleToggleStatus = async () => {
        await onToggleStatus(staff);
    };

    // Get initials for avatar
    const initials = staff.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <tr className="border-b hover:bg-muted/50 transition-colors">
            {/* Name & Avatar */}
            <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">{initials}</span>
                    </div>
                    <div className="min-w-0">
                        <p
                            className="font-medium truncate cursor-pointer hover:text-primary"
                            onClick={() => onViewDetails(staff)}
                        >
                            {staff.fullName}
                        </p>
                        {staff.account?.email && (
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {staff.account.email}
                            </p>
                        )}
                    </div>
                </div>
            </td>

            {/* Role */}
            <td className="py-3 px-4">
                <RoleBadge role={staff.role} />
            </td>

            {/* Contact */}
            <td className="py-3 px-4">
                {staff.account?.phoneNumber && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {staff.account.phoneNumber}
                    </div>
                )}
            </td>

            {/* Hire Date */}
            <td className="py-3 px-4 text-sm text-muted-foreground">
                {formatDate(staff.hireDate)}
            </td>

            {/* Status */}
            <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={staff.isActive}
                        onCheckedChange={handleToggleStatus}
                        aria-label={staff.isActive ? t('common.active') : t('common.inactive')}
                    />
                    <span
                        className={cn(
                            'text-xs font-medium',
                            staff.isActive ? 'text-green-600' : 'text-muted-foreground'
                        )}
                    >
                        {staff.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
            </td>

            {/* Actions */}
            <td className="py-3 px-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(staff)}>
                            <Eye className="w-4 h-4 mr-2" />
                            {t('staff.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(staff)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('common.edit')}
                        </DropdownMenuItem>
                        {canChangeRole && (
                            <DropdownMenuItem onClick={() => onChangeRole(staff)}>
                                <UserCog className="w-4 h-4 mr-2" />
                                {t('staff.changeRole')}
                            </DropdownMenuItem>
                        )}
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(staff)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('common.delete')}
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}
