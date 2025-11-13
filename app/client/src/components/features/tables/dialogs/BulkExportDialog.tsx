import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportTablesToCsv, exportTablesToJson } from '@/utils/table-export';
import { Table } from '@/types';

interface BulkExportDialogProps {
    open: boolean;
    tables: Table[];
    count: number;
    onClose: () => void;
}

export function BulkExportDialog({ open, tables, count, onClose }: BulkExportDialogProps) {
    const { t } = useTranslation();
    const [format, setFormat] = useState<'csv' | 'json'>('csv');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            if (format === 'csv') {
                exportTablesToCsv(tables);
            } else {
                exportTablesToJson(tables);
            }
            toast.success(
                t('tables.bulkExportSuccess', 'Successfully exported {{count}} table(s)', { count })
            );
            onClose();
        } catch (error: any) {
            console.error('Failed to export tables:', error);
            toast.error(t('tables.bulkExportError', 'Failed to export tables'));
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>
                        {t('tables.bulkExportTitle', 'Export {{count}} Table(s)', { count })}
                    </DialogTitle>
                    <DialogDescription>
                        {t('tables.bulkExportDescription', 'Choose export format for the selected tables')}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'csv' | 'json')}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="csv" id="csv" />
                            <Label htmlFor="csv" className="cursor-pointer">
                                {t('tables.exportCsv', 'CSV Format')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="json" id="json" />
                            <Label htmlFor="json" className="cursor-pointer">
                                {t('tables.exportJson', 'JSON Format')}
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isExporting}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting}>
                        {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.export', 'Export')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
