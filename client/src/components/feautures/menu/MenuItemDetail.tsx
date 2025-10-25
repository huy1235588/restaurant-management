'use client';

import { MenuItem } from '@/types';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Clock,
    Flame,
    Leaf,
    DollarSign,
    TrendingUp,
    Package,
    Tag,
    Calendar,
} from 'lucide-react';

interface MenuItemDetailProps {
    item: MenuItem;
    onClose: () => void;
}

export function MenuItemDetail({ item, onClose }: MenuItemDetailProps) {
    const { t } = useTranslation();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateProfit = () => {
        if (item.cost) {
            const profit = item.price - item.cost;
            const profitMargin = ((profit / item.price) * 100).toFixed(1);
            return { profit, profitMargin };
        }
        return null;
    };

    const profitData = calculateProfit();

    return (
        <div className="space-y-6">
            {/* Header with Image */}
            <div className="flex flex-col md:flex-row gap-6">
                {item.imageUrl && (
                    <div className="w-full md:w-1/3">
                        <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    </div>
                )}
                <div className="flex-1 space-y-3">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-2xl font-bold">{item.itemName}</h3>
                            <Badge variant={item.isActive ? 'default' : 'secondary'}>
                                {item.isActive ? t('menu.active', 'Active') : t('menu.inactive', 'Inactive')}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Tag className="h-4 w-4" />
                            <span>{item.itemCode}</span>
                        </div>
                    </div>

                    {item.description && (
                        <p className="text-muted-foreground">{item.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {item.isVegetarian && (
                            <Badge variant="outline" className="gap-1">
                                <Leaf className="h-3 w-3" />
                                {t('menu.vegetarian', 'Vegetarian')}
                            </Badge>
                        )}
                        {item.spicyLevel && item.spicyLevel > 0 && (
                            <Badge variant="outline" className="gap-1">
                                <Flame className="h-3 w-3" />
                                {t('menu.spicyLevel', 'Spicy')}: {item.spicyLevel}/5
                            </Badge>
                        )}
                        {item.calories && item.calories > 0 && (
                            <Badge variant="outline">
                                {item.calories} {t('menu.calories', 'cal')}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                        {t('menu.category', 'Category')}
                    </div>
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">{item.category?.categoryName}</span>
                    </div>
                </div>

                {/* Price */}
                <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                        {t('menu.price', 'Price')}
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium text-lg">{formatCurrency(item.price)}</span>
                    </div>
                </div>

                {/* Cost */}
                {item.cost && item.cost > 0 && (
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">
                            {t('menu.cost', 'Cost')}
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">{formatCurrency(item.cost)}</span>
                        </div>
                    </div>
                )}

                {/* Profit Margin */}
                {profitData && (
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">
                            {t('menu.profitMargin', 'Profit Margin')}
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-green-500">
                                {formatCurrency(profitData.profit)} ({profitData.profitMargin}%)
                            </span>
                        </div>
                    </div>
                )}

                {/* Preparation Time */}
                {item.preparationTime && item.preparationTime > 0 && (
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">
                            {t('menu.preparationTime', 'Preparation Time')}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{item.preparationTime} {t('menu.minutes', 'minutes')}</span>
                        </div>
                    </div>
                )}

                {/* Availability */}
                <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                        {t('menu.availability', 'Availability')}
                    </div>
                    <Badge variant={item.isAvailable ? 'default' : 'secondary'} className="w-fit">
                        {item.isAvailable ? t('menu.available', 'Available') : t('menu.unavailable', 'Unavailable')}
                    </Badge>
                </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {t('menu.createdAt', 'Created')}
                    </div>
                    <div className="font-medium">{formatDate(item.createdAt)}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {t('menu.updatedAt', 'Last Updated')}
                    </div>
                    <div className="font-medium">{formatDate(item.updatedAt)}</div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4">
                <Button onClick={onClose}>{t('common.close', 'Close')}</Button>
            </div>
        </div>
    );
}
