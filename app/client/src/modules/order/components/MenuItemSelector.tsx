'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMenuItems, useCategories } from '@/modules/menu/hooks';
import { MenuItem as MenuItemType } from '@/types';
import { ShoppingCartItem } from '../types';
import { formatCurrency } from '../utils';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MenuItemSelectorProps {
    cartItems: ShoppingCartItem[];
    onAddItem: (item: ShoppingCartItem) => void;
}

export function MenuItemSelector({ cartItems, onAddItem }: MenuItemSelectorProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    const { categories, loading: categoriesLoading } = useCategories({ isActive: true });
    const { data: menuData, loading: menuLoading } = useMenuItems({
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        isActive: true,
    });

    const isLoading = categoriesLoading || menuLoading;
    const menuItems = menuData?.items || [];

    // Memoize cart items lookup map for O(1) access
    const cartItemsMap = useMemo(() => {
        const map = new Map<number, number>();
        cartItems.forEach(item => {
            map.set(item.menuItemId, item.quantity);
        });
        return map;
    }, [cartItems]);

    // Memoize search handler
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    // Memoize category change handler
    const handleCategoryChange = useCallback((value: string) => {
        setSelectedCategory(value === 'all' ? null : Number(value));
    }, []);

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('orders.searchFood')}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-9"
                />
            </div>

            {/* Category Tabs */}
            {!categoriesLoading && categories.length > 0 && (
                <Tabs
                    value={selectedCategory?.toString() || 'all'}
                    onValueChange={handleCategoryChange}
                >
                    <TabsList className="w-full justify-start overflow-x-auto">
                        <TabsTrigger value="all">{t('orders.all')}</TabsTrigger>
                        {categories.map((category) => (
                            <TabsTrigger key={category.categoryId} value={category.categoryId.toString()}>
                                {category.categoryName}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}

            {/* Menu Items Grid */}
            {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                    {t('orders.loading')}
                </div>
            ) : menuItems.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    {t('orders.noItemsFound')}
                </div>
            ) : (
                <ScrollArea className="h-[500px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
                        {menuItems.map((item) => (
                            <MenuItemCard
                                key={item.itemId}
                                item={item}
                                onAdd={onAddItem}
                                cartQuantity={cartItemsMap.get(item.itemId) || 0}
                            />
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}

interface MenuItemCardProps {
    item: MenuItemType;
    onAdd: (item: ShoppingCartItem) => void;
    cartQuantity: number;
}

const MenuItemCard = memo(function MenuItemCard({ item, onAdd, cartQuantity }: MenuItemCardProps) {
    const { t } = useTranslation();
    
    const handleAdd = useCallback(() => {
        onAdd({
            menuItemId: item.itemId,
            name: item.itemName,
            price: item.price,
            quantity: 1,
            specialRequests: undefined,
        });
    }, [onAdd, item.itemId, item.itemName, item.price]);

    return (
        <div className="relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            {/* Image */}
            {item.imageUrl && (
                <div className="aspect-square bg-muted">
                    <img
                        src={item.imageUrl}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-3 space-y-2">
                <div>
                    <h4 className="font-semibold text-sm line-clamp-2">
                        {item.itemName}
                    </h4>
                    {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                        {formatCurrency(item.price)}
                    </span>
                    <Button
                        size="sm"
                        variant={cartQuantity > 0 ? 'default' : 'outline'}
                        onClick={handleAdd}
                    >
                        <Plus className="h-4 w-4" />
                        {cartQuantity > 0 && (
                            <span className="ml-1">({cartQuantity})</span>
                        )}
                    </Button>
                </div>

                {!item.isAvailable && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                        {t('orders.soldOut')}
                    </Badge>
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if item or cart quantity changed
    return (
        prevProps.item.itemId === nextProps.item.itemId &&
        prevProps.item.isAvailable === nextProps.item.isAvailable &&
        prevProps.item.price === nextProps.item.price &&
        prevProps.cartQuantity === nextProps.cartQuantity
    );
});
