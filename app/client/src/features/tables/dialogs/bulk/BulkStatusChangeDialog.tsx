import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TableStatus } from '@/types';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { TableStatusBadge } from '@/features/tables/components/TableStatusBadge';

interface BulkStatusChangeDialogProps {
    open: boolean;
    count: number;
    onClose: () => void;
    onConfirm: (status: TableStatus) => void;
}

export function BulkStatusChangeDialog({
    open,
    count,
    onClose,
    onConfirm,
}: BulkStatusChangeDialogProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<TableStatus>('available');

    const handleConfirm = async () => {
        try {
            setIsSubmitting(true);
            onConfirm(selectedStatus);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('tables.bulkChangeStatus', 'Change Status for Multiple Tables')}</DialogTitle>
                    <DialogDescription>
                        {t('tables.bulkStatusDescription', 'Update the status for {{count}} selected tables', {
                            count,
                        })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <Label>{t('tables.newStatus', 'New Status')}</Label>
                        <RadioGroup
                            value={selectedStatus}
                            onValueChange={(value) => setSelectedStatus(value as TableStatus)}
                            className="mt-2 space-y-2"
                        >
                            {['available', 'occupied', 'reserved', 'maintenance'].map((status) => (
                                <div key={status} className="flex items-center space-x-2">
                                    <RadioGroupItem value={status} id={status} />
                                    <Label htmlFor={status} className="flex items-center gap-2 cursor-pointer">
                                        <TableStatusBadge status={status as TableStatus} />
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.confirm', 'Confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
