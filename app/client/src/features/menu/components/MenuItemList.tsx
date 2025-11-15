'use client';

import { MenuItem } from '@/types';
import { ViewMode } from '../types';
import { MenuItemCard } from './MenuItemCard';
import { MenuItemListRow } from './MenuItemListRow';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react';
import { formatPrice, formatMargin, getSpicyLevelEmoji } from '../utils';

interface MenuItemListProps {
    items: MenuItem[];
    loading: boolean;
    error: string | null;
    viewMode: ViewMode;
    onEdit: (item: MenuItem) => void;
    onDelete: (item: MenuItem) => void;
    onDuplicate: (item: MenuItem) => void;
    onViewDetails: (item: MenuItem) => void;
    onToggleAvailability: (item: MenuItem, isAvailable: boolean) => Promise<void>;
}

export function MenuItemList({
    items,
    loading,
    error,
    viewMode,
    onEdit,
    onDelete,
    onDuplicate,
    onViewDetails,
    onToggleAvailability,
}: MenuItemListProps) {
    if (loading) {
        if (viewMode === 'grid') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="aspect-4/3 w-full" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </Card>
                    ))}
                </div>
            );
        }

        if (viewMode === 'list') {
            return (
                <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                            <Skeleton className="w-16 h-16 rounded-md" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {['Code', 'Name', 'Category', 'Price', 'Cost', 'Margin', 'Available', 'Status', 'Actions'].map(
                                (header) => (
                                    <TableHead key={header}>
                                        <Skeleton className="h-4 w-20" />
                                    </TableHead>
                                )
                            )}
                        </TableRow>
                    </TableHeader>
                </Table>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (items.length === 0) {
        return (
            <Card className="p-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <PackageX className="w-16 h-16 text-muted-foreground/50" />
                    <div>
                        <h3 className="text-lg font-semibold mb-1">No menu items found</h3>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your filters or create a new menu item
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <MenuItemCard
                        key={item.itemId}
                        item={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                        onViewDetails={onViewDetails}
                        onToggleAvailability={onToggleAvailability}
                    />
                ))}
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="space-y-2">
                {items.map((item) => (
                    <MenuItemListRow
                        key={item.itemId}
                        item={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                        onToggleAvailability={onToggleAvailability}
                        onClick={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // Table view
    return (
        <div className="border rounded-lg overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Margin</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow
                            key={item.itemId}
                            className="cursor-pointer"
                            onClick={() => onViewDetails(item)}
                        >
                            <TableCell className="font-mono text-sm">{item.itemCode}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.itemName}</span>
                                    {item.isVegetarian && <span className="text-xs">🌱</span>}
                                    {item.spicyLevel != undefined && item.spicyLevel > 0 && (
                                        <span className="text-xs">{getSpicyLevelEmoji(item.spicyLevel)}</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{item.category?.categoryName || '-'}</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatPrice(item.price)}
                            </TableCell>
                            <TableCell className="text-right">
                                {item.cost ? formatPrice(item.cost) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatMargin(item.price, item.cost)}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Switch
                                    checked={item.isAvailable}
                                    onCheckedChange={(checked) => onToggleAvailability(item, checked)}
                                    disabled={!item.isActive}
                                />
                            </TableCell>
                            <TableCell>
                                <Badge variant={item.isActive ? 'default' : 'secondary'}>
                                    {item.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
