'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Wallet, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Staff } from '../../types';
import { RoleBadge } from '../../components/RoleBadge';
import { formatDate, formatSalary } from '../../utils';

interface StaffDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: Staff | null;
}

export function StaffDetailDialog({ open, onOpenChange, staff }: StaffDetailDialogProps) {
    const { t } = useTranslation();

    if (!staff) return null;

    const initials = staff.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('staff.staffDetails')}</DialogTitle>
                    <DialogDescription>{t('staff.viewStaffInfo')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header with Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">{initials}</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">{staff.fullName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <RoleBadge role={staff.role} />
                                <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                                    {staff.isActive ? t('common.active') : t('common.inactive')}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Account Information */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            {t('staff.accountInfo')}
                        </h4>
                        <div className="space-y-3">
                            {staff.account?.username && (
                                <div className="flex items-center gap-3 text-sm">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{t('auth.username')}:</span>
                                    <span>{staff.account.username}</span>
                                </div>
                            )}
                            {staff.account?.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{t('auth.email')}:</span>
                                    <span>{staff.account.email}</span>
                                </div>
                            )}
                            {staff.account?.phoneNumber && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{t('auth.phoneNumber')}:</span>
                                    <span>{staff.account.phoneNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Personal Information */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            {t('staff.personalInfo')}
                        </h4>
                        <div className="space-y-3">
                            {staff.address && (
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{t('staff.address')}:</span>
                                    <span>{staff.address}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{t('staff.dateOfBirth')}:</span>
                                <span>{formatDate(staff.dateOfBirth)}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Employment Information */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            {t('staff.employmentInfo')}
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{t('staff.hireDate')}:</span>
                                <span>{formatDate(staff.hireDate)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Wallet className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{t('staff.salary')}:</span>
                                <span>{formatSalary(staff.salary)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="pt-4 border-t text-xs text-muted-foreground">
                        <p>
                            {t('common.createdAt')}: {formatDate(staff.createdAt)}
                        </p>
                        <p>
                            {t('common.updatedAt')}: {formatDate(staff.updatedAt)}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
