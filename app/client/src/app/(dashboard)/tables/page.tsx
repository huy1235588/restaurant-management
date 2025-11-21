'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { tableApi } from '@/modules/tables/services/table.service';
import { Table, TableStatus } from '@/types';
import { useTableStore } from '@/modules/tables/stores/tableStore';
import { Button } from '@/components/ui/button';
import { TableHeader, TableStats, TableFilters, TablePagination, QuickViewPanel } from '@/modules/tables/components';
import { TableListView } from '@/modules/tables/views';
import { TableDialogs } from '@/modules/tables/TableDialogs';
import {
    BulkStatusChangeDialog,
    BulkDeleteDialog,
    BulkExportDialog,
    BulkActivateDeactivateDialog,
    BulkQRCodeGenerator,
    TableHistoryDialog,
    KeyboardShortcutsDialog,
} from '@/modules/tables/dialogs';
import { useTableSocket } from '@/hooks/useTableSocket';

type SortField = 'tableNumber' | 'capacity' | 'floor' | 'status';
type SortOrder = 'asc' | 'desc';

export default function TablesPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { tables, setTables, setLoading: setStoreLoading, error } = useTableStore();
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        occupied: 0,
        reserved: 0,
        maintenance: 0,
    });

    // Selection state
    const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkExportDialog, setShowBulkExportDialog] = useState(false);
    const [showBulkActivateDialog, setShowBulkActivateDialog] = useState(false);
    const [showBulkQRCodeDialog, setShowBulkQRCodeDialog] = useState(false);
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showQRDialog, setShowQRDialog] = useState(false);

    // Initialize WebSocket connection
    useTableSocket();

    // Get all filter values from URL
    const filters = useMemo(() => ({
        searchTerm: searchParams.get('search') || '',
        statusFilter: searchParams.get('status') || 'all',
        floorFilter: searchParams.get('floor') || 'all',
        sectionFilter: searchParams.get('section') || 'all',
        activeFilter: searchParams.get('active') || 'all',
        currentPage: parseInt(searchParams.get('page') || '1', 10),
        itemsPerPage: parseInt(searchParams.get('limit') || '20', 10),
        sortField: (searchParams.get('sortBy') || 'tableNumber') as SortField,
        sortOrder: (searchParams.get('sortOrder') || 'asc') as SortOrder,
    }), [searchParams]);

    // Debounce search with 300ms delay
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);

    useEffect(() => {
        setLocalSearchTerm(filters.searchTerm);
    }, [filters.searchTerm]);

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

    // Fetch tables
    const fetchTables = useCallback(async () => {
        try {
            setLoading(true);
            setStoreLoading(true);

            const response = await tableApi.getAll({
                page: filters.currentPage,
                limit: filters.itemsPerPage,
                sortBy: filters.sortField,
                sortOrder: filters.sortOrder,
                search: filters.searchTerm || undefined,
                status: filters.statusFilter !== 'all' ? filters.statusFilter as TableStatus : undefined,
                floor: filters.floorFilter !== 'all' ? parseInt(filters.floorFilter) : undefined,
                section: filters.sectionFilter !== 'all' ? filters.sectionFilter : undefined,
                isActive: filters.activeFilter !== 'all' ? filters.activeFilter === 'true' : undefined,
            });

            setTables(response.items);
            setTotalPages(response.pagination.totalPages);
            setTotalItems(response.pagination.total);
        } catch (error) {
            console.error('Failed to fetch tables:', error);
            toast.error(t('tables.fetchError'));
        } finally {
            setLoading(false);
            setStoreLoading(false);
        }
    }, [filters, setTables, setStoreLoading, t]);

    // Fetch statistics
    const fetchStats = useCallback(async () => {
        try {
            const statsData = await tableApi.getStats();
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch table statistics:', error);
        }
    }, []);

    // Load data on mount and when filters change
    useEffect(() => {
        fetchTables();
        fetchStats();
    }, [fetchTables, fetchStats]);

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
        const newOrder = filters.sortField === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
        updateURL({ sortBy: field, sortOrder: newOrder });
    }, [filters, updateURL]);

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

    const handleViewQR = useCallback((table: Table) => {
        setSelectedTable(table);
        setShowQRDialog(true);
    }, []);

    const handleAssignOrder = useCallback((table: Table) => {
        // Navigate to orders page with table pre-selected
        router.push(`/orders/create?tableId=${table.tableId}`);
    }, [router]);

    const handleSelectionChange = useCallback((ids: number[]) => {
        setSelectedTableIds(ids);
    }, []);

    const handleBulkStatusChange = useCallback((status: TableStatus) => {
        if (selectedTableIds.length === 0) {
            toast.error(t('tables.noTablesSelected', 'Please select at least one table'));
            return;
        }

        const bulkUpdateData = selectedTableIds.map(tableId => ({
            tableId,
            data: { status }
        }));

        tableApi.bulkUpdate(bulkUpdateData).then(() => {
            toast.success(t('tables.bulkStatusUpdateSuccess', '{{count}} tables updated successfully', {
                count: selectedTableIds.length
            }));
            setSelectedTableIds([]);
            fetchTables();
            fetchStats();
        }).catch((error: any) => {
            console.error('Failed to bulk update status:', error);
            toast.error(error.response?.data?.message || t('tables.bulkStatusUpdateError', 'Failed to update tables'));
        });
    }, [selectedTableIds, t, fetchTables, fetchStats]);

    const handleBulkDelete = useCallback(async () => {
        if (selectedTableIds.length === 0) {
            toast.error(t('tables.noTablesSelected', 'Please select at least one table'));
            return;
        }

        try {
            // Delete tables one by one or use bulk delete endpoint if available
            await Promise.all(
                selectedTableIds.map(tableId => tableApi.delete(tableId))
            );
            setSelectedTableIds([]);
            fetchTables();
            fetchStats();
        } catch (error: any) {
            console.error('Failed to bulk delete tables:', error);
            throw error;
        }
    }, [selectedTableIds, t, fetchTables, fetchStats]);

    const handleBulkActivateDeactivate = useCallback(async (isActive: boolean) => {
        if (selectedTableIds.length === 0) {
            toast.error(t('tables.noTablesSelected', 'Please select at least one table'));
            return;
        }

        try {
            const bulkUpdateData = selectedTableIds.map(tableId => ({
                tableId,
                data: { isActive }
            }));

            await tableApi.bulkUpdate(bulkUpdateData);
            setSelectedTableIds([]);
            fetchTables();
            fetchStats();
        } catch (error: any) {
            console.error('Failed to bulk activate/deactivate tables:', error);
            throw error;
        }
    }, [selectedTableIds, t, fetchTables, fetchStats]);

    const handleCloseDialogs = useCallback(() => {
        setShowCreateDialog(false);
        setShowEditDialog(false);
        setShowStatusDialog(false);
        setShowDeleteDialog(false);
        setShowQRDialog(false);
        setSelectedTable(null);
    }, []);

    const handleRefresh = useCallback(() => {
        fetchTables();
        fetchStats();
    }, [fetchTables, fetchStats]);

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
            <TableHeader
                tables={tables}
                onCreateTable={handleCreateTable}
                onRefresh={handleRefresh}
            />

            <TableStats stats={stats} />

            <TableFilters
                searchTerm={filters.searchTerm}
                statusFilter={filters.statusFilter}
                floorFilter={filters.floorFilter}
                sectionFilter={filters.sectionFilter}
                activeFilter={filters.activeFilter}
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
                                        variant="outline"
                                        onClick={() => setShowBulkQRCodeDialog(true)}
                                    >
                                        {t('tables.bulkQRCode', 'Generate QR Codes')}
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
                            loading={loading}
                            sortField={filters.sortField}
                            sortOrder={filters.sortOrder}
                            selectedTableIds={selectedTableIds}
                            onSort={handleSort}
                            onEdit={handleEditTable}
                            onChangeStatus={handleChangeStatus}
                            onDelete={handleDeleteTable}
                            onViewQR={handleViewQR}
                            onAssignOrder={handleAssignOrder}
                            onSelectionChange={handleSelectionChange}
                            onRowClick={setSelectedTable}
                        />
                <TablePagination
                    currentPage={filters.currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={filters.itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            </div>

            <TableDialogs
                showCreateDialog={showCreateDialog}
                showEditDialog={showEditDialog}
                showStatusDialog={showStatusDialog}
                showDeleteDialog={showDeleteDialog}
                showQRDialog={showQRDialog}
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

            <BulkQRCodeGenerator
                open={showBulkQRCodeDialog}
                tables={tables.filter(t => selectedTableIds.includes(t.tableId))}
                onClose={() => setShowBulkQRCodeDialog(false)}
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
