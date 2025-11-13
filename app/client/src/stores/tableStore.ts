import { create } from 'zustand';
import { Table, TableStatus } from '@/types';

interface TableFilters {
    status?: TableStatus | 'all';
    floor?: number | 'all';
    section?: string | 'all';
    search?: string;
}

interface PendingUpdate {
    tableId: number;
    previousState: Partial<Table>;
    timestamp: number;
}

interface TableState {
    tables: Table[];
    selectedTable: Table | null;
    filters: TableFilters;
    isLoading: boolean;
    error: string | null;
    pendingUpdates: Map<number, PendingUpdate>;

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
    
    // Optimistic updates
    optimisticUpdate: (tableId: number, updates: Partial<Table>) => void;
    confirmUpdate: (tableId: number) => void;
    rollbackUpdate: (tableId: number) => void;
}

export const useTableStore = create<TableState>((set, get) => ({
    tables: [],
    selectedTable: null,
    filters: {},
    isLoading: false,
    error: null,
    pendingUpdates: new Map(),

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

    // Optimistic update: apply changes immediately and store previous state
    optimisticUpdate: (tableId, updates) =>
        set((state) => {
            const table = state.tables.find((t) => t.tableId === tableId);
            if (!table) return state;

            const previousState: Partial<Table> = {};
            Object.keys(updates).forEach((key) => {
                previousState[key as keyof Table] = table[key as keyof Table] as any;
            });

            const newPendingUpdates = new Map(state.pendingUpdates);
            newPendingUpdates.set(tableId, {
                tableId,
                previousState,
                timestamp: Date.now(),
            });

            return {
                tables: state.tables.map((t) =>
                    t.tableId === tableId ? { ...t, ...updates } : t
                ),
                pendingUpdates: newPendingUpdates,
            };
        }),

    // Confirm update: remove from pending updates
    confirmUpdate: (tableId) =>
        set((state) => {
            const newPendingUpdates = new Map(state.pendingUpdates);
            newPendingUpdates.delete(tableId);
            return { pendingUpdates: newPendingUpdates };
        }),

    // Rollback update: restore previous state
    rollbackUpdate: (tableId) =>
        set((state) => {
            const pending = state.pendingUpdates.get(tableId);
            if (!pending) return state;

            const newPendingUpdates = new Map(state.pendingUpdates);
            newPendingUpdates.delete(tableId);

            return {
                tables: state.tables.map((t) =>
                    t.tableId === tableId ? { ...t, ...pending.previousState } : t
                ),
                pendingUpdates: newPendingUpdates,
            };
        }),
}));
