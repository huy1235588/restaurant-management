import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TablePosition, FloorPlanLayout } from '../types';

interface LayoutState {
    // Table positions
    tables: TablePosition[];
    
    // Saved layouts
    savedLayouts: FloorPlanLayout[];
    activeLayoutId: number | null;
    
    // State management
    isLoading: boolean;
    unsavedChanges: boolean;
    error: string | null;
    
    // Actions
    setTables: (tables: TablePosition[]) => void;
    updateTablePosition: (tableId: number, position: { x: number; y: number }) => void;
    updateTableSize: (tableId: number, size: { width: number; height: number }) => void;
    updateTableRotation: (tableId: number, rotation: number) => void;
    addTable: (table: TablePosition) => void;
    removeTable: (tableId: number) => void;
    getTableById: (tableId: number) => TablePosition | undefined;
    
    // Layout management
    setSavedLayouts: (layouts: FloorPlanLayout[]) => void;
    setActiveLayout: (layoutId: number | null) => void;
    
    // State management
    setLoading: (loading: boolean) => void;
    setUnsavedChanges: (hasChanges: boolean) => void;
    setError: (error: string | null) => void;
    markAsModified: () => void;
}

export const useLayoutStore = create<LayoutState>()(
    devtools(
        (set, get) => ({
            tables: [],
            savedLayouts: [],
            activeLayoutId: null,
            isLoading: false,
            unsavedChanges: false,
            error: null,
            
            setTables: (tables: TablePosition[]) => set({ tables }),
            
            updateTablePosition: (tableId: number, position: { x: number; y: number }) => {
                set((state) => ({
                    tables: state.tables.map((table) =>
                        table.tableId === tableId
                            ? { ...table, x: position.x, y: position.y }
                            : table
                    ),
                    unsavedChanges: true,
                }));
            },
            
            updateTableSize: (
                tableId: number,
                size: { width: number; height: number }
            ) => {
                set((state) => ({
                    tables: state.tables.map((table) =>
                        table.tableId === tableId
                            ? { ...table, width: size.width, height: size.height }
                            : table
                    ),
                    unsavedChanges: true,
                }));
            },
            
            updateTableRotation: (tableId: number, rotation: number) => {
                set((state) => ({
                    tables: state.tables.map((table) =>
                        table.tableId === tableId ? { ...table, rotation } : table
                    ),
                    unsavedChanges: true,
                }));
            },
            
            addTable: (table: TablePosition) => {
                set((state) => ({
                    tables: [...state.tables, table],
                    unsavedChanges: true,
                }));
            },
            
            removeTable: (tableId: number) => {
                set((state) => ({
                    tables: state.tables.filter((table) => table.tableId !== tableId),
                    unsavedChanges: true,
                }));
            },
            
            getTableById: (tableId: number) => {
                return get().tables.find((table) => table.tableId === tableId);
            },
            
            setSavedLayouts: (layouts: FloorPlanLayout[]) => set({ savedLayouts: layouts }),
            
            setActiveLayout: (layoutId: number | null) =>
                set({ activeLayoutId: layoutId }),
            
            setLoading: (loading: boolean) => set({ isLoading: loading }),
            
            setUnsavedChanges: (hasChanges: boolean) =>
                set({ unsavedChanges: hasChanges }),
            
            setError: (error: string | null) => set({ error }),
            
            markAsModified: () => set({ unsavedChanges: true }),
        }),
        { name: 'LayoutStore' }
    )
);
