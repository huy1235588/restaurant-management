'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStaffById } from '@/modules/admin/staff/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Wallet,
    Briefcase,
    ArrowLeft,
    Edit,
    Trash2,
    UserCog,
    Power,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RoleBadge } from '@/modules/admin/staff/components/RoleBadge';
import { formatDate, formatSalary } from '@/modules/admin/staff/utils';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import {
    ChangeRoleDialog,
    DeleteStaffDialog,
    EditStaffDialog,
} from '@/modules/admin/staff/dialogs';
import { useToggleStaffStatus } from '@/modules/admin/staff/hooks';
import { toast } from 'sonner';

export default function StaffDetailPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const staffId = params.id as string;

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { staff, loading, error, refetch } = useStaffById(staffId);
    const { toggleStatus, loading: togglingStatus } = useToggleStaffStatus();

    const canManageStaff = user?.role === 'admin' || user?.role === 'manager';
    const canChangeRole = user?.role === 'admin';
    const canDelete = user?.role === 'admin';

    const handleBack = () => {
        router.push('/admin/staff');
    };

    const handleEdit = () => {
        setEditDialogOpen(true);
    };

    const handleChangeRole = () => {
        setChangeRoleDialogOpen(true);
    };

    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const handleToggleStatus = async () => {
        if (!staff) return;
        try {
            await toggleStatus(staff.staffId, staff.isActive);
            toast.success(
                staff.isActive ? t('staff.deactivateSuccess') : t('staff.activateSuccess')
            );
            refetch();
        } catch (error: any) {
            toast.error(error.message || t('common.error'));
        }
    };

    const handleDeleteSuccess = () => {
        router.push('/admin/staff');
    };

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-8 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error || !staff) {
        return (
            <div className="container max-w-4xl mx-auto py-8">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-destructive">
                        {t('common.error')}
                    </h2>
                    <p className="text-muted-foreground">
                        {error || t('staff.staffNotFound')}
                    </p>
                    <Button onClick={handleBack} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('common.back')}
                    </Button>
                </div>
            </div>
        );
    }

    const initials = staff.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="container max-w-4xl mx-auto py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button onClick={handleBack} variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.back')}
                </Button>
            </div>

            {/* Main Card */}
            <div className="bg-card border rounded-lg p-6 space-y-6">
                {/* Header with Avatar and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary">{initials}</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{staff.fullName}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <RoleBadge role={staff.role} />
                                <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                                    {staff.isActive ? t('common.active') : t('common.inactive')}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {canManageStaff && (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={handleToggleStatus}
                                variant="outline"
                                size="sm"
                                disabled={togglingStatus}
                            >
                                <Power className="w-4 h-4 mr-2" />
                                {staff.isActive
                                    ? t('staff.deactivate')
                                    : t('staff.activate')}
                            </Button>
                            <Button onClick={handleEdit} variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                {t('common.edit')}
                            </Button>
                            {canChangeRole && (
                                <Button
                                    onClick={handleChangeRole}
                                    variant="outline"
                                    size="sm"
                                >
                                    <UserCog className="w-4 h-4 mr-2" />
                                    {t('staff.changeRole')}
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    onClick={handleDelete}
                                    variant="destructive"
                                    size="sm"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('common.delete')}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <Separator />

                {/* Account Information */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">{t('staff.accountInfo')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {staff.account?.username && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('auth.username')}
                                    </p>
                                    <p className="font-medium">{staff.account.username}</p>
                                </div>
                            </div>
                        )}
                        {staff.account?.email && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('auth.email')}
                                    </p>
                                    <p className="font-medium">{staff.account.email}</p>
                                </div>
                            </div>
                        )}
                        {staff.account?.phoneNumber && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('auth.phoneNumber')}
                                    </p>
                                    <p className="font-medium">{staff.account.phoneNumber}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">{t('staff.personalInfo')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {staff.address && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('staff.address')}
                                    </p>
                                    <p className="font-medium">{staff.address}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('staff.dateOfBirth')}
                                </p>
                                <p className="font-medium">{formatDate(staff.dateOfBirth)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Employment Information */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">
                        {t('staff.employmentInfo')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('staff.hireDate')}
                                </p>
                                <p className="font-medium">{formatDate(staff.hireDate)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('staff.salary')}
                                </p>
                                <p className="font-medium">{formatSalary(staff.salary)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p>
                            <span className="font-medium">{t('common.createdAt')}:</span>{' '}
                            {formatDate(staff.createdAt)}
                        </p>
                        <p>
                            <span className="font-medium">{t('common.updatedAt')}:</span>{' '}
                            {formatDate(staff.updatedAt)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <EditStaffDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                staff={staff}
                onSuccess={refetch}
            />
            <ChangeRoleDialog
                open={changeRoleDialogOpen}
                onOpenChange={setChangeRoleDialogOpen}
                staff={staff}
                onSuccess={refetch}
            />
            <DeleteStaffDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                staff={staff}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    );
}
