'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { formatCurrency } from '../utils';
import Image from 'next/image';

interface MenuItem {
    itemId: number;
    itemCode: string;
    itemName: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    categoryId: number;
    isAvailable: boolean;
    category?: {
        categoryId: number;
        categoryName: string;
    };
}

interface MenuItemPickerProps {
    items: MenuItem[];
    onSelectItem: (item: MenuItem) => void;
    selectedItemId?: number;
}

export function MenuItemPicker({
    items,
    onSelectItem,
    selectedItemId,
}: MenuItemPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

    // Get unique categories from items
    const categories = useMemo(() => {
        const categoryMap = new Map();
        items.forEach((item) => {
            if (item.category) {
                categoryMap.set(item.category.categoryId, item.category);
            }
        });
        return Array.from(categoryMap.values());
    }, [items]);

    // Filter items based on search and category
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            // Only show available items
            if (!item.isAvailable) return false;

            // Filter by category
            if (
                selectedCategoryId !== 'all' &&
                item.categoryId !== parseInt(selectedCategoryId)
            ) {
                return false;
            }

            // Filter by search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    item.itemName.toLowerCase().includes(query) ||
                    item.itemCode.toLowerCase().includes(query) ||
                    item.description?.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [items, searchQuery, selectedCategoryId]);

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                        value={selectedCategoryId}
                        onValueChange={setSelectedCategoryId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
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
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No menu items found
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {filteredItems.map((item) => (
                        <Card
                            key={item.itemId}
                            className={`p-3 cursor-pointer transition-all hover:shadow-md ${selectedItemId === item.itemId
                                    ? 'ring-2 ring-primary'
                                    : ''
                                }`}
                            onClick={() => onSelectItem(item)}
                        >
                            <div className="flex gap-3">
                                {item.imageUrl && (
                                    <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-muted">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.itemName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">
                                        {item.itemName}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">
                                        {item.itemCode}
                                    </div>
                                    {item.description && (
                                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                            {item.description}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-semibold text-primary">
                                            {formatCurrency(item.price)}
                                        </span>
                                        {item.category && (
                                            <Badge variant="secondary" className="text-xs">
                                                {item.category.categoryName}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
