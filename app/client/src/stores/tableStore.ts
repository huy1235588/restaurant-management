import { create } from 'zustand';
import { Table, TableStatus } from '@/types';

interface TableFilters {
    status?: TableStatus | 'all';
    floor?: number | 'all';
    section?: string | 'all';
    search?: string;
}

interface TableState {
    tables: Table[];
    selectedTable: Table | null;
    filters: TableFilters;
    isLoading: boolean;
    error: string | null;

    // Actions
    setTables: (tables: Table[]) => void;
    addTable: (table: Table) => void;
    updateTable: (tableId: number, updates: Partial<Table>) => void;
    updateTableStatus: (tableId: number, status: TableStatus) => void;
    removeTable: (tableId: number) => void;
    setSelectedTable: (table: Table | null) => void;
    setFilters: (filters: Partial<TableFilters>) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearTables: () => void;
    bulkUpdateStatus: (tableIds: number[], status: TableStatus) => void;
}

export const useTableStore = create<TableState>((set) => ({
    tables: [],
    selectedTable: null,
    filters: {},
    isLoading: false,
    error: null,

    setTables: (tables) => set({ tables, error: null }),

    addTable: (table) =>
        set((state) => ({
            tables: [...state.tables, table],
            error: null,
        })),

    updateTable: (tableId, updates) =>
        set((state) => ({
            tables: state.tables.map((table) =>
                table.tableId === tableId ? { ...table, ...updates } : table
            ),
            selectedTable:
                state.selectedTable?.tableId === tableId
                    ? { ...state.selectedTable, ...updates }
                    : state.selectedTable,
            error: null,
        })),

    updateTableStatus: (tableId, status) =>
        set((state) => ({
            tables: state.tables.map((table) =>
                table.tableId === tableId ? { ...table, status } : table
            ),
            selectedTable:
                state.selectedTable?.tableId === tableId
                    ? { ...state.selectedTable, status }
                    : state.selectedTable,
            error: null,
        })),

    removeTable: (tableId) =>
        set((state) => ({
            tables: state.tables.filter((table) => table.tableId !== tableId),
            selectedTable:
                state.selectedTable?.tableId === tableId ? null : state.selectedTable,
            error: null,
        })),

    setSelectedTable: (table) => set({ selectedTable: table }),

    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error, isLoading: false }),

    clearTables: () =>
        set({
            tables: [],
            selectedTable: null,
            filters: {},
            isLoading: false,
            error: null,
        }),

    bulkUpdateStatus: (tableIds, status) =>
        set((state) => ({
            tables: state.tables.map((table) =>
                tableIds.includes(table.tableId) ? { ...table, status } : table
            ),
            error: null,
        })),
}));
