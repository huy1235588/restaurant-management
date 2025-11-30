'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useExportReport } from '../hooks';
import { ExportType, ReportQueryParams } from '../types';
import { toast } from 'sonner';

interface ExportButtonProps {
    /** Current date range params for export */
    params?: ReportQueryParams;
    /** Disabled state */
    disabled?: boolean;
}

export function ExportButton({ params, disabled }: ExportButtonProps) {
    const { t } = useTranslation();
    const { exportReport } = useExportReport();
    const [isExporting, setIsExporting] = useState<ExportType | null>(null);

    const handleExport = async (type: ExportType) => {
        try {
            setIsExporting(type);
            await exportReport(type, params);
            toast.success(t('reports.exportSuccess'));
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(t('reports.exportError'));
        } finally {
            setIsExporting(null);
        }
    };

    const exportOptions: { type: ExportType; label: string }[] = [
        { type: 'revenue', label: t('reports.exportRevenue') },
        { type: 'top-items', label: t('reports.exportTopItems') },
        { type: 'orders', label: t('reports.exportOrders') },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={disabled || isExporting !== null}>
                    {isExporting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    {t('reports.export')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {exportOptions.map(({ type, label }) => (
                    <DropdownMenuItem
                        key={type}
                        onClick={() => handleExport(type)}
                        disabled={isExporting !== null}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        {label}
                        {isExporting === type && (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
