import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { tableApi } from '@/services/table.service';

interface BulkActivateDeactivateDialogProps {
    open: boolean;
    count: number;
    onClose: () => void;
    onConfirm: (isActive: boolean) => Promise<void>;
}

export function BulkActivateDeactivateDialog({
    open,
    count,
    onClose,
    onConfirm,
}: BulkActivateDeactivateDialogProps) {
    const { t } = useTranslation();
    const [action, setAction] = useState<'activate' | 'deactivate'>('activate');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        try {
            setIsProcessing(true);
            const isActive = action === 'activate';
            await onConfirm(isActive);
            toast.success(
                t(
                    action === 'activate'
                        ? 'tables.bulkActivateSuccess'
                        : 'tables.bulkDeactivateSuccess',
                    action === 'activate'
                        ? 'Successfully activated {{count}} table(s)'
                        : 'Successfully deactivated {{count}} table(s)',
                    { count }
                )
            );
            onClose();
        } catch (error: any) {
            console.error('Failed to activate/deactivate tables:', error);
            toast.error(
                error.response?.data?.message ||
                t('tables.bulkActivateDeactivateError', 'Failed to update table status')
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>
                        {t('tables.bulkActivateDeactivateTitle', 'Activate/Deactivate {{count}} Table(s)', {
                            count,
                        })}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            'tables.bulkActivateDeactivateDescription',
                            'Choose to activate or deactivate the selected tables'
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <RadioGroup
                        value={action}
                        onValueChange={(value) => setAction(value as 'activate' | 'deactivate')}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="activate" id="activate" />
                            <Label htmlFor="activate" className="cursor-pointer">
                                {t('tables.activateTables', 'Activate Tables')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="deactivate" id="deactivate" />
                            <Label htmlFor="deactivate" className="cursor-pointer">
                                {t('tables.deactivateTables', 'Deactivate Tables')}
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleConfirm} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.confirm', 'Confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
