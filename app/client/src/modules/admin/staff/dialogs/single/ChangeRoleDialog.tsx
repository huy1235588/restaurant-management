'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Staff, Role, ALL_ROLES } from '../../types';
import { RoleBadge } from '../../components/RoleBadge';
import { useUpdateStaffRole } from '../../hooks';
import { toast } from 'sonner';

interface ChangeRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: Staff | null;
    onSuccess: () => void;
}

export function ChangeRoleDialog({ open, onOpenChange, staff, onSuccess }: ChangeRoleDialogProps) {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState<Role | ''>('');
    const { updateRole, loading } = useUpdateStaffRole();

    // Reset when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && staff) {
            setSelectedRole(staff.role);
        }
        onOpenChange(newOpen);
    };

    const handleSubmit = async () => {
        if (!staff || !selectedRole) return;

        try {
            await updateRole(staff.staffId, selectedRole);
            toast.success(t('staff.roleUpdateSuccess'));
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || t('staff.roleUpdateError'));
        }
    };

    if (!staff) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{t('staff.changeRole')}</DialogTitle>
                    <DialogDescription>
                        {t('staff.changeRoleDescription', { name: staff.fullName })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Role */}
                    <div className="flex items-center justify-between">
                        <Label>{t('staff.currentRole')}</Label>
                        <RoleBadge role={staff.role} />
                    </div>

                    {/* New Role Selection */}
                    <div className="space-y-2">
                        <Label>{t('staff.newRole')}</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={(value) => setSelectedRole(value as Role)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('staff.selectRole')} />
                            </SelectTrigger>
                            <SelectContent>
                                {ALL_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {t(`roles.${role}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !selectedRole || selectedRole === staff.role}
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('common.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
