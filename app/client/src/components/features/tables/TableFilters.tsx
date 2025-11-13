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
    onSearchChange: (term: string) => void;
    onStatusFilterChange: (status: string) => void;
    onFloorFilterChange: (floor: string) => void;
    onSectionFilterChange: (section: string) => void;
}

export function TableFilters({
    searchTerm,
    statusFilter,
    floorFilter,
    sectionFilter,
    onSearchChange,
    onStatusFilterChange,
    onFloorFilterChange,
    onSectionFilterChange,
}: TableFiltersProps) {
    const { t } = useTranslation();

    return (
        <Card className="p-4">
            <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t('tables.searchPlaceholder', 'Search tables...')}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('tables.statusFilter', 'All Status')} />
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
                    <SelectTrigger>
                        <SelectValue placeholder={t('tables.floorFilter', 'All Floors')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('common.all', 'All Floors')}</SelectItem>
                        <SelectItem value="1">{t('tables.floor', 'Floor')} 1</SelectItem>
                        <SelectItem value="2">{t('tables.floor', 'Floor')} 2</SelectItem>
                        <SelectItem value="3">{t('tables.floor', 'Floor')} 3</SelectItem>
                        <SelectItem value="4">{t('tables.floor', 'Floor')} 4</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sectionFilter} onValueChange={onSectionFilterChange}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('tables.sectionFilter', 'All Sections')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('common.all', 'All Sections')}</SelectItem>
                        <SelectItem value="main">{t('tables.sections.main', 'Main')}</SelectItem>
                        <SelectItem value="patio">{t('tables.sections.patio', 'Patio')}</SelectItem>
                        <SelectItem value="vip">{t('tables.sections.vip', 'VIP')}</SelectItem>
                        <SelectItem value="bar">{t('tables.sections.bar', 'Bar')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </Card>
    );
}
