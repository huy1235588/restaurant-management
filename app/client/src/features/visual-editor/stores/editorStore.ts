import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Tool, Position, GridSettings } from '../types';

interface EditorState {
    // Tool state
    currentTool: Tool;
    
    // Selection state
    selectedTableIds: number[];
    
    // View state
    zoom: number;
    pan: Position;
    
    // Grid state
    grid: GridSettings;
    
    // Floor state
    currentFloor: number;
    
    // Fullscreen state
    isFullscreen: boolean;
    
    // UI state
    showKeyboardShortcuts: boolean;
    showPropertiesPanel: boolean;
    
    // Actions
    setTool: (tool: Tool) => void;
    selectTable: (tableId: number, multi?: boolean) => void;
    deselectTable: (tableId: number) => void;
    clearSelection: () => void;
    setZoom: (zoom: number) => void;
    setPan: (pan: Position) => void;
    setGrid: (grid: Partial<GridSettings>) => void;
    setCurrentFloor: (floor: number) => void;
    toggleFullscreen: () => void;
    toggleKeyboardShortcuts: () => void;
    togglePropertiesPanel: () => void;
    resetView: () => void;
}

const INITIAL_STATE = {
    currentTool: 'select' as Tool,
    selectedTableIds: [] as number[],
    zoom: 1,
    pan: { x: 0, y: 0 },
    grid: {
        enabled: true,
        size: 20,
        snapEnabled: true,
    },
    currentFloor: 1,
    isFullscreen: false,
    showKeyboardShortcuts: false,
    showPropertiesPanel: true,
};

export const useEditorStore = create<EditorState>()(
    devtools(
        (set, get) => ({
            ...INITIAL_STATE,
            
            setTool: (tool: Tool) => set({ currentTool: tool }),
            
            selectTable: (tableId: number, multi: boolean = false) => {
                const { selectedTableIds } = get();
                
                if (multi) {
                    // Add to selection if not already selected
                    if (!selectedTableIds.includes(tableId)) {
                        set({ selectedTableIds: [...selectedTableIds, tableId] });
                    }
                } else {
                    // Replace selection
                    set({ selectedTableIds: [tableId] });
                }
            },
            
            deselectTable: (tableId: number) => {
                const { selectedTableIds } = get();
                set({
                    selectedTableIds: selectedTableIds.filter((id) => id !== tableId),
                });
            },
            
            clearSelection: () => set({ selectedTableIds: [] }),
            
            setZoom: (zoom: number) => {
                // Clamp between 0.25 and 2.0
                const clampedZoom = Math.max(0.25, Math.min(2.0, zoom));
                set({ zoom: clampedZoom });
            },
            
            setPan: (pan: Position) => set({ pan }),
            
            setGrid: (gridUpdate: Partial<GridSettings>) => {
                const { grid } = get();
                set({ grid: { ...grid, ...gridUpdate } });
            },
            
            setCurrentFloor: (floor: number) => set({ currentFloor: floor }),
            
            toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
            
            toggleKeyboardShortcuts: () =>
                set((state) => ({ showKeyboardShortcuts: !state.showKeyboardShortcuts })),
            
            togglePropertiesPanel: () =>
                set((state) => ({ showPropertiesPanel: !state.showPropertiesPanel })),
            
            resetView: () => set({ zoom: 1, pan: { x: 0, y: 0 } }),
        }),
        { name: 'EditorStore' }
    )
);
