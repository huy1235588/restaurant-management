import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { tableApi } from '@/services/table.service';
import { Table, TableStatus } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { TableStatusBadge } from '../TableStatusBadge';

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
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="available" id="available" />
                                <Label htmlFor="available" className="flex items-center gap-2 cursor-pointer">
                                    <TableStatusBadge status="available" />
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="occupied" id="occupied" />
                                <Label htmlFor="occupied" className="flex items-center gap-2 cursor-pointer">
                                    <TableStatusBadge status="occupied" />
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="reserved" id="reserved" />
                                <Label htmlFor="reserved" className="flex items-center gap-2 cursor-pointer">
                                    <TableStatusBadge status="reserved" />
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="maintenance" id="maintenance" />
                                <Label htmlFor="maintenance" className="flex items-center gap-2 cursor-pointer">
                                    <TableStatusBadge status="maintenance" />
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || newStatus === table.status}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.save', 'Save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
