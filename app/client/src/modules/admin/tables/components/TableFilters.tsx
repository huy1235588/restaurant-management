import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';

interface TableFiltersProps {
    searchTerm: string;
    statusFilter: string;
    floorFilter: string;
    sectionFilter: string;
    activeFilter?: string;
    onSearchChange: (term: string) => void;
    onStatusFilterChange: (status: string) => void;
    onFloorFilterChange: (floor: string) => void;
    onSectionFilterChange: (section: string) => void;
    onActiveFilterChange?: (active: string) => void;
}

export function TableFilters({
    searchTerm,
    statusFilter,
    floorFilter,
    sectionFilter,
    activeFilter = 'all',
    onSearchChange,
    onStatusFilterChange,
    onFloorFilterChange,
    onSectionFilterChange,
    onActiveFilterChange,
}: TableFiltersProps) {
    const { t } = useTranslation();

    return (
        <Card className="p-4" role="region" aria-label={t('tables.filters', 'Table filters')}>
            <div className="flex gap-4 flex-wrap">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t('tables.searchPlaceholder', 'Search tables...')}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                        aria-label={t('tables.searchTables', 'Search tables by number or name')}
                    />
                </div>

                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger aria-label={t('tables.filterByStatus', 'Filter by table status')}>
                        <SelectValue placeholder={t('tables.allStatus', 'All status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                        <SelectItem value="available">{t('tables.available', 'Available')}</SelectItem>
                        <SelectItem value="occupied">{t('tables.occupied', 'Occupied')}</SelectItem>
                        <SelectItem value="reserved">{t('tables.reserved', 'Reserved')}</SelectItem>
                        <SelectItem value="maintenance">{t('tables.maintenance', 'Maintenance')}</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={floorFilter} onValueChange={onFloorFilterChange}>
                    <SelectTrigger aria-label={t('tables.filterByFloor', 'Filter by floor')}>
                        <SelectValue placeholder={t('tables.allFloors', 'All floors')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('tables.allFloors', 'All floors')}</SelectItem>
                        <SelectItem value="1">{t('tables.floor', 'Floor')} 1</SelectItem>
                        <SelectItem value="2">{t('tables.floor', 'Floor')} 2</SelectItem>
                        <SelectItem value="3">{t('tables.floor', 'Floor')} 3</SelectItem>
                        <SelectItem value="4">{t('tables.floor', 'Floor')} 4</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sectionFilter} onValueChange={onSectionFilterChange}>
                    <SelectTrigger aria-label={t('tables.filterBySection', 'Filter by section')}>
                        <SelectValue placeholder={t('tables.allSections', 'All sections')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('tables.allSections', 'All sections')}</SelectItem>
                        <SelectItem value="main">{t('tables.sections.main', 'Main')}</SelectItem>
                        <SelectItem value="patio">{t('tables.sections.patio', 'Patio')}</SelectItem>
                        <SelectItem value="vip">{t('tables.sections.vip', 'VIP')}</SelectItem>
                        <SelectItem value="bar">{t('tables.sections.bar', 'Bar')}</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={activeFilter} onValueChange={onActiveFilterChange}>
                    <SelectTrigger aria-label={t('tables.filterByActive', 'Filter by active status')}>
                        <SelectValue placeholder={t('tables.allTables', 'All tables')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('tables.allTables', 'All tables')}</SelectItem>
                        <SelectItem value="true">{t('tables.active', 'Active')}</SelectItem>
                        <SelectItem value="false">{t('tables.inactive', 'Inactive')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </Card>
    );
}
