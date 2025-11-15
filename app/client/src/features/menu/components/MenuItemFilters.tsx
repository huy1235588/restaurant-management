'use client';

import { Category } from '@/types';
import { MenuFilters as MenuFiltersType } from '../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Filter, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface MenuItemFiltersProps {
    filters: MenuFiltersType;
    categories: Category[];
    onChange: (filters: MenuFiltersType) => void;
    onClear: () => void;
}

export function MenuItemFilters({
    filters,
    categories,
    onChange,
    onClear,
}: MenuItemFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    const updateFilter = (key: keyof MenuFiltersType, value: any) => {
        onChange({ ...filters, [key]: value });
    };

    const removeFilter = (key: keyof MenuFiltersType) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onChange(newFilters);
    };

    const activeFilterCount = Object.keys(filters).filter((key) => {
        const value = filters[key as keyof MenuFiltersType];
        return value !== undefined && value !== null && value !== '';
    }).length;

    const getFilterLabel = (key: keyof MenuFiltersType): string => {
        const value = filters[key];
        switch (key) {
            case 'categoryId':
                const category = categories.find((c) => c.categoryId === value);
                return category ? `Category: ${category.categoryName}` : '';
            case 'isAvailable':
                return value === true ? 'Available' : 'Out of Stock';
            case 'isActive':
                return value === true ? 'Active' : 'Inactive';
            case 'isVegetarian':
                return 'Vegetarian';
            case 'spicyLevel':
                return `Spicy Level: ${value}`;
            case 'minPrice':
                return `Min Price: ${value}`;
            case 'maxPrice':
                return `Max Price: ${value}`;
            default:
                return '';
        }
    };

    const activeFilters = Object.keys(filters)
        .filter((key) => {
            const value = filters[key as keyof MenuFiltersType];
            return value !== undefined && value !== null && value !== '' && key !== 'search';
        })
        .map((key) => ({
            key: key as keyof MenuFiltersType,
            label: getFilterLabel(key as keyof MenuFiltersType),
        }));

    return (
        <div className="space-y-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {activeFilterCount}
                                </Badge>
                            )}
                            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </Button>
                    </CollapsibleTrigger>

                    {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={onClear}>
                            Clear All
                        </Button>
                    )}
                </div>

                <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={filters.categoryId?.toString() || 'all'}
                                onValueChange={(value) =>
                                    updateFilter('categoryId', value === 'all' ? undefined : Number(value))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All categories</SelectItem>
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
                        </div>

                        <div className="space-y-2">
                            <Label>Availability</Label>
                            <Select
                                value={
                                    filters.isAvailable === undefined
                                        ? 'all'
                                        : filters.isAvailable
                                        ? 'available'
                                        : 'out-of-stock'
                                }
                                onValueChange={(value) =>
                                    updateFilter(
                                        'isAvailable',
                                        value === 'all' ? undefined : value === 'available'
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={
                                    filters.isActive === undefined
                                        ? 'all'
                                        : filters.isActive
                                        ? 'active'
                                        : 'inactive'
                                }
                                onValueChange={(value) =>
                                    updateFilter(
                                        'isActive',
                                        value === 'all' ? undefined : value === 'active'
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Spicy Level</Label>
                            <Select
                                value={filters.spicyLevel?.toString() || 'all'}
                                onValueChange={(value) =>
                                    updateFilter('spicyLevel', value === 'all' ? undefined : Number(value))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="0">Not spicy</SelectItem>
                                    <SelectItem value="1">🌶️ Mild</SelectItem>
                                    <SelectItem value="2">🌶️🌶️ Medium</SelectItem>
                                    <SelectItem value="3">🌶️🌶️🌶️ Hot</SelectItem>
                                    <SelectItem value="4">🌶️🌶️🌶️🌶️ Very hot</SelectItem>
                                    <SelectItem value="5">🌶️🌶️🌶️🌶️🌶️ Extremely hot</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Min Price</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={filters.minPrice || ''}
                                onChange={(e) =>
                                    updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Max Price</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="No limit"
                                value={filters.maxPrice || ''}
                                onChange={(e) =>
                                    updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)
                                }
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-7">
                            <Switch
                                id="vegetarian"
                                checked={filters.isVegetarian || false}
                                onCheckedChange={(checked) =>
                                    updateFilter('isVegetarian', checked || undefined)
                                }
                            />
                            <Label htmlFor="vegetarian" className="cursor-pointer">
                                🌱 Vegetarian Only
                            </Label>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {activeFilters.map(({ key, label }) => (
                        <Badge key={key} variant="secondary" className="gap-1">
                            {label}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => removeFilter(key)}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
