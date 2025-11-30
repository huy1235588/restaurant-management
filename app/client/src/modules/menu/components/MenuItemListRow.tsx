'use client';

import Image from 'next/image';
import { MenuItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react';
import { formatPrice, getSpicyLevelEmoji } from '../utils';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/lib/utils';

interface MenuItemListRowProps {
    item: MenuItem;
    onEdit: (item: MenuItem) => void;
    onDelete: (item: MenuItem) => void;
    onDuplicate: (item: MenuItem) => void;
    onToggleAvailability: (item: MenuItem, isAvailable: boolean) => Promise<void>;
    onClick: (item: MenuItem) => void;
}

export function MenuItemListRow({
    item,
    onEdit,
    onDelete,
    onDuplicate,
    onToggleAvailability,
    onClick,
}: MenuItemListRowProps) {
    const { t } = useTranslation();

    const handleToggleAvailability = async (checked: boolean) => {
        await onToggleAvailability(item, checked);
    };

    return (
        <div
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onClick(item)}
        >
            <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 bg-muted">
                {getImageUrl(item.imagePath) ? (
                    <Image
                        src={getImageUrl(item.imagePath)!}
                        alt={item.itemName}
                        fill
                        className="object-cover"
                        sizes="64px"
                        loading="eager"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10">
                        <span className="text-lg font-bold text-muted-foreground/30">
                            {item.itemName.charAt(0)}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold line-clamp-1">{item.itemName}</h4>
                    {/* TODO */}
                    {/* {item.isVegetarian && <span className="text-xs">🌱</span>}
                    {item.spicyLevel != undefined && item.spicyLevel > 0 && (
                        <span className="text-xs">{getSpicyLevelEmoji(item.spicyLevel)}</span>
                    )} */}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.itemCode}</span>
                    {item.category && (
                        <>
                            <span>•</span>
                            <span>{item.category.categoryName}</span>
                        </>
                    )}
                    {item.preparationTime && (
                        <>
                            <span>•</span>
                            <span>⏱️ {item.preparationTime} min</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price)}</p>
                    <Badge variant={item.isAvailable ? 'default' : 'destructive'} className="text-xs">
                        {item.isAvailable ? t('menu.available') : t('menu.out')}
                    </Badge>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Switch
                        checked={item.isAvailable}
                        onCheckedChange={handleToggleAvailability}
                        disabled={!item.isActive}
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(item)}>
                            <Copy className="w-4 h-4 mr-2" />
                            {t('common.duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(item)}
                            className="text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('common.delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
