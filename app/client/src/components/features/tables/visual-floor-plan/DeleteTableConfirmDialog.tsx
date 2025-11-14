'use client';

import { useState } from 'react';
import { Table } from '@/types';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tableApi } from '@/services/table.service';
import { toast } from 'sonner';

interface DeleteTableConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    table: Table | null;
}

/**
 * Confirmation dialog for deleting tables from the visual floor plan
 */
export function DeleteTableConfirmDialog({
    open,
    onClose,
    onSuccess,
    table,
}: DeleteTableConfirmDialogProps) {
    const { t } = useTranslation();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!table) return null;

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

    // Check if table has active orders or is occupied
    const isOccupied = table.status === 'occupied';
    const isReserved = table.status === 'reserved';
    const canDelete = table.status === 'available' || table.status === 'maintenance';

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="sm:max-w-[500px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {t('tables.deleteTable', 'Delete Table')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('tables.deleteTableConfirmation', 'Are you sure you want to delete this table? This action cannot be undone.')}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Table Details */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="font-medium">{t('tables.tableNumber', 'Table Number')}:</span>{' '}
                            <span className="text-muted-foreground">{table.tableNumber}</span>
                        </div>
                        <div>
                            <span className="font-medium">{t('tables.capacity', 'Capacity')}:</span>{' '}
                            <span className="text-muted-foreground">{table.capacity}</span>
                        </div>
                        {table.tableName && (
                            <div className="col-span-2">
                                <span className="font-medium">{t('tables.tableName', 'Table Name')}:</span>{' '}
                                <span className="text-muted-foreground">{table.tableName}</span>
                            </div>
                        )}
                        <div className="col-span-2">
                            <span className="font-medium">{t('tables.status', 'Status')}:</span>{' '}
                            <span className={`font-semibold ${
                                table.status === 'occupied' ? 'text-red-600' :
                                table.status === 'reserved' ? 'text-yellow-600' :
                                table.status === 'maintenance' ? 'text-orange-600' :
                                'text-green-600'
                            }`}>
                                {t(`tables.status.${table.status}`, table.status)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Warnings */}
                {isOccupied && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {t('tables.cannotDeleteOccupied', 'This table is currently occupied and has active orders. Please complete or move the orders before deleting.')}
                        </AlertDescription>
                    </Alert>
                )}

                {isReserved && (
                    <Alert variant="default" className="border-yellow-500 text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {t('tables.warningDeleteReserved', 'This table has a reservation. Deleting it will cancel the reservation.')}
                        </AlertDescription>
                    </Alert>
                )}

                {canDelete && (
                    <Alert variant="default">
                        <AlertDescription>
                            {t('tables.deleteWarning', 'This table will be permanently removed from the floor plan and database.')}
                        </AlertDescription>
                    </Alert>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        {t('common.cancel', 'Cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting || isOccupied}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('tables.deleteTable', 'Delete Table')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
