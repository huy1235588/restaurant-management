'use client';

import Image from 'next/image';
import { MenuItem } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { formatPrice, getSpicyLevelEmoji } from '../utils';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/lib/utils';

interface MenuItemCardProps {
    item: MenuItem;
    onEdit?: (item: MenuItem) => void;
    onDelete?: (item: MenuItem) => void;
    onDuplicate?: (item: MenuItem) => void;
    onViewDetails: (item: MenuItem) => void;
    onToggleAvailability?: (item: MenuItem, isAvailable: boolean) => Promise<void>;
}

export function MenuItemCard({
    item,
    onEdit,
    onDelete,
    onDuplicate,
    onViewDetails,
    onToggleAvailability,
}: MenuItemCardProps) {
    const { t } = useTranslation();

    const handleToggleAvailability = async (checked: boolean) => {
        if (onToggleAvailability) {
            await onToggleAvailability(item, checked);
        }
    };

    return (
        <Card className="p-0 gap-2 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer border-0 hover:border-primary/20">
            <div
                className="relative aspect-7/4 bg-muted cursor-pointer"
                onClick={() => onViewDetails(item)}
            >
                {getImageUrl(item.imagePath) ? (
                    <Image
                        src={getImageUrl(item.imagePath)!}
                        alt={item.itemName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="eager"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10">
                        <span className="text-4xl font-bold text-muted-foreground/30">
                            {item.itemName.charAt(0)}
                        </span>
                    </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {item.category && (
                        <Badge variant="secondary" className="text-xs">
                            {item.category.categoryName}
                        </Badge>
                    )}
                    {/* TODO */}
                    {/* {item.isVegetarian && (
                        <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-300">
                            🌱 Vegan
                        </Badge>
                    )}
                    {item.spicyLevel != undefined && item.spicyLevel > 0 && (
                        <Badge variant="outline" className="text-xs bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-300">
                            {getSpicyLevelEmoji(item.spicyLevel)}
                        </Badge>
                    )} */}
                </div>
                {!item.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">{t('common.inactive')}</Badge>
                    </div>
                )}
            </div>

            <CardContent className="px-4 py-2" onClick={() => onViewDetails(item)}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base line-clamp-1 mb-0.5 group-hover:text-primary">
                            {item.itemName}
                        </h3>
                        <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                    </div>
                    <Badge variant={item.isAvailable ? 'default' : 'destructive'} className="ml-2 shrink-0">
                        {item.isAvailable ? t('menu.available') : t('menu.outOfStock')}
                    </Badge>
                </div>
                <p className="text-lg font-bold text-primary">{formatPrice(item.price)}</p>
                {item.preparationTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                        ⏱️ {item.preparationTime} {t('menu.minutes')}
                    </p>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={item.isAvailable}
                        onCheckedChange={handleToggleAvailability}
                        disabled={!item.isActive || !onToggleAvailability}
                    />
                    <span className="text-xs text-muted-foreground">{t('menu.available')}</span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(item)}>
                            <Eye className="w-4 h-4 mr-2" />
                            {t('menu.viewDetails')}
                        </DropdownMenuItem>
                        {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                                <Edit className="w-4 h-4 mr-2" />
                                {t('common.edit')}
                            </DropdownMenuItem>
                        )}
                        {/* {onDuplicate && (
                            <DropdownMenuItem onClick={() => onDuplicate(item)}>
                                <Copy className="w-4 h-4 mr-2" />
                                {t('common.duplicate')}
                            </DropdownMenuItem>
                        )} */}
                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(item)}
                                className="text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('common.delete')}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}
