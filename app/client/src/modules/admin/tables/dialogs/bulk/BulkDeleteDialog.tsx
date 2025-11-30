import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { tableApi } from '@/modules/admin/tables/services/table.service';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface BulkDeleteDialogProps {
    open: boolean;
    count: number;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export function BulkDeleteDialog({ open, count, onClose, onConfirm }: BulkDeleteDialogProps) {
    const { t } = useTranslation();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await onConfirm();
            toast.success(
                t('tables.bulkDeleteSuccess', 'Successfully deleted {{count}} table(s)', { count })
            );
            onClose();
        } catch (error: any) {
            console.error('Failed to bulk delete tables:', error);
            toast.error(
                error.response?.data?.message ||
                t('tables.bulkDeleteError', 'Failed to delete selected tables')
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('tables.bulkDeleteTitle', 'Delete {{count}} Table(s)', { count })}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t(
                            'tables.bulkDeleteDescription',
                            'Are you sure you want to delete {{count}} table(s)? This action cannot be undone.',
                            { count }
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        {t('common.cancel', 'Cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.delete', 'Delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
