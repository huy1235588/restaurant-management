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
    setZoom: (zoom: number, centerPoint?: Position) => void;
    setPan: (pan: Position) => void;
    setGrid: (grid: Partial<GridSettings>) => void;
    setCurrentFloor: (floor: number) => void;
    toggleFullscreen: () => void;
    toggleKeyboardShortcuts: () => void;
    togglePropertiesPanel: () => void;
    resetView: () => void;
    fitToView: (tables: Array<{ x: number; y: number; width: number; height: number }>, canvasWidth: number, canvasHeight: number) => void;
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
            
            setZoom: (zoom: number, centerPoint?: Position) => {
                const { zoom: currentZoom, pan: currentPan } = get();
                
                // Clamp between 0.25 and 2.0
                const clampedZoom = Math.max(0.25, Math.min(2.0, zoom));
                
                // If center point provided, adjust pan to zoom toward that point
                if (centerPoint) {
                    const zoomRatio = clampedZoom / currentZoom;
                    const newPan = {
                        x: centerPoint.x - (centerPoint.x - currentPan.x) * zoomRatio,
                        y: centerPoint.y - (centerPoint.y - currentPan.y) * zoomRatio,
                    };
                    set({ zoom: clampedZoom, pan: newPan });
                } else {
                    set({ zoom: clampedZoom });
                }
            },
            
            setPan: (pan: Position) => {
                // Apply pan boundaries (prevent panning too far out)
                // Allow some negative panning but keep content somewhat visible
                const maxPan = 5000; // Maximum pan distance in pixels
                const clampedPan = {
                    x: Math.max(-maxPan, Math.min(maxPan, pan.x)),
                    y: Math.max(-maxPan, Math.min(maxPan, pan.y)),
                };
                set({ pan: clampedPan });
            },
            
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
            
            fitToView: (tables, canvasWidth, canvasHeight) => {
                if (tables.length === 0) {
                    set({ zoom: 1, pan: { x: 0, y: 0 } });
                    return;
                }
                
                // Calculate bounding box of all tables
                const minX = Math.min(...tables.map(t => t.x));
                const minY = Math.min(...tables.map(t => t.y));
                const maxX = Math.max(...tables.map(t => t.x + t.width));
                const maxY = Math.max(...tables.map(t => t.y + t.height));
                
                const contentWidth = maxX - minX;
                const contentHeight = maxY - minY;
                
                // Add padding (10% of canvas size)
                const padding = 0.1;
                const availableWidth = canvasWidth * (1 - padding * 2);
                const availableHeight = canvasHeight * (1 - padding * 2);
                
                // Calculate zoom to fit content
                const zoomX = availableWidth / contentWidth;
                const zoomY = availableHeight / contentHeight;
                const newZoom = Math.max(0.25, Math.min(2.0, Math.min(zoomX, zoomY)));
                
                // Center the content
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                const newPan = {
                    x: (canvasWidth / 2 - centerX * newZoom),
                    y: (canvasHeight / 2 - centerY * newZoom),
                };
                
                set({ zoom: newZoom, pan: newPan });
            },
        }),
        { name: 'EditorStore' }
    )
);
