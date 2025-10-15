'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { MenuFilters } from '@/components/menu/MenuFilters';
import { MenuItemCard } from '@/components/menu/MenuItemCard';

// Sample menu data - replace with API call
const sampleMenu = [
    {
        itemId: 1,
        itemName: 'Margherita Pizza',
        categoryId: 1,
        category: { categoryName: 'Pizza' },
        price: 12.99,
        description: 'Classic tomato sauce, mozzarella, and fresh basil',
        imageUrl: '/images/menu/pizza.jpg',
        isAvailable: true,
        preparationTime: 15,
    },
    {
        itemId: 2,
        itemName: 'Caesar Salad',
        categoryId: 2,
        category: { categoryName: 'Salads' },
        price: 8.99,
        description: 'Romaine lettuce, parmesan, croutons, Caesar dressing',
        imageUrl: '/images/menu/salad.jpg',
        isAvailable: true,
        preparationTime: 10,
    },
];

export default function MenuPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const canManageMenu = user ? hasPermission(user.role, 'menu.update') : false;

    const filteredMenu = sampleMenu.filter((item) => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category.categoryName === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(sampleMenu.map(item => item.category.categoryName)))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title={t('menu.title') || 'Menu Management'}
                subtitle={t('menu.subtitle') || 'Manage menu items and categories'}
                actions={
                    canManageMenu && (
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('menu.addItem') || 'Add Item'}
                        </Button>
                    )
                }
            />

            {/* Filters */}
            <MenuFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
                searchPlaceholder={t('menu.searchPlaceholder') || 'Search menu items...'}
            />

            {/* Menu Items */}
            {filteredMenu.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            {t('menu.noItems') || 'No menu items found'}
                        </p>
                    </CardContent>
                </Card>
            ) : viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredMenu.map((item) => (
                        <MenuItemCard
                            key={item.itemId}
                            item={item}
                            onEdit={() => console.log('Edit', item.itemId)}
                            onToggleAvailability={() => console.log('Toggle', item.itemId)}
                            canManage={canManageMenu}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredMenu.map((item) => (
                        <Card key={item.itemId} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg flex items-center justify-center text-2xl">
                                        🍽️
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{item.itemName}</h3>
                                            <Badge variant="outline" className="text-xs">
                                                {item.category.categoryName}
                                            </Badge>
                                            {!item.isAvailable && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Unavailable
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">
                                            ${item.price.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            ⏱️ {item.preparationTime}min
                                        </p>
                                    </div>
                                    {canManageMenu && (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">
                                                Edit
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
