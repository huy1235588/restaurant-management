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

interface MenuItemCardProps {
    item: MenuItem;
    onEdit: (item: MenuItem) => void;
    onDelete: (item: MenuItem) => void;
    onDuplicate: (item: MenuItem) => void;
    onViewDetails: (item: MenuItem) => void;
    onToggleAvailability: (item: MenuItem, isAvailable: boolean) => Promise<void>;
}

export function MenuItemCard({
    item,
    onEdit,
    onDelete,
    onDuplicate,
    onViewDetails,
    onToggleAvailability,
}: MenuItemCardProps) {
    const handleToggleAvailability = async (checked: boolean) => {
        await onToggleAvailability(item, checked);
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div
                className="relative aspect-4/3 bg-muted cursor-pointer"
                onClick={() => onViewDetails(item)}
            >
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.itemName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
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
                    {item.isVegetarian && (
                        <Badge variant="outline" className="text-xs bg-green-50">
                            🌱 Vegan
                        </Badge>
                    )}
                    {item.spicyLevel && item.spicyLevel > 0 && (
                        <Badge variant="outline" className="text-xs bg-red-50">
                            {getSpicyLevelEmoji(item.spicyLevel)}
                        </Badge>
                    )}
                </div>
                {!item.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">Inactive</Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-4" onClick={() => onViewDetails(item)}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base line-clamp-1 mb-0.5">
                            {item.itemName}
                        </h3>
                        <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                    </div>
                    <Badge variant={item.isAvailable ? 'default' : 'destructive'} className="ml-2 shrink-0">
                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                    </Badge>
                </div>
                <p className="text-lg font-bold text-primary">{formatPrice(item.price)}</p>
                {item.preparationTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                        ⏱️ {item.preparationTime} min
                    </p>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={item.isAvailable}
                        onCheckedChange={handleToggleAvailability}
                        disabled={!item.isActive}
                    />
                    <span className="text-xs text-muted-foreground">Available</span>
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
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(item)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(item)}
                            className="text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}
