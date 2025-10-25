import { Search, Filter } from 'lucide-react';
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
import { Category } from '@/types';

interface MenuFiltersProps {
    searchTerm: string;
    selectedCategory: string;
    availabilityFilter: string;
    categories: Category[];
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onAvailabilityChange: (value: string) => void;
}

export function MenuFilters({
    searchTerm,
    selectedCategory,
    availabilityFilter,
    categories,
    onSearchChange,
    onCategoryChange,
    onAvailabilityChange,
}: MenuFiltersProps) {
    const { t } = useTranslation();

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{t('menu.filters', 'Filters')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
            </CardContent>
        </Card>
    );
}
