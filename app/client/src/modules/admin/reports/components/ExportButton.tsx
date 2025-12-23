'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
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
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const handleExport = async (type: ExportType, format: 'csv' | 'xlsx') => {
        try {
            const exportKey = `${type}-${format}`;
            setIsExporting(exportKey);
            await exportReport(type, params, format);
            toast.success(
                t('reports.exportSuccess', {
                    format: format.toUpperCase(),
                })
            );
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
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t('reports.selectReportType')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {exportOptions.map(({ type, label }) => (
                    <DropdownMenuSub key={type}>
                        <DropdownMenuSubTrigger disabled={isExporting !== null}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            {label}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem
                                onClick={() => handleExport(type, 'csv')}
                                disabled={isExporting !== null}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                CSV
                                {isExporting === `${type}-csv` && (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleExport(type, 'xlsx')}
                                disabled={isExporting !== null}
                            >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Excel (XLSX)
                                {isExporting === `${type}-xlsx` && (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
