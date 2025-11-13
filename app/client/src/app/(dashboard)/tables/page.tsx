'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { tableApi } from '@/services/table.service';
import { Table, TableStatus } from '@/types';
import { TablesHeader } from '@/components/feautures/tables/TablesHeader';
import { TablesFilters, TablesViewMode, TableSortField, TableSortOrder } from '@/components/feautures/tables/TablesFilters';
import { TablesDataTable } from '@/components/feautures/tables/TablesDataTable';
import { TableCard } from '@/components/feautures/tables/TableCard';
import { TablesPagination } from '@/components/feautures/tables/TablesPagination';
import { TableForm } from '@/components/feautures/tables/TableForm';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function TablesPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // View mode state (not synced with URL)
    const [viewMode, setViewMode] = useState<TablesViewMode>('list');

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    // Get all filter values from URL
    const filters = useMemo(() => ({
        searchTerm: searchParams.get('search') || '',
        status: (searchParams.get('status') || 'all') as TableStatus | 'all',
        floor: searchParams.get('floor') || 'all',
        section: searchParams.get('section') || '',
        isActive: searchParams.get('active') || 'all',
        currentPage: parseInt(searchParams.get('page') || '1', 10),
        itemsPerPage: parseInt(searchParams.get('limit') || '12', 10),
        sortField: (searchParams.get('sortBy') || 'tableNumber') as TableSortField,
        sortOrder: (searchParams.get('sortOrder') || 'asc') as TableSortOrder,
    }), [searchParams]);

    // Extract unique floors from tables
    const floors = useMemo(() => {
        const uniqueFloors = tables
            .map(table => table.floor)
            .filter((floor): floor is number => floor !== undefined && floor !== null);
        return [...new Set(uniqueFloors)].sort((a, b) => a - b);
    }, [tables]);

    // Update URL with new filter values
    const updateFilters = useCallback((updates: Partial<typeof filters>) => {
        const params = new URLSearchParams(searchParams.toString());
        const newFilters = { ...filters, ...updates };

        if (newFilters.searchTerm) {
            params.set('search', newFilters.searchTerm);
        } else {
            params.delete('search');
        }

        if (newFilters.status !== 'all') {
            params.set('status', newFilters.status);
        } else {
            params.delete('status');
        }

        if (newFilters.floor !== 'all') {
            params.set('floor', newFilters.floor);
        } else {
            params.delete('floor');
        }

        if (newFilters.section) {
            params.set('section', newFilters.section);
        } else {
            params.delete('section');
        }

        if (newFilters.isActive !== 'all') {
            params.set('active', newFilters.isActive);
        } else {
            params.delete('active');
        }

        if (newFilters.currentPage > 1) {
            params.set('page', newFilters.currentPage.toString());
        } else {
            params.delete('page');
        }

        if (newFilters.itemsPerPage !== 12) {
            params.set('limit', newFilters.itemsPerPage.toString());
        } else {
            params.delete('limit');
        }

        if (newFilters.sortField !== 'tableNumber') {
            params.set('sortBy', newFilters.sortField);
        } else {
            params.delete('sortBy');
        }

        if (newFilters.sortOrder !== 'asc') {
            params.set('sortOrder', newFilters.sortOrder);
        } else {
            params.delete('sortOrder');
        }

        const query = params.toString();
        const href = query ? `/tables?${query}` : '/tables';
        router.push(href);
    }, [filters, searchParams, router]);

    // Load tables when filters change
    useEffect(() => {
        loadTables();
    }, [
        filters.searchTerm,
        filters.status,
        filters.floor,
        filters.section,
        filters.isActive,
        filters.currentPage,
        filters.itemsPerPage,
        filters.sortField,
        filters.sortOrder
    ]);

    const loadTables = async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number | boolean> = {
                page: filters.currentPage,
                limit: filters.itemsPerPage,
                sortBy: filters.sortField,
                sortOrder: filters.sortOrder,
            };

            if (filters.searchTerm) params.search = filters.searchTerm;
            if (filters.status !== 'all') params.status = filters.status;
            if (filters.floor !== 'all') params.floor = parseInt(filters.floor);
            if (filters.section) params.section = filters.section;
            if (filters.isActive !== 'all') params.isActive = filters.isActive === 'active';

            const response = await tableApi.getAll(params);
            setTables(response.items);
            setTotalPages(response.pagination.totalPages);
            setTotalItems(response.pagination.total);
        } catch (error) {
            console.error('Failed to load tables:', error);
            toast.error(t('tables.loadError', 'Failed to load tables'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedTable(null);
        setShowCreateDialog(true);
    };

    const handleEdit = (table: Table) => {
        setSelectedTable(table);
        setShowEditDialog(true);
    };

    const handleDelete = (table: Table) => {
        setSelectedTable(table);
        setShowDeleteDialog(true);
    };

    const handleCreateSubmit = async (data: Partial<Table>) => {
        try {
            await tableApi.create(data);
            toast.success(t('tables.createSuccess', 'Table created successfully'));
            setShowCreateDialog(false);
            loadTables();
        } catch (error) {
            console.error('Failed to create table:', error);
            toast.error(t('tables.createError', 'Failed to create table'));
        }
    };

    const handleEditSubmit = async (data: Partial<Table>) => {
        if (!selectedTable) return;

        try {
            await tableApi.update(selectedTable.tableId, data);
            toast.success(t('tables.updateSuccess', 'Table updated successfully'));
            setShowEditDialog(false);
            setSelectedTable(null);
            loadTables();
        } catch (error) {
            console.error('Failed to update table:', error);
            toast.error(t('tables.updateError', 'Failed to update table'));
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedTable) return;

        try {
            await tableApi.delete(selectedTable.tableId);
            toast.success(t('tables.deleteSuccess', 'Table deleted successfully'));
            setShowDeleteDialog(false);
            setSelectedTable(null);
            loadTables();
        } catch (error) {
            console.error('Failed to delete table:', error);
            toast.error(t('tables.deleteError', 'Failed to delete table'));
        }
    };

    const handleStatusChange = async (tableId: number, status: TableStatus) => {
        try {
            await tableApi.updateStatus(tableId, status);
            toast.success(t('tables.statusUpdateSuccess', 'Table status updated'));
            loadTables();
        } catch (error) {
            console.error('Failed to update table status:', error);
            toast.error(t('tables.statusUpdateError', 'Failed to update status'));
        }
    };

    const handleResetFilters = () => {
        router.push('/tables');
    };

    return (
        <div className="container mx-auto space-y-6 py-8">
            {/* Header */}
            <TablesHeader onCreate={handleCreate} />

            {/* Filters */}
            <TablesFilters
                searchValue={filters.searchTerm}
                statusValue={filters.status}
                floorValue={filters.floor}
                sectionValue={filters.section}
                activeValue={filters.isActive as 'all' | 'active' | 'inactive'}
                viewMode={viewMode}
                sortField={filters.sortField}
                sortOrder={filters.sortOrder}
                floors={floors}
                onSearchChange={(value) => updateFilters({ searchTerm: value, currentPage: 1 })}
                onStatusChange={(value) => updateFilters({ status: value, currentPage: 1 })}
                onFloorChange={(value) => updateFilters({ floor: value, currentPage: 1 })}
                onSectionChange={(value) => updateFilters({ section: value, currentPage: 1 })}
                onActiveChange={(value) => updateFilters({ isActive: value, currentPage: 1 })}
                onViewModeChange={setViewMode}
                onSortChange={(field) => updateFilters({ sortField: field })}
                onSortOrderToggle={() => updateFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                onResetFilters={handleResetFilters}
            />

            {/* Content */}
            {loading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>{t('tables.loading', 'Loading tables...')}</p>
                        </div>
                    </CardContent>
                </Card>
            ) : tables.length === 0 ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-16">
                        <div className="text-center text-muted-foreground">
                            <p className="text-lg font-medium">
                                {t('tables.noResults', 'No tables found')}
                            </p>
                            <p className="mt-2 text-sm">
                                {t('tables.noResultsDescription', 'Try adjusting your filters or create a new table')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : viewMode === 'list' ? (
                <TablesDataTable
                    tables={tables}
                    loading={loading}
                    totalItems={totalItems}
                    viewMode={viewMode}
                    sortField={filters.sortField}
                    sortOrder={filters.sortOrder}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onChangeStatus={(table) => handleStatusChange(table.tableId, table.status)}
                    onViewQr={(table) => console.log('View QR', table)}
                    onAssignOrder={(table) => console.log('Assign Order', table)}
                    onSort={(field) => updateFilters({ sortField: field })}
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {tables.map((table) => (
                        <TableCard
                            key={table.tableId}
                            table={table}
                            onClick={handleEdit}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && tables.length > 0 && (
                <TablesPagination
                    currentPage={filters.currentPage}
                    totalPages={totalPages}
                    itemsPerPage={filters.itemsPerPage}
                    totalItems={totalItems}
                    onPageChange={(page) => updateFilters({ currentPage: page })}
                    onItemsPerPageChange={(limit) => updateFilters({ itemsPerPage: limit, currentPage: 1 })}
                />
            )}

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('tables.dialogs.create.title', 'Create New Table')}</DialogTitle>
                        <DialogDescription>
                            {t('tables.dialogs.create.description', 'Add a new table to your restaurant floor plan')}
                        </DialogDescription>
                    </DialogHeader>
                    <TableForm
                        onSubmit={handleCreateSubmit}
                        onCancel={() => setShowCreateDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('tables.dialogs.edit.title', 'Edit Table')}</DialogTitle>
                        <DialogDescription>
                            {t('tables.dialogs.edit.description', 'Update table information and settings')}
                        </DialogDescription>
                    </DialogHeader>
                    <TableForm
                        defaultValues={selectedTable || undefined}
                        onSubmit={handleEditSubmit}
                        onCancel={() => {
                            setShowEditDialog(false);
                            setSelectedTable(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('tables.dialogs.delete.title', 'Delete Table')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('tables.dialogs.delete.description', 
                                'Are you sure you want to delete table "{{tableNumber}}"? This action cannot be undone.',
                                { tableNumber: selectedTable?.tableNumber }
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setShowDeleteDialog(false);
                            setSelectedTable(null);
                        }}>
                            {t('common.cancel', 'Cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('common.delete', 'Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
