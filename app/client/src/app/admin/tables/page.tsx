'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Table, TableStatus } from '@/types';
import { useTableStore } from '@/modules/tables/stores';
import { useTables, useTableStats, useTableMutations } from '@/modules/tables/hooks';
import { Button } from '@/components/ui/button';
import { TableHeader, TableStats, TableFilters, TablePagination, QuickViewPanel } from '@/modules/tables/components';
import { TableListView } from '@/modules/tables/views';
import { TableDialogs } from '@/modules/tables/dialogs/TableDialogs';
import {
    BulkStatusChangeDialog,
    BulkDeleteDialog,
    BulkExportDialog,
    BulkActivateDeactivateDialog,
    TableHistoryDialog,
    KeyboardShortcutsDialog,
} from '@/modules/tables/dialogs';

type SortField = 'tableNumber' | 'capacity' | 'floor' | 'status';
type SortOrder = 'asc' | 'desc';

export default function TablesPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Store state
    const {
        selectedTableIds,
        setSelectedTableIds,
        clearSelection,
        quickViewTableId,
        setQuickViewTableId,
        filters: storeFilters,
        setFilters,
    } = useTableStore();

    // Dialog states from store
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkExportDialog, setShowBulkExportDialog] = useState(false);
    const [showBulkActivateDialog, setShowBulkActivateDialog] = useState(false);
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Get all filter values from URL
    const filters = useMemo(() => ({
        search: searchParams.get('search') || '',
        status: searchParams.get('status') as TableStatus | undefined,
        floor: searchParams.get('floor') ? parseInt(searchParams.get('floor')!) : undefined,
        section: searchParams.get('section') || undefined,
    }), [searchParams]);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = parseInt(searchParams.get('limit') || '20', 10);
    const sortField = (searchParams.get('sortBy') || 'tableNumber') as SortField;
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as SortOrder;

    // Debounce search with 300ms delay
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [localSearchTerm, setLocalSearchTerm] = useState(filters.search);

    useEffect(() => {
        setLocalSearchTerm(filters.search);
    }, [filters.search]);

    // Fetch data using hooks
    const { data: tablesData, isLoading, refetch: refetchTables } = useTables({
        filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortField,
        sortOrder: sortOrder,
    });
    const { data: stats, refetch: refetchStats } = useTableStats();
    const { deleteTable, bulkUpdateStatus } = useTableMutations();

    const tables = tablesData?.items || [];
    const totalPages = tablesData?.pagination?.totalPages || 1;
    const totalItems = tablesData?.pagination?.total || 0;

    // Update URL with filters
    const updateURL = useCallback((params: Record<string, string>) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') {
                newSearchParams.set(key, value);
            } else {
                newSearchParams.delete(key);
            }
        });

        router.push(`/tables?${newSearchParams.toString()}`, { scroll: false });
    }, [router, searchParams]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Shift+N: Create new table
            if (e.shiftKey && e.key === 'N') {
                e.preventDefault();
                handleCreateTable();
            }
            // /: Focus search
            if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                searchInput?.focus();
            }
            // ?: Show keyboard shortcuts
            if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault();
                setShowKeyboardShortcuts(true);
            }
            // Escape: Close dialogs and clear selection
            if (e.key === 'Escape') {
                handleCloseDialogs();
                setSelectedTableIds([]);
                setShowKeyboardShortcuts(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handlers
    const handleSearch = useCallback((term: string) => {
        setLocalSearchTerm(term);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounced search (300ms)
        searchTimeoutRef.current = setTimeout(() => {
            updateURL({ search: term, page: '1' });
        }, 300);
    }, [updateURL]);

    const handleStatusFilter = useCallback((status: string) => {
        updateURL({ status, page: '1' });
    }, [updateURL]);

    const handleFloorFilter = useCallback((floor: string) => {
        updateURL({ floor, page: '1' });
    }, [updateURL]);

    const handleSectionFilter = useCallback((section: string) => {
        updateURL({ section, page: '1' });
    }, [updateURL]);

    const handleActiveFilter = useCallback((active: string) => {
        updateURL({ active, page: '1' });
    }, [updateURL]);

    const handleSort = useCallback((field: SortField) => {
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        updateURL({ sortBy: field, sortOrder: newOrder });
    }, [sortField, sortOrder, updateURL]);

    const handlePageChange = useCallback((page: number) => {
        updateURL({ page: page.toString() });
    }, [updateURL]);

    const handleItemsPerPageChange = useCallback((limit: number) => {
        updateURL({ limit: limit.toString(), page: '1' });
    }, [updateURL]);

    const handleCreateTable = useCallback(() => {
        setShowCreateDialog(true);
    }, []);

    const handleEditTable = useCallback((table: Table) => {
        setSelectedTable(table);
        setShowEditDialog(true);
    }, []);

    const handleChangeStatus = useCallback((table: Table) => {
        setSelectedTable(table);
        setShowStatusDialog(true);
    }, []);

    const handleDeleteTable = useCallback((table: Table) => {
        setSelectedTable(table);
        setShowDeleteDialog(true);
    }, []);

    const handleAssignOrder = useCallback((table: Table) => {
        // Navigate to orders page with table pre-selected
        router.push(`/admin/orders/create?tableId=${table.tableId}`);
    }, [router]);

    const handleSelectionChange = useCallback((ids: number[]) => {
        setSelectedTableIds(ids);
    }, []);

    const handleBulkStatusChange = useCallback((status: TableStatus) => {
        if (selectedTableIds.length === 0) {
            toast.error(t('tables.noTablesSelected', 'Please select at least one table'));
            return;
        }

        bulkUpdateStatus.mutate(
            { tableIds: selectedTableIds, status },
            {
                onSuccess: () => {
                    clearSelection();
                    refetchTables();
                    refetchStats();
                },
            }
        );
    }, [selectedTableIds, t, bulkUpdateStatus, clearSelection, refetchTables, refetchStats]);

    const handleBulkDelete = useCallback(async () => {
        if (selectedTableIds.length === 0) {
            toast.error(t('tables.noTablesSelected', 'Please select at least one table'));
            return;
        }

        try {
            // Delete tables one by one
            await Promise.all(
                selectedTableIds.map(tableId => deleteTable.mutateAsync(tableId))
            );
            clearSelection();
            refetchTables();
            refetchStats();
        } catch (error: any) {
            console.error('Failed to bulk delete tables:', error);
            throw error;
        }
    }, [selectedTableIds, t, deleteTable, clearSelection, refetchTables, refetchStats]);

    const handleBulkActivateDeactivate = useCallback(async (isActive: boolean) => {
        if (selectedTableIds.length === 0) {
            toast.error(t('tables.noTablesSelected', 'Please select at least one table'));
            return;
        }

        try {
            // This would need a backend endpoint for bulk activate/deactivate
            // For now, we'll toast a message
            toast.info('Bulk activate/deactivate not implemented yet');
            clearSelection();
            refetchTables();
            refetchStats();
        } catch (error: any) {
            console.error('Failed to bulk activate/deactivate tables:', error);
            throw error;
        }
    }, [selectedTableIds, t, clearSelection, refetchTables, refetchStats]);

    const handleCloseDialogs = useCallback(() => {
        setShowCreateDialog(false);
        setShowEditDialog(false);
        setShowStatusDialog(false);
        setShowDeleteDialog(false);
        setSelectedTable(null);
    }, []);

    const handleRefresh = useCallback(() => {
        refetchTables();
        refetchStats();
    }, [refetchTables, refetchStats]);

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
            <TableHeader
                tables={tables}
                onCreateTable={handleCreateTable}
                onRefresh={handleRefresh}
            />

            <TableStats
                stats={
                    stats ?? {
                        total: 0,
                        available: 0,
                        occupied: 0,
                        reserved: 0,
                        maintenance: 0,
                    }
                }
            />

            <TableFilters
                searchTerm={localSearchTerm}
                statusFilter={filters.status || 'all'}
                floorFilter={filters.floor?.toString() || 'all'}
                sectionFilter={filters.section || 'all'}
                activeFilter={'all'}
                onSearchChange={handleSearch}
                onStatusFilterChange={handleStatusFilter}
                onFloorFilterChange={handleFloorFilter}
                onSectionFilterChange={handleSectionFilter}
                onActiveFilterChange={handleActiveFilter}
            />
            <div className="animate-in fade-in duration-500">
                {selectedTableIds.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-100 border border-blue-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
                        <span className="text-sm font-medium text-blue-900">
                            {t('tables.selectedCount', '{{count}} tables selected', { count: selectedTableIds.length })}
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowBulkStatusDialog(true)}
                            >
                                        {t('tables.changeBulkStatus', 'Change Status')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowBulkActivateDialog(true)}
                                    >
                                        {t('tables.toggleActive', 'Toggle Active')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowBulkExportDialog(true)}
                                    >
                                        {t('tables.bulkExport', 'Export Selected')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setShowBulkDeleteDialog(true)}
                                    >
                                        {t('tables.bulkDelete', 'Delete Selected')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedTableIds([])}
                                    >
                                        {t('common.clear', 'Clear')}
                                    </Button>
                                </div>
                            </div>
                        )}
                        <TableListView
                            tables={tables}
                            loading={isLoading}
                            sortField={sortField}
                            sortOrder={sortOrder}
                            selectedTableIds={selectedTableIds}
                            onSort={handleSort}
                            onEdit={handleEditTable}
                            onChangeStatus={handleChangeStatus}
                            onDelete={handleDeleteTable}
                            onAssignOrder={handleAssignOrder}
                            onSelectionChange={handleSelectionChange}
                            onRowClick={setSelectedTable}
                        />
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            </div>

            <TableDialogs
                showCreateDialog={showCreateDialog}
                showEditDialog={showEditDialog}
                showStatusDialog={showStatusDialog}
                showDeleteDialog={showDeleteDialog}
                selectedTable={selectedTable}
                onClose={handleCloseDialogs}
                onSuccess={handleRefresh}
            />

            <BulkStatusChangeDialog
                open={showBulkStatusDialog}
                count={selectedTableIds.length}
                onClose={() => setShowBulkStatusDialog(false)}
                onConfirm={handleBulkStatusChange}
            />

            <BulkDeleteDialog
                open={showBulkDeleteDialog}
                count={selectedTableIds.length}
                onClose={() => setShowBulkDeleteDialog(false)}
                onConfirm={handleBulkDelete}
            />

            <BulkExportDialog
                open={showBulkExportDialog}
                tables={tables.filter(t => selectedTableIds.includes(t.tableId))}
                count={selectedTableIds.length}
                onClose={() => setShowBulkExportDialog(false)}
            />

            <BulkActivateDeactivateDialog
                open={showBulkActivateDialog}
                count={selectedTableIds.length}
                onClose={() => setShowBulkActivateDialog(false)}
                onConfirm={handleBulkActivateDeactivate}
            />

            <KeyboardShortcutsDialog
                open={showKeyboardShortcuts}
                onClose={() => setShowKeyboardShortcuts(false)}
            />

            {selectedTable && (
                <QuickViewPanel
                    table={selectedTable}
                    onClose={() => setSelectedTable(null)}
                    onEdit={handleEditTable}
                    onChangeStatus={handleChangeStatus}
                    onViewHistory={() => setShowHistoryDialog(true)}
                />
            )}

            <TableHistoryDialog
                open={showHistoryDialog}
                table={selectedTable}
                onClose={() => setShowHistoryDialog(false)}
            />
        </div>
    );
}
