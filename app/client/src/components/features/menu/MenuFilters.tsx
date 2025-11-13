import { Search, Filter, List, Grid3x3, ArrowUpDown, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';

type ViewMode = 'list' | 'grid';
type SortField = 'name' | 'price' | 'category' | 'code' | 'date';
type SortOrder = 'asc' | 'desc';

interface MenuFiltersProps {
    searchTerm: string;
    selectedCategory: string;
    availabilityFilter: string;
    categories: Category[];
    viewMode: ViewMode;
    sortField: SortField;
    sortOrder: SortOrder;
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onAvailabilityChange: (value: string) => void;
    onViewModeChange: (mode: ViewMode) => void;
    onSort: (field: SortField) => void;
    onReset: () => void;
}

export function MenuFilters({
    searchTerm,
    selectedCategory,
    availabilityFilter,
    categories,
    viewMode,
    sortField,
    sortOrder,
    onSearchChange,
    onCategoryChange,
    onAvailabilityChange,
    onViewModeChange,
    onSort,
    onReset,
}: MenuFiltersProps) {
    const { t } = useTranslation();

    const getSortLabel = () => {
        const labels: Record<SortField, string> = {
            name: t('menu.name', 'Name'),
            price: t('menu.price', 'Price'),
            category: t('menu.category', 'Category'),
            code: t('menu.code', 'Code'),
            date: t('menu.date', 'Date'),
        };
        return labels[sortField];
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">{t('menu.filters', 'Filters')}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        {/* Reset Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onReset}
                            className="h-9 gap-2"
                            title="Reset filters"
                        >
                            <RotateCcw className="h-4 w-4" />
                            {t('menu.reset', 'Reset')}
                        </Button>
                        {/* View Mode Toggle */}
                        <div className="flex gap-1 bg-muted p-1 rounded-lg">
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0 rounded-s-sm rounded-e-none"
                                onClick={() => onViewModeChange('list')}
                                title="List view"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0 rounded-e-sm rounded-s-none"
                                onClick={() => onViewModeChange('grid')}
                                title="Grid view"
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('menu.searchPlaceholder', 'Search menu items...')}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 h-10"
                        />
                    </div>

                    {/* Category Filter */}
                    <Select value={selectedCategory} onValueChange={onCategoryChange}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('menu.selectCategory', 'Select Category')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('menu.allCategories', 'All Categories')}
                            </SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.categoryId}
                                    value={category.categoryId.toString()}
                                >
                                    {category.categoryName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Availability Filter */}
                    <Select value={availabilityFilter} onValueChange={onAvailabilityChange}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('menu.selectAvailability', 'Select Availability')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('menu.allItems', 'All Items')}</SelectItem>
                            <SelectItem value="available">
                                {t('menu.available', 'Available')}
                            </SelectItem>
                            <SelectItem value="unavailable">
                                {t('menu.unavailable', 'Unavailable')}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort Dropdown */}
                    <div className="flex gap-2">
                        <Select value={sortField} onValueChange={(value) => onSort(value as SortField)}>
                            <SelectTrigger className="h-10 flex-1">
                                <SelectValue placeholder={t('menu.sortBy', 'Sort by')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">{t('menu.name', 'Name')}</SelectItem>
                                <SelectItem value="price">{t('menu.price', 'Price')}</SelectItem>
                                <SelectItem value="category">{t('menu.category', 'Category')}</SelectItem>
                                <SelectItem value="code">{t('menu.code', 'Code')}</SelectItem>
                                <SelectItem value="date">{t('menu.date', 'Date')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 p-0"
                            onClick={() => onSort(sortField)}
                            title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                        >
                            <ArrowUpDown
                                className={`h-4 w-4 transition-transform ${
                                    sortOrder === 'desc' ? 'rotate-180' : ''
                                }`}
                            />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
