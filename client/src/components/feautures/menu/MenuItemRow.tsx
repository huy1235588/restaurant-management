import { Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/types';

interface MenuItemRowProps {
    item: MenuItem;
    onView: (item: MenuItem) => void;
    onEdit: (item: MenuItem) => void;
    onDelete: (item: MenuItem) => void;
    onToggleAvailability: (item: MenuItem) => void;
}

export function MenuItemRow({
    item,
    onView,
    onEdit,
    onDelete,
    onToggleAvailability,
}: MenuItemRowProps) {
    const { t } = useTranslation();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <TableRow className="hover:bg-muted/50 transition-colors">
            <TableCell className="font-medium">
                <span className="text-sm px-2 py-1 bg-muted rounded font-mono">
                    {item.itemCode}
                </span>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border shadow-sm">
                            <img
                                src={item.imageUrl}
                                alt={item.itemName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border">
                            <span className="text-xs text-muted-foreground">No img</span>
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="font-medium truncate">{item.itemName}</div>
                        {item.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                                {item.description}
                            </div>
                        )}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="font-normal">
                    {item.category?.categoryName}
                </Badge>
            </TableCell>
            <TableCell>
                <span className="font-semibold text-primary">
                    {formatCurrency(item.price)}
                </span>
            </TableCell>
            <TableCell>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleAvailability(item)}
                    className="gap-2"
                >
                    {item.isAvailable ? (
                        <>
                            <ToggleRight className="h-4 w-4 text-green-500" />
                            <span className="text-green-600 font-medium">
                                {t('menu.available', 'Available')}
                            </span>
                        </>
                    ) : (
                        <>
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-500">
                                {t('menu.unavailable', 'Unavailable')}
                            </span>
                        </>
                    )}
                </Button>
            </TableCell>
            <TableCell>
                <Badge variant={item.isActive ? 'default' : 'secondary'}>
                    {item.isActive ? t('menu.active', 'Active') : t('menu.inactive', 'Inactive')}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(item)}
                        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
