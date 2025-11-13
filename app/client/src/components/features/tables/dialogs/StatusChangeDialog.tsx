import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { tableApi } from '@/services/table.service';
import { Table, TableStatus } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertTriangle } from 'lucide-react';
import { TableStatusBadge } from '../TableStatusBadge';

interface StatusChangeDialogProps {
    open: boolean;
    table: Table;
    onClose: () => void;
    onSuccess: () => void;
}

// Define valid status transitions
const VALID_TRANSITIONS: Record<TableStatus, TableStatus[]> = {
    available: ['occupied', 'reserved', 'maintenance'],
    occupied: ['available', 'maintenance'],
    reserved: ['available', 'occupied', 'maintenance'],
    maintenance: ['available'],
};

function isValidTransition(from: TableStatus, to: TableStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

interface StatusChangeDialogProps {
    open: boolean;
    table: Table;
    onClose: () => void;
    onSuccess: () => void;
}

export function StatusChangeDialog({ open, table, onClose, onSuccess }: StatusChangeDialogProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newStatus, setNewStatus] = useState<TableStatus>(table.status);

    const handleSubmit = async () => {
        if (newStatus === table.status) {
            onClose();
            return;
        }

        try {
            setIsSubmitting(true);
            await tableApi.updateStatus(table.tableId, newStatus);
            toast.success(t('tables.statusUpdateSuccess', 'Table status updated successfully'));
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to update table status:', error);
            toast.error(error.response?.data?.message || t('tables.statusUpdateError', 'Failed to update status'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('tables.changeStatus', 'Change Table Status')}</DialogTitle>
                    <DialogDescription>
                        {t('tables.statusDescription', 'Update the status for table')} {table.tableNumber}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {t('tables.currentStatus', 'Current status')}:
                        </span>
                        <TableStatusBadge status={table.status} />
                    </div>

                    <div>
                        <Label>{t('tables.newStatus', 'New Status')}</Label>
                        <RadioGroup
                            value={newStatus}
                            onValueChange={(value) => setNewStatus(value as TableStatus)}
                            className="mt-2 space-y-2"
                        >
                            {['available', 'occupied', 'reserved', 'maintenance'].map((status) => {
                                const isValid = isValidTransition(table.status, status as TableStatus);
                                return (
                                    <div key={status} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={status}
                                            id={status}
                                            disabled={!isValid}
                                        />
                                        <Label
                                            htmlFor={status}
                                            className={`flex items-center gap-2 cursor-pointer ${!isValid ? 'opacity-50' : ''}`}
                                        >
                                            <TableStatusBadge status={status as TableStatus} />
                                            {!isValid && (
                                                <span className="text-xs text-muted-foreground">
                                                    {t('tables.invalidTransition', 'Not allowed from current state')}
                                                </span>
                                            )}
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>

                        {!isValidTransition(table.status, newStatus) && newStatus !== table.status && (
                            <Alert className="mt-4 border-orange-200 bg-orange-50">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-sm text-orange-800">
                                    {t('tables.invalidStatusWarning', 'Cannot transition from {{from}} to {{to}}', {
                                        from: table.status,
                                        to: newStatus,
                                    })}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting ||
                            newStatus === table.status ||
                            !isValidTransition(table.status, newStatus)
                        }
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.save', 'Save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
