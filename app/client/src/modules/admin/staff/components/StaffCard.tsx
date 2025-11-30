'use client';

import { Staff } from '../types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface StaffCardProps {
    staff: Staff;
    onEdit: (staff: Staff) => void;
    onDelete: (staff: Staff) => void;
    onViewDetails: (staff: Staff) => void;
    onChangeRole: (staff: Staff) => void;
    onToggleStatus: (staff: Staff) => Promise<void>;
    canChangeRole?: boolean;
    canDelete?: boolean;
}

export function StaffCard({
    staff,
    onEdit,
    onDelete,
    onViewDetails,
    onChangeRole,
    onToggleStatus,
    canChangeRole = false,
    canDelete = false,
}: StaffCardProps) {
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
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4">
                {/* Header with avatar and actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">{initials}</span>
                        </div>
                        <div className="min-w-0">
                            <h3
                                className="font-semibold text-base truncate cursor-pointer hover:text-primary"
                                onClick={() => onViewDetails(staff)}
                            >
                                {staff.fullName}
                            </h3>
                            <RoleBadge role={staff.role} size="sm" />
                        </div>
                    </div>

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
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 text-sm text-muted-foreground">
                    {staff.account?.email && (
                        <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{staff.account.email}</span>
                        </div>
                    )}
                    {staff.account?.phoneNumber && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{staff.account.phoneNumber}</span>
                        </div>
                    )}
                </div>

                {/* Hire date */}
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    {t('staff.hireDate')}: {formatDate(staff.hireDate)}
                </div>
            </CardContent>

            <CardFooter className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={staff.isActive}
                        onCheckedChange={handleToggleStatus}
                        aria-label={staff.isActive ? t('common.active') : t('common.inactive')}
                    />
                    <span className="text-xs text-muted-foreground">
                        {staff.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
                <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                    {staff.isActive ? t('common.active') : t('common.inactive')}
                </Badge>
            </CardFooter>
        </Card>
    );
}
