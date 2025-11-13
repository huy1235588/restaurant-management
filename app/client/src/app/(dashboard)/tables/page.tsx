'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { tableApi } from '@/services/table.service';
import { Table, TableStatus } from '@/types';
import { useTableStore } from '@/stores/tableStore';
import { TableHeader } from '@/components/features/tables/TableHeader';
import { TableStats } from '@/components/features/tables/TableStats';
import { TableFilters } from '@/components/features/tables/TableFilters';
import { TableListView } from '@/components/features/tables/TableListView';
import { FloorPlanView } from '@/components/features/tables/FloorPlanView';
import { TablePagination } from '@/components/features/tables/TablePagination';
import { TableDialogs } from '@/components/features/tables/TableDialogs';
import { useTableSocket } from '@/hooks/useTableSocket';

type ViewMode = 'list' | 'floor';
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

    // View mode state
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showQRDialog, setShowQRDialog] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    // Initialize WebSocket connection
    useTableSocket();

    // Get all filter values from URL
    const filters = useMemo(() => ({
        searchTerm: searchParams.get('search') || '',
        statusFilter: searchParams.get('status') || 'all',
        floorFilter: searchParams.get('floor') || 'all',
        sectionFilter: searchParams.get('section') || 'all',
        currentPage: parseInt(searchParams.get('page') || '1', 10),
        itemsPerPage: parseInt(searchParams.get('limit') || '20', 10),
        sortField: (searchParams.get('sortBy') || 'tableNumber') as SortField,
        sortOrder: (searchParams.get('sortOrder') || 'asc') as SortOrder,
    }), [searchParams]);

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

    // Handlers
    const handleSearch = useCallback((term: string) => {
        updateURL({ search: term, page: '1' });
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

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

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
        <div className="container mx-auto p-6 space-y-6">
            <TableHeader
                onCreateTable={handleCreateTable}
                onRefresh={handleRefresh}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
            />

            <TableStats stats={stats} />

            <TableFilters
                searchTerm={filters.searchTerm}
                statusFilter={filters.statusFilter}
                floorFilter={filters.floorFilter}
                sectionFilter={filters.sectionFilter}
                onSearchChange={handleSearch}
                onStatusFilterChange={handleStatusFilter}
                onFloorFilterChange={handleFloorFilter}
                onSectionFilterChange={handleSectionFilter}
            />

            {viewMode === 'list' ? (
                <>
                    <TableListView
                        tables={tables}
                        loading={loading}
                        sortField={filters.sortField}
                        sortOrder={filters.sortOrder}
                        onSort={handleSort}
                        onEdit={handleEditTable}
                        onChangeStatus={handleChangeStatus}
                        onDelete={handleDeleteTable}
                        onViewQR={handleViewQR}
                    />
                    <TablePagination
                        currentPage={filters.currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={filters.itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                </>
            ) : (
                <FloorPlanView
                    tables={tables}
                    loading={loading}
                    floorFilter={filters.floorFilter}
                    onEdit={handleEditTable}
                    onChangeStatus={handleChangeStatus}
                    onViewQR={handleViewQR}
                />
            )}

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
        </div>
    );
}
