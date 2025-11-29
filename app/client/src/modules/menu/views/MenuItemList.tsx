'use client';

import { MenuItem } from '@/types';
import { ViewMode } from '../types';
import { MenuItemCard } from '../components/MenuItemCard';
import { MenuItemListRow } from '../components/MenuItemListRow';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, PackageX, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
import { useTranslation } from 'react-i18next';

interface MenuItemListProps {
    items: MenuItem[];
    loading: boolean;
    error: string | null;
    viewMode: ViewMode;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort?: (field: string) => void;
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
    sortBy,
    sortOrder,
    onSort,
    onEdit,
    onDelete,
    onDuplicate,
    onViewDetails,
    onToggleAvailability,
}: MenuItemListProps) {
    const { t } = useTranslation();

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
                            {[t('menu.code'), t('common.name'), t('menu.category'), t('menu.price'), t('menu.cost'), t('common.margin'), t('menu.available'), t('common.status'), t('common.actions')].map(
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
                <AlertTitle>{t('common.error')}</AlertTitle>
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
                        <h3 className="text-lg font-semibold mb-1">{t('menu.noItemsFound')}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t('menu.noItemsDescription')}
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
    const SortableHeader = ({ field, label, align = 'left' }: { field: string; label: string; align?: 'left' | 'right' }) => {
        const isSorted = sortBy === field;
        const isAsc = isSorted && sortOrder === 'asc';
        const isDesc = isSorted && sortOrder === 'desc';

        return (
            <TableHead
                className={`${align === 'right' ? 'text-right' : ''} ${onSort ? 'cursor-pointer hover:bg-muted/50 select-none' : ''}`}
                onClick={() => onSort && onSort(field)}
            >
                <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
                    <span>{label}</span>
                    {onSort && (
                        <span className="ml-1">
                            {!isSorted && <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />}
                            {isAsc && <ArrowUp className="w-3 h-3" />}
                            {isDesc && <ArrowDown className="w-3 h-3" />}
                        </span>
                    )}
                </div>
            </TableHead>
        );
    };

    return (
        <div className="border rounded-lg overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <SortableHeader field="itemCode" label={t('menu.code')} />
                        <SortableHeader field="itemName" label={t('common.name')} />
                        <SortableHeader field="categoryId" label={t('menu.category')} />
                        <SortableHeader field="price" label={t('menu.price')} align="right" />
                        <TableHead className="text-right">{t('menu.cost')}</TableHead>
                        <TableHead className="text-right">{t('common.margin')}</TableHead>
                        <TableHead>{t('menu.available')}</TableHead>
                        <SortableHeader field="isActive" label={t('common.status')} />
                        <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                                    {/* TODO */}
                                    {/* <span className="font-medium">{item.itemName}</span>
                                    {item.isVegetarian && <span className="text-xs">🌱</span>}
                                    {item.spicyLevel != undefined && item.spicyLevel > 0 && (
                                        <span className="text-xs">{getSpicyLevelEmoji(item.spicyLevel)}</span>
                                    )} */}
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
                                    {item.isActive ? t('common.active') : t('common.inactive')}
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
