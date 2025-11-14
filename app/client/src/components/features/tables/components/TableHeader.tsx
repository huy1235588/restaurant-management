import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, RefreshCw, LayoutList, LayoutGrid, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Table } from '@/types';
import { exportTablesToCsv, exportTablesToJson } from '@/utils/table-export';

interface TableHeaderProps {
    tables?: Table[];
    onCreateTable: () => void;
    onRefresh: () => void;
    viewMode: 'list' | 'visual';
    onViewModeChange: (mode: 'list' | 'visual') => void;
}

export function TableHeader({ tables = [], onCreateTable, onRefresh, viewMode, onViewModeChange }: TableHeaderProps) {
    const { t } = useTranslation();

    const handleExportCsv = () => {
        exportTablesToCsv(tables, `tables-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportJson = () => {
        exportTablesToJson(tables, `tables-${new Date().toISOString().split('T')[0]}.json`);
    };

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t('tables.title', 'Tables')}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                    {t('tables.subtitle', 'Manage your restaurant tables and floor plan')}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex border rounded-md">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('list')}
                        className="rounded-r-none"
                        title={t('tables.listViewTitle', 'List View')}
                    >
                        <LayoutList className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">{t('tables.listView', 'List')}</span>
                    </Button>
                    <Button
                        variant={viewMode === 'visual' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('visual')}
                        className="rounded-l-none"
                        title={t('tables.visualEditorTitle', 'Visual Floor Plan Editor')}
                    >
                        <LayoutGrid className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">{t('tables.visualEditor', 'Visual Editor')}</span>
                    </Button>
                </div>
                <Button variant="outline" size="sm" onClick={onRefresh} className="hidden sm:flex">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('common.refresh', 'Refresh')}
                </Button>
                <Button variant="outline" size="sm" onClick={onRefresh} className="sm:hidden">
                    <RefreshCw className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="hidden md:flex">
                            <Download className="w-4 h-4 mr-2" />
                            {t('tables.export', 'Export')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleExportCsv}>
                            {t('tables.exportCsv', 'Export as CSV')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportJson}>
                            {t('tables.exportJson', 'Export as JSON')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" onClick={onCreateTable} className="hidden sm:flex">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('tables.createTable', 'New Table')}
                </Button>
                <Button size="sm" onClick={onCreateTable} className="sm:hidden">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
