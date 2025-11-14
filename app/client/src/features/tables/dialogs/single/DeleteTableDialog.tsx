import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { tableApi } from '@/services/table.service';
import { Table } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface DeleteTableDialogProps {
    open: boolean;
    table: Table;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeleteTableDialog({ open, table, onClose, onSuccess }: DeleteTableDialogProps) {
    const { t } = useTranslation();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await tableApi.delete(table.tableId);
            toast.success(t('tables.deleteSuccess', 'Table deleted successfully'));
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to delete table:', error);
            toast.error(error.response?.data?.message || t('tables.deleteError', 'Failed to delete table'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('tables.deleteTitle', 'Delete Table')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('tables.deleteDescription', 'Are you sure you want to delete table {{number}}? This action cannot be undone.', {
                            number: table.tableNumber,
                        })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        {t('common.cancel', 'Cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.delete', 'Delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
