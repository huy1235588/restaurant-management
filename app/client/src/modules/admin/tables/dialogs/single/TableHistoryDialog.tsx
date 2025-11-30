import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table } from '@/types';
import { useTranslation } from 'react-i18next';
import { Clock, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { tableApi } from '@/modules/admin/tables/services/table.service';
import { Skeleton } from '@/components/ui/skeleton';

interface TableHistoryDialogProps {
    open: boolean;
    table: Table | null;
    onClose: () => void;
}

interface HistoryEntry {
    id: number;
    tableId: number;
    action: string;
    oldValue?: string;
    newValue?: string;
    changedAt: string;
    changedBy?: string;
}

export function TableHistoryDialog({ open, table, onClose }: TableHistoryDialogProps) {
    const { t } = useTranslation();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && table) {
            loadHistory();
        }
    }, [open, table]);

    const loadHistory = async () => {
        if (!table) return;
        try {
            setLoading(true);
            // This would call an API endpoint to fetch table history
            // For now, we'll show a placeholder structure
            // In a real implementation, this would be: await tableApi.getHistory(table.tableId);
            // Mock data for demonstration
            const mockHistory: HistoryEntry[] = [
                {
                    id: 1,
                    tableId: table.tableId,
                    action: 'Status changed',
                    oldValue: 'available',
                    newValue: 'occupied',
                    changedAt: new Date().toISOString(),
                    changedBy: 'Admin User',
                },
                {
                    id: 2,
                    tableId: table.tableId,
                    action: 'Table created',
                    newValue: 'available',
                    changedAt: new Date(Date.now() - 86400000).toISOString(),
                    changedBy: 'System',
                },
            ];
            setHistory(mockHistory);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {t('tables.history', 'Table History')} - {table?.tableNumber}
                    </DialogTitle>
                    <DialogDescription>
                        {t('tables.historyDesc', 'View all changes made to this table')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {loading ? (
                        <>
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </>
                    ) : history.length > 0 ? (
                        <div className="space-y-4">
                            {history.map((entry, index) => (
                                <div key={entry.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                                    <div className="shrink-0">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                                            {index === 0 ? (
                                                <Clock className="h-4 w-4 text-blue-600" />
                                            ) : (
                                                <User className="h-4 w-4 text-blue-600" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{entry.action}</p>
                                        {entry.oldValue && entry.newValue && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {t('tables.changedFrom', 'From')} <span className="font-mono">{entry.oldValue}</span> {t('tables.to', 'to')} <span className="font-mono">{entry.newValue}</span>
                                            </p>
                                        )}
                                        {entry.newValue && !entry.oldValue && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {t('tables.setValue', 'Set to')} <span className="font-mono">{entry.newValue}</span>
                                            </p>
                                        )}
                                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                                            <span>
                                                {new Date(entry.changedAt).toLocaleDateString()} {new Date(entry.changedAt).toLocaleTimeString()}
                                            </span>
                                            {entry.changedBy && <span>•</span>}
                                            {entry.changedBy && <span>{entry.changedBy}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            {t('tables.noHistory', 'No history available')}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
