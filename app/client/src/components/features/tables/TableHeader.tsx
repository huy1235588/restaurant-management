import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, LayoutList, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TableHeaderProps {
    onCreateTable: () => void;
    onRefresh: () => void;
    viewMode: 'list' | 'floor';
    onViewModeChange: (mode: 'list' | 'floor') => void;
}

export function TableHeader({ onCreateTable, onRefresh, viewMode, onViewModeChange }: TableHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('tables.title', 'Tables')}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {t('tables.subtitle', 'Manage your restaurant tables and floor plan')}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex border rounded-md">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('list')}
                        className="rounded-r-none"
                    >
                        <LayoutList className="w-4 h-4 mr-2" />
                        {t('tables.listView', 'List')}
                    </Button>
                    <Button
                        variant={viewMode === 'floor' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('floor')}
                        className="rounded-l-none"
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        {t('tables.floorView', 'Floor Plan')}
                    </Button>
                </div>
                <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('common.refresh', 'Refresh')}
                </Button>
                <Button size="sm" onClick={onCreateTable}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('tables.createTable', 'New Table')}
                </Button>
            </div>
        </div>
    );
}
