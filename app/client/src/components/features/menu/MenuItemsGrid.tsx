import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { MenuItem } from '@/types';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useSidebarResponsive } from '@/hooks/useSidebarResponsive';

interface MenuItemsGridProps {
    menuItems: MenuItem[];
    loading: boolean;
    onView: (item: MenuItem) => void;
    onEdit: (item: MenuItem) => void;
    onDelete: (item: MenuItem) => void;
    onToggleAvailability: (item: MenuItem) => void;
}

export function MenuItemsGrid({
    menuItems,
    loading,
    onView,
    onEdit,
    onDelete,
    onToggleAvailability,
}: MenuItemsGridProps) {
    const { t } = useTranslation();
    const { gridCols, gap } = useSidebarResponsive();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner />
            </div>
        );
    }

    if (menuItems.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-muted-foreground text-lg">
                    {t('menu.noItems', 'No menu items found')}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    {t('menu.noItemsDescription', 'Try adjusting your filters or add a new item')}
                </p>
            </div>
        );
    }

    return (
        <div className={`grid ${gridCols} ${gap} transition-all duration-300 ease-in-out`}>
            {menuItems.map((item) => (
                <Card
                    key={item.itemId}
                    className="gap-2 pt-0 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                    {/* Image Container */}
                    <div className="relative w-full aspect-square bg-muted overflow-hidden">
                        {item.imageUrl ? (
                            <Image
                                fill
                                src={item.imageUrl}
                                alt={item.itemName}
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                                <span className="text-sm text-muted-foreground">No image</span>
                            </div>
                        )}

                        {/* Status Badges Overlay */}
                        <div className="absolute top-2 right-2 flex gap-1">
                            {!item.isAvailable && (
                                <Badge variant="destructive" className="text-xs">
                                    {t('menu.unavailable', 'Unavailable')}
                                </Badge>
                            )}
                            {!item.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                    {t('menu.inactive', 'Inactive')}
                                </Badge>
                            )}
                        </div>

                        {/* Availability Toggle - Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex items-center gap-2 bg-white/50 text-black/50 px-3 py-2 rounded-md">
                                <span className="text-xs font-medium">
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                                <Switch
                                    checked={item.isAvailable}
                                    onCheckedChange={() => {
                                        onToggleAvailability(item);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-3">
                        {/* Code */}
                        <div className="text-xs text-muted-foreground font-mono mb-1">
                            {item.itemCode}
                        </div>

                        {/* Name */}
                        <div className="font-semibold text-sm line-clamp-2 mb-1">
                            {item.itemName}
                        </div>

                        {/* Category */}
                        <div className="mb-2">
                            <Badge variant="destructive" color='red' className="text-xs font-normal">
                                {item.category?.categoryName || 'N/A'}
                            </Badge>
                        </div>

                        {/* Description */}
                        {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {item.description}
                            </p>
                        )}

                        {/* Price */}
                        <div className="font-bold text-primary text-sm mb-3">
                            {formatCurrency(item.price)}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={() => onView(item)}
                            >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={() => onEdit(item)}
                            >
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                onClick={() => onDelete(item)}
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
