import { Search, Filter, RotateCcw, List, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FloorSelector } from './FloorSelector';
import { TableStatus } from '@/types';

export type TablesViewMode = 'list' | 'floor';
export type TableSortField = 'tableNumber' | 'capacity' | 'floor' | 'status' | 'updatedAt';
export type TableSortOrder = 'asc' | 'desc';

interface TablesFiltersProps {
    searchValue: string;
    statusValue: TableStatus | 'all';
    floorValue: string;
    sectionValue: string;
    activeValue: 'all' | 'active' | 'inactive';
    viewMode: TablesViewMode;
    sortField: TableSortField;
    sortOrder: TableSortOrder;
    floors: number[];
    onSearchChange: (value: string) => void;
    onStatusChange: (value: TableStatus | 'all') => void;
    onFloorChange: (value: string) => void;
    onSectionChange: (value: string) => void;
    onActiveChange: (value: 'all' | 'active' | 'inactive') => void;
    onViewModeChange: (mode: TablesViewMode) => void;
    onSortChange: (field: TableSortField) => void;
    onSortOrderToggle: () => void;
    onResetFilters: () => void;
}

const STATUS_OPTIONS: Array<{ value: TableStatus | 'all'; labelKey: string; fallback: string }> = [
    { value: 'all', labelKey: 'tables.filters.allStatuses', fallback: 'All statuses' },
    { value: 'available', labelKey: 'tables.status.available', fallback: 'Available' },
    { value: 'occupied', labelKey: 'tables.status.occupied', fallback: 'Occupied' },
    { value: 'reserved', labelKey: 'tables.status.reserved', fallback: 'Reserved' },
    { value: 'maintenance', labelKey: 'tables.status.maintenance', fallback: 'Maintenance' },
];

const SORT_LABELS: Record<TableSortField, { key: string; fallback: string }> = {
    tableNumber: { key: 'tables.columns.number', fallback: 'Table number' },
    capacity: { key: 'tables.columns.capacity', fallback: 'Capacity' },
    floor: { key: 'tables.columns.floor', fallback: 'Floor' },
    status: { key: 'tables.columns.status', fallback: 'Status' },
    updatedAt: { key: 'tables.columns.updatedAt', fallback: 'Last updated' },
};

export function TablesFilters({
    searchValue,
    statusValue,
    floorValue,
    sectionValue,
    activeValue,
    viewMode,
    sortField,
    sortOrder,
    floors,
    onSearchChange,
    onStatusChange,
    onFloorChange,
    onSectionChange,
    onActiveChange,
    onViewModeChange,
    onSortChange,
    onSortOrderToggle,
    onResetFilters,
}: TablesFiltersProps) {
    const { t } = useTranslation();

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Filter className="h-5 w-5" />
                        <CardTitle className="text-lg text-foreground">
                            {t('tables.filters.title', 'Filters')}
                        </CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex overflow-hidden rounded-md border bg-muted">
                            <Button
                                type="button"
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                className="h-9 w-9 p-0"
                                onClick={() => onViewModeChange('list')}
                                title={t('tables.view.list', 'List view')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === 'floor' ? 'default' : 'ghost'}
                                size="sm"
                                className="h-9 w-9 p-0"
                                onClick={() => onViewModeChange('floor')}
                                title={t('tables.view.floor', 'Floor plan view')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2"
                            onClick={onResetFilters}
                        >
                            <RotateCcw className="h-4 w-4" />
                            {t('tables.filters.reset', 'Reset')}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchValue}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder={t('tables.filters.searchPlaceholder', 'Search by table number or name')}
                            className="h-10 pl-9"
                            aria-label={t('tables.filters.search', 'Search tables')}
                        />
                    </div>

                    <Select value={statusValue} onValueChange={(value) => onStatusChange(value as TableStatus | 'all')}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('tables.filters.status', 'Status')} />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {t(option.labelKey, option.fallback)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <FloorSelector
                        floors={floors}
                        value={floorValue}
                        onChange={onFloorChange}
                        disabled={floors.length === 0}
                    />

                    <Input
                        value={sectionValue}
                        onChange={(event) => onSectionChange(event.target.value)}
                        placeholder={t('tables.filters.section', 'Filter by section')}
                        className="h-10"
                        aria-label={t('tables.filters.sectionLabel', 'Section filter')}
                    />

                    <Select value={activeValue} onValueChange={(value) => onActiveChange(value as 'all' | 'active' | 'inactive')}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('tables.filters.availability', 'Availability')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('tables.filters.allTables', 'All tables')}</SelectItem>
                            <SelectItem value="active">{t('tables.filters.active', 'Active')}</SelectItem>
                            <SelectItem value="inactive">{t('tables.filters.inactive', 'Inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        {t('tables.filters.sortBy', 'Sort by')}:
                    </span>
                    <Select value={sortField} onValueChange={(value) => onSortChange(value as TableSortField)}>
                        <SelectTrigger className="h-9 w-52">
                            <SelectValue placeholder={t('tables.filters.selectSort', 'Select sort field')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(SORT_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    {t(label.key, label.fallback)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={onSortOrderToggle}
                    >
                        {sortOrder === 'asc'
                            ? t('tables.filters.sortAsc', 'Ascending')
                            : t('tables.filters.sortDesc', 'Descending')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
