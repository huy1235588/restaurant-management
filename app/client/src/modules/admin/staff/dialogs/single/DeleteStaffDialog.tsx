'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Staff } from '../../types';
import { useDeleteStaff } from '../../hooks';
import { toast } from 'sonner';

interface DeleteStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: Staff | null;
    onSuccess: () => void;
}

export function DeleteStaffDialog({
    open,
    onOpenChange,
    staff,
    onSuccess,
}: DeleteStaffDialogProps) {
    const { t } = useTranslation();
    const { deleteStaff, loading } = useDeleteStaff();

    const handleDelete = async () => {
        if (!staff) return;

        try {
            await deleteStaff(staff.staffId);
            toast.success(t('staff.deleteSuccess'));
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || t('staff.deleteError'));
        }
    };

    if (!staff) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('staff.deleteConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('staff.deleteConfirmDescription', { name: staff.fullName })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('common.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
