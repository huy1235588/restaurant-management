import { useTranslation } from 'react-i18next';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { MenuItemRow } from './MenuItemRow';
import { MenuItem } from '@/types';

type SortField = 'name' | 'price' | 'category' | 'code' | 'date';
type SortOrder = 'asc' | 'desc';

interface MenuItemsTableProps {
    menuItems: MenuItem[];
    loading: boolean;
    totalItems: number;
    sortField?: SortField;
    sortOrder?: SortOrder;
    onView: (item: MenuItem) => void;
    onEdit: (item: MenuItem) => void;
    onDelete: (item: MenuItem) => void;
    onToggleAvailability: (item: MenuItem) => void;
    onSort?: (field: SortField) => void;
}

const SortHeader = ({
    label,
    field,
    currentField,
    sortOrder,
    onSort,
}: {
    label: string;
    field: SortField;
    currentField: SortField;
    sortOrder: SortOrder;
    onSort?: (field: SortField) => void;
}) => {
    const isActive = field === currentField;
    return (
        <TableHead
            className={`font-semibold cursor-pointer select-none hover:bg-muted/50 ${
                isActive ? 'bg-muted/30' : ''
            }`}
            onClick={() => onSort?.(field)}
        >
            <div className="flex items-center gap-1">
                {label}
                {isActive ? (
                    sortOrder === 'asc' ? (
                        <ArrowUp className="h-4 w-4 text-primary" />
                    ) : (
                        <ArrowDown className="h-4 w-4 text-primary" />
                    )
                ) : (
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50" />
                )}
            </div>
        </TableHead>
    );
};

export function MenuItemsTable({
    menuItems,
    loading,
    totalItems,
    sortField = 'name',
    sortOrder = 'asc',
    onView,
    onEdit,
    onDelete,
    onToggleAvailability,
    onSort,
}: MenuItemsTableProps) {
    const { t } = useTranslation();

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {t('menu.menuItems', 'Menu Items')}
                    <span className="text-sm font-normal text-muted-foreground">
                        ({totalItems})
                    </span>
                </CardTitle>
                <CardDescription>
                    {t('menu.tableDescription', 'View and manage all menu items')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : menuItems.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-muted-foreground text-lg">
                            {t('menu.noItems', 'No menu items found')}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t('menu.noItemsDescription', 'Try adjusting your filters or add a new item')}
                        </p>
                    </div>
                ) : (
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <SortHeader
                                        label={t('menu.code', 'Code')}
                                        field="code"
                                        currentField={sortField}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                    <SortHeader
                                        label={t('menu.name', 'Name')}
                                        field="name"
                                        currentField={sortField}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                    <SortHeader
                                        label={t('menu.category', 'Category')}
                                        field="category"
                                        currentField={sortField}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                    <SortHeader
                                        label={t('menu.price', 'Price')}
                                        field="price"
                                        currentField={sortField}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                    <TableHead className="font-semibold">
                                        {t('menu.availability', 'Availability')}
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        {t('menu.status', 'Status')}
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        {t('common.actions', 'Actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {menuItems.map((item) => (
                                    <MenuItemRow
                                        key={item.itemId}
                                        item={item}
                                        onView={onView}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onToggleAvailability={onToggleAvailability}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
