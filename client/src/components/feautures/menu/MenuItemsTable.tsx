import { useTranslation } from 'react-i18next';
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { MenuItemRow } from './MenuItemRow';
import { MenuItem } from '@/types';

interface MenuItemsTableProps {
    menuItems: MenuItem[];
    loading: boolean;
    totalItems: number;
    onView: (item: MenuItem) => void;
    onEdit: (item: MenuItem) => void;
    onDelete: (item: MenuItem) => void;
    onToggleAvailability: (item: MenuItem) => void;
}

export function MenuItemsTable({
    menuItems,
    loading,
    totalItems,
    onView,
    onEdit,
    onDelete,
    onToggleAvailability,
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
                                    <TableHead className="font-semibold">
                                        {t('menu.code', 'Code')}
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        {t('menu.name', 'Name')}
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        {t('menu.category', 'Category')}
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        {t('menu.price', 'Price')}
                                    </TableHead>
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
