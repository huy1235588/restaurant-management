'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragMoveEvent } from '@dnd-kit/core';
import { toast } from 'sonner';
import { useEditorStore, useLayoutStore, useHistoryStore } from '../stores';
import { useFloorPlanData } from '../hooks';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { TableComponent } from './TableComponent';
import { PropertiesPanel } from './PropertiesPanel';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { checkTableCollision, snapPositionToGrid } from '../utils/geometry';
import { floorPlanApi } from '@/services/floor-plan.service';
import type { TablePosition } from '../types';

export function VisualEditorPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 1000 });
    const [draggedTable, setDraggedTable] = useState<TablePosition | null>(null);
    const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(null);
    const [isDraggingWithShift, setIsDraggingWithShift] = useState(false);
    const dragMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Pan tool state
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
    
    // Add table tool state
    const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
    
    // Load floor plan data
    useFloorPlanData();
    
    const {
        currentTool,
        selectedTableIds,
        selectTable,
        clearSelection,
        grid,
        zoom,
        pan,
        setPan,
        setTool,
        setZoom,
        showKeyboardShortcuts,
        toggleKeyboardShortcuts,
    } = useEditorStore();
    
    const {
        tables,
        updateTablePosition,
        removeTable,
        unsavedChanges,
        setUnsavedChanges,
    } = useLayoutStore();
    
    const { push: pushHistory, undo, redo } = useHistoryStore();
    
    // Update dimensions on mount and resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };
        
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);
    
    // Handle drag start
    const handleDragStart = useCallback((event: any) => {
        const table = event.active.data.current?.table;
        if (table) {
            setDraggedTable(table);
        }
    }, []);
    
    // Handle drag move (real-time collision detection with debouncing)
    const handleDragMove = useCallback((event: DragMoveEvent) => {
        if (!draggedTable) return;
        
        // Debounce position updates to 16ms (60fps)
        if (dragMoveTimeoutRef.current) {
            clearTimeout(dragMoveTimeoutRef.current);
        }
        
        dragMoveTimeoutRef.current = setTimeout(() => {
            const delta = event.delta;
            const newX = draggedTable.x + delta.x / zoom;
            const newY = draggedTable.y + delta.y / zoom;
            
            setTempPosition({ x: newX, y: newY });
        }, 16);
    }, [draggedTable, zoom]);
    
    // Handle drag end
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (!draggedTable) return;
        
        // Clear debounce timeout
        if (dragMoveTimeoutRef.current) {
            clearTimeout(dragMoveTimeoutRef.current);
        }
        
        const delta = event.delta;
        let newX = draggedTable.x + delta.x / zoom;
        let newY = draggedTable.y + delta.y / zoom;
        
        // Apply grid snapping if enabled and Shift is not held
        if (grid.snapEnabled && !isDraggingWithShift) {
            const snapped = snapPositionToGrid({ x: newX, y: newY }, grid.size);
            newX = snapped.x;
            newY = snapped.y;
        }
        
        // Check for collision
        const movedTable = { ...draggedTable, x: newX, y: newY };
        const hasCollision = checkTableCollision(movedTable, tables, [draggedTable.tableId]);
        
        if (hasCollision) {
            toast.error('Table overlaps with another table');
            setDraggedTable(null);
            setTempPosition(null);
            setIsDraggingWithShift(false);
            return;
        }
        
        // Record history
        pushHistory({
            type: 'move',
            tableId: draggedTable.tableId,
            oldPosition: { x: draggedTable.x, y: draggedTable.y },
            newPosition: { x: newX, y: newY },
            timestamp: Date.now(),
        });
        
        // Update position with smooth animation (handled by CSS transition)
        updateTablePosition(draggedTable.tableId, { x: newX, y: newY });
        
        setDraggedTable(null);
        setTempPosition(null);
        setIsDraggingWithShift(false);
    }, [draggedTable, tables, grid, zoom, isDraggingWithShift, updateTablePosition, pushHistory]);
    
    // Handle table click
    const handleTableClick = useCallback((tableId: number, multi: boolean) => {
        if (currentTool === 'select') {
            selectTable(tableId, multi);
        } else if (currentTool === 'delete') {
            const table = tables.find((t) => t.tableId === tableId);
            if (table && window.confirm(`Delete table ${table.tableNumber}?`)) {
                pushHistory({
                    type: 'delete',
                    table: table,
                    timestamp: Date.now(),
                });
                removeTable(tableId);
                toast.success('Table deleted');
            }
        }
    }, [currentTool, selectTable, tables, removeTable, pushHistory]);
    
    // Handle table resize
    const handleTableResize = useCallback((tableId: number, width: number, height: number) => {
        const { updateTableSize } = useLayoutStore.getState();
        updateTableSize(tableId, { width, height });
    }, []);
    
    // Handle canvas click
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (currentTool === 'select') {
            clearSelection();
        } else if (currentTool === 'add' && ghostPosition) {
            // TODO: Open dialog to create table at ghost position
            toast.info('Add table dialog not yet implemented');
        }
    }, [currentTool, clearSelection, ghostPosition]);
    
    // Handle mouse down for pan tool
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (currentTool === 'pan') {
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            e.preventDefault();
        }
    }, [currentTool, pan]);
    
    // Handle mouse move for pan and add tools
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        // Pan tool
        if (isPanning && panStart && currentTool === 'pan') {
            const newPan = {
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
            };
            setPan(newPan);
        }
        
        // Add tool ghost preview
        if (currentTool === 'add' && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - pan.x) / zoom;
            const y = (e.clientY - rect.top - pan.y) / zoom;
            
            // Snap to grid if enabled
            if (grid.snapEnabled) {
                const snapped = snapPositionToGrid({ x, y }, grid.size);
                setGhostPosition(snapped);
            } else {
                setGhostPosition({ x, y });
            }
        }
    }, [isPanning, panStart, currentTool, pan, zoom, grid, setPan]);
    
    // Handle mouse up for pan tool
    const handleMouseUp = useCallback(() => {
        if (currentTool === 'pan') {
            setIsPanning(false);
            setPanStart(null);
        }
    }, [currentTool]);
    
    // Handle wheel for zoom (Ctrl+Scroll)
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            const newZoom = Math.max(0.25, Math.min(2.0, zoom + delta));
            setZoom(newZoom);
        }
    }, [zoom, setZoom]);
    
    // Handle save
    const handleSave = useCallback(async () => {
        try {
            const positions = tables.map((table) => ({
                tableId: table.tableId,
                x: table.x,
                y: table.y,
                width: table.width,
                height: table.height,
                rotation: table.rotation,
                shape: table.shape,
            }));
            
            await floorPlanApi.updateTablePositions(positions);
            setUnsavedChanges(false);
            
            toast.success('Layout saved successfully');
        } catch (error) {
            toast.error('Failed to save layout');
        }
    }, [tables, setUnsavedChanges]);
    
    // Handle undo
    const handleUndo = useCallback(() => {
        const action = undo();
        if (action && action.type === 'move') {
            updateTablePosition(action.tableId, action.oldPosition);
        }
    }, [undo, updateTablePosition]);
    
    // Handle redo
    const handleRedo = useCallback(() => {
        const action = redo();
        if (action && action.type === 'move') {
            updateTablePosition(action.tableId, action.newPosition);
        }
    }, [redo, updateTablePosition]);
    
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent shortcuts if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            
            // Track Shift key for disabling snap during drag
            if (e.key === 'Shift' && draggedTable) {
                setIsDraggingWithShift(true);
            }
            
            // Tool shortcuts
            if (e.key === 'v' || e.key === 'V') {
                e.preventDefault();
                setTool('select');
            } else if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                setTool('pan');
            } else if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                setTool('add');
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                // Delete selected tables
                if (selectedTableIds.length > 0 && currentTool === 'select') {
                    e.preventDefault();
                    const confirmMsg = selectedTableIds.length === 1 
                        ? `Delete selected table?`
                        : `Delete ${selectedTableIds.length} selected tables?`;
                    
                    if (window.confirm(confirmMsg)) {
                        selectedTableIds.forEach((tableId) => {
                            const table = tables.find((t) => t.tableId === tableId);
                            if (table) {
                                pushHistory({
                                    type: 'delete',
                                    table: table,
                                    timestamp: Date.now(),
                                });
                                removeTable(tableId);
                            }
                        });
                        clearSelection();
                        toast.success(`Deleted ${selectedTableIds.length} table(s)`);
                    }
                }
            } else if (e.key === 'Escape') {
                // Cancel current action
                e.preventDefault();
                if (draggedTable) {
                    // Cancel drag operation
                    setDraggedTable(null);
                    setTempPosition(null);
                    setIsDraggingWithShift(false);
                    if (dragMoveTimeoutRef.current) {
                        clearTimeout(dragMoveTimeoutRef.current);
                    }
                } else if (currentTool === 'add') {
                    setGhostPosition(null);
                } else if (currentTool === 'pan') {
                    setIsPanning(false);
                    setPanStart(null);
                }
                clearSelection();
            }
            
            // Ctrl/Cmd + S: Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            
            // Ctrl/Cmd + Z: Undo
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
            
            // Ctrl/Cmd + Shift + Z: Redo
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
                e.preventDefault();
                handleRedo();
            }
            
            // Ctrl/Cmd + Y: Redo (alternative)
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
            
            // G: Toggle grid
            if (e.key === 'g' || e.key === 'G') {
                e.preventDefault();
                useEditorStore.getState().setGrid({ enabled: !grid.enabled });
            }
            
            // F: Toggle fullscreen
            if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                useEditorStore.getState().toggleFullscreen();
            }
            
            // ?: Show keyboard shortcuts
            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                useEditorStore.getState().toggleKeyboardShortcuts();
            }
            
            // 0: Reset zoom
            if (e.key === '0' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                setZoom(1);
            }
            
            // 1-9: Switch floors (number keys)
            const floorNum = parseInt(e.key);
            if (!isNaN(floorNum) && floorNum >= 1 && floorNum <= 9 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                useEditorStore.getState().setCurrentFloor(floorNum);
            }
        };
        
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setIsDraggingWithShift(false);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleSave, handleUndo, handleRedo, setTool, currentTool, selectedTableIds, tables, removeTable, pushHistory, clearSelection, grid.enabled, setZoom, draggedTable]);
    
    // Get cursor style based on tool
    const getCursorStyle = () => {
        switch (currentTool) {
            case 'pan':
                return isPanning ? 'grabbing' : 'grab';
            case 'add':
                return 'crosshair';
            case 'delete':
                return 'not-allowed';
            default:
                return 'default';
        }
    };
    
    return (
        <div className="flex flex-col h-[calc(100vh+0rem)] border rounded-lg bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            <EditorToolbar
                onSave={handleSave}
                onUndo={handleUndo}
                onRedo={handleRedo}
                hasUnsavedChanges={unsavedChanges}
            />
            
            <div className="flex flex-1 overflow-hidden">
                <div
                    ref={containerRef}
                    className="flex-1 relative"
                    style={{ cursor: getCursorStyle() }}
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <DndContext
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                    >
                        <EditorCanvas width={dimensions.width} height={dimensions.height}>
                            {tables.map((table) => {
                                const isSelected = selectedTableIds.includes(table.tableId);
                                const isDragged = draggedTable?.tableId === table.tableId;
                                const displayTable = isDragged && tempPosition
                                    ? { ...table, x: tempPosition.x, y: tempPosition.y }
                                    : table;
                                
                                const isColliding = isDragged && tempPosition
                                    ? checkTableCollision(displayTable, tables, [table.tableId])
                                    : false;
                                
                                return (
                                    <TableComponent
                                        key={table.tableId}
                                        table={displayTable}
                                        isSelected={isSelected}
                                        isColliding={isColliding}
                                        currentTool={currentTool}
                                        onClick={handleTableClick}
                                        onResize={handleTableResize}
                                    />
                                );
                            })}
                            
                            {/* Ghost preview for Add Table tool */}
                            {currentTool === 'add' && ghostPosition && (
                                <div
                                    className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20 rounded pointer-events-none"
                                    style={{
                                        left: ghostPosition.x,
                                        top: ghostPosition.y,
                                        width: 80,
                                        height: 80,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    <div className="flex items-center justify-center h-full text-blue-600 font-medium">
                                        New Table
                                    </div>
                                </div>
                            )}
                        </EditorCanvas>
                    </DndContext>
                </div>
                
                <PropertiesPanel />
            </div>
            
            {/* Keyboard Shortcuts Dialog */}
            <KeyboardShortcutsDialog
                open={showKeyboardShortcuts}
                onOpenChange={toggleKeyboardShortcuts}
            />
        </div>
    );
}
