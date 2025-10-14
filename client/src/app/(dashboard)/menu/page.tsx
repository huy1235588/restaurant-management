'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Grid, List, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/types';

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

    const canManageMenu = user && hasPermission(user.role, 'menu.update');

    const filteredMenu = sampleMenu.filter((item) => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category.categoryName === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('menu.title') || 'Menu Management'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('menu.subtitle') || 'Manage menu items and categories'}
                    </p>
                </div>
                {canManageMenu && (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('menu.addItem') || 'Add Item'}
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('menu.searchPlaceholder') || 'Search menu items...'}
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={selectedCategory === 'Pizza' ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory('Pizza')}
                            >
                                Pizza
                            </Button>
                            <Button
                                variant={selectedCategory === 'Salads' ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory('Salads')}
                            >
                                Salads
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                        <Card key={item.itemId} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.itemName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-4xl">🍽️</span>
                                    </div>
                                )}
                                {!item.isAvailable && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Badge variant="destructive">Unavailable</Badge>
                                    </div>
                                )}
                            </div>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{item.itemName}</CardTitle>
                                    <Badge variant="outline">{item.category.categoryName}</Badge>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {item.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-primary">
                                        ${item.price.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        ⏱️ {item.preparationTime}min
                                    </span>
                                </div>
                                {canManageMenu && (
                                    <div className="mt-4 flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1">
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={item.isAvailable ? 'destructive' : 'default'}
                                            className="flex-1"
                                        >
                                            {item.isAvailable ? 'Disable' : 'Enable'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
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
