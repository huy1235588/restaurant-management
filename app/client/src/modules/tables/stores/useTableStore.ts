import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Table, TableFilters, TableStatus } from '@/types';

interface TableState {
    // Selected tables for bulk operations
    selectedTableIds: number[];
    
    // Current filters
    filters: TableFilters;
    
    // Quick view panel state
    quickViewTableId: number | null;
    
    // Dialog states
    isCreateDialogOpen: boolean;
    isEditDialogOpen: boolean;
    isDeleteDialogOpen: boolean;
    isStatusChangeDialogOpen: boolean;
    isBulkStatusChangeDialogOpen: boolean;
    
    // Current editing table
    editingTable: Table | null;
    
    // Actions
    setSelectedTableIds: (ids: number[]) => void;
    toggleTableSelection: (id: number) => void;
    clearSelection: () => void;
    selectAll: (tables: Table[]) => void;
    
    setFilters: (filters: TableFilters) => void;
    resetFilters: () => void;
    
    setQuickViewTableId: (id: number | null) => void;
    
    openCreateDialog: () => void;
    closeCreateDialog: () => void;
    
    openEditDialog: (table: Table) => void;
    closeEditDialog: () => void;
    
    openDeleteDialog: (table: Table) => void;
    closeDeleteDialog: () => void;
    
    openStatusChangeDialog: (table: Table) => void;
    closeStatusChangeDialog: () => void;
    
    openBulkStatusChangeDialog: () => void;
    closeBulkStatusChangeDialog: () => void;
}

export const useTableStore = create<TableState>()(
    devtools(
        (set, get) => ({
            // Initial state
            selectedTableIds: [],
            filters: {},
            quickViewTableId: null,
            isCreateDialogOpen: false,
            isEditDialogOpen: false,
            isDeleteDialogOpen: false,
            isStatusChangeDialogOpen: false,
            isBulkStatusChangeDialogOpen: false,
            editingTable: null,

            // Selection actions
            setSelectedTableIds: (ids) => set({ selectedTableIds: ids }),
            
            toggleTableSelection: (id) =>
                set((state) => ({
                    selectedTableIds: state.selectedTableIds.includes(id)
                        ? state.selectedTableIds.filter((selectedId) => selectedId !== id)
                        : [...state.selectedTableIds, id],
                })),
            
            clearSelection: () => set({ selectedTableIds: [] }),
            
            selectAll: (tables) =>
                set({ selectedTableIds: tables.map((table) => table.tableId) }),

            // Filter actions
            setFilters: (filters) => set({ filters }),
            
            resetFilters: () => set({ filters: {} }),

            // Quick view actions
            setQuickViewTableId: (id) => set({ quickViewTableId: id }),

            // Dialog actions
            openCreateDialog: () => set({ isCreateDialogOpen: true }),
            closeCreateDialog: () => set({ isCreateDialogOpen: false }),
            
            openEditDialog: (table) =>
                set({ isEditDialogOpen: true, editingTable: table }),
            closeEditDialog: () =>
                set({ isEditDialogOpen: false, editingTable: null }),
            
            openDeleteDialog: (table) =>
                set({ isDeleteDialogOpen: true, editingTable: table }),
            closeDeleteDialog: () =>
                set({ isDeleteDialogOpen: false, editingTable: null }),
            
            openStatusChangeDialog: (table) =>
                set({ isStatusChangeDialogOpen: true, editingTable: table }),
            closeStatusChangeDialog: () =>
                set({ isStatusChangeDialogOpen: false, editingTable: null }),
            
            openBulkStatusChangeDialog: () =>
                set({ isBulkStatusChangeDialogOpen: true }),
            closeBulkStatusChangeDialog: () =>
                set({ isBulkStatusChangeDialogOpen: false }),
        }),
        { name: 'table-store' }
    )
);
