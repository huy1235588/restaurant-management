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
import { QuickCreateTableDialog } from './QuickCreateTableDialog';
import { DeleteTableDialog } from './DeleteTableDialog';
import { checkTableCollision, snapPositionToGrid } from '../utils/geometry';
import { floorPlanApi } from '@/services/floor-plan.service';
import type { TablePosition } from '../types';
import { Button } from '@/components/ui/button';

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
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createPosition, setCreatePosition] = useState({ x: 0, y: 0 });
    
    // Snap preview state
    const [snapPreview, setSnapPreview] = useState<{ x: number; y: number } | null>(null);
    
    // Delete dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [tablesToDelete, setTablesToDelete] = useState<number[]>([]);
    
    // Save state
    const [isSaving, setIsSaving] = useState(false);
    
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
        isFullscreen,
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
    
    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const { setFullscreen } = useEditorStore.getState();
            if (document.fullscreenElement) {
                setFullscreen(true);
            } else {
                setFullscreen(false);
            }
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Warn on exit if there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (unsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [unsavedChanges]);
    
    // Handle drag start
    const handleDragStart = useCallback((event: any) => {
        const table = event.active.data.current?.table;
        if (table) {
            setDraggedTable(table);
            // Select table when dragging to show properties
            selectTable(table.tableId, false);
        }
    }, [selectTable]);
    
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
            
            // Show snap preview if grid snapping is enabled
            if (grid.snapEnabled && !isDraggingWithShift) {
                const snapped = snapPositionToGrid({ x: newX, y: newY }, grid.size);
                setSnapPreview(snapped);
            } else {
                setSnapPreview(null);
            }
        }, 16);
    }, [draggedTable, zoom, grid.snapEnabled, grid.size, isDraggingWithShift]);
    
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
        setSnapPreview(null);
    }, [draggedTable, tables, grid, zoom, isDraggingWithShift, updateTablePosition, pushHistory]);
    
    // Handle table click
    const handleTableClick = useCallback((tableId: number, multi: boolean) => {
        if (currentTool === 'select') {
            selectTable(tableId, multi);
        } else if (currentTool === 'delete') {
            setTablesToDelete([tableId]);
            setShowDeleteDialog(true);
        }
    }, [currentTool, selectTable]);
    
    // Handle delete confirm
    const handleDeleteConfirm = useCallback(() => {
        tablesToDelete.forEach((tableId) => {
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
        toast.success(`Deleted ${tablesToDelete.length} table(s)`);
        setTablesToDelete([]);
    }, [tablesToDelete, tables, removeTable, pushHistory, clearSelection]);
    
    // Handle delete from properties panel
    const handleDeleteFromPanel = useCallback((tableId: number) => {
        setTablesToDelete([tableId]);
        setShowDeleteDialog(true);
    }, []);
    
    // Handle table resize
    const handleTableResize = useCallback((tableId: number, width: number, height: number) => {
        const { updateTableSize } = useLayoutStore.getState();
        updateTableSize(tableId, { width, height });
    }, []);
    
    // Handle create table
    const handleCreateTable = useCallback(async (data: {
        tableNumber: string;
        capacity: number;
        shape: 'circle' | 'square' | 'rectangle' | 'oval';
        x: number;
        y: number;
    }) => {
        try {
            // Tính kích thước bàn
            const tableWidth = data.shape === 'rectangle' ? 120 : 80;
            const tableHeight = 80;
            
            // Create new table object - đặt ở chính giữa vị trí ghost preview
            // Use negative ID for temporary tables (not yet saved to DB)
            const tempId = -(Date.now() % 1000000); // Negative ID in safe range
            const newTable: TablePosition = {
                tableId: tempId, // Temporary negative ID
                tableNumber: data.tableNumber,
                capacity: data.capacity,
                shape: data.shape,
                x: data.x - tableWidth / 2,
                y: data.y - tableHeight / 2,
                width: tableWidth,
                height: tableHeight,
                rotation: 0,
                status: 'available',
            };
            
            // Check for collision
            const hasCollision = checkTableCollision(newTable, tables);
            if (hasCollision) {
                toast.error('Cannot place table here - overlaps with another table');
                return;
            }
            
            // Add to store
            const { addTable } = useLayoutStore.getState();
            addTable(newTable);
            
            // Record history
            pushHistory({
                type: 'create',
                table: newTable,
                timestamp: Date.now(),
            });
            
            toast.success(`Table ${data.tableNumber} created`);
            
            // Keep tool active for adding more tables
        } catch (error) {
            toast.error('Failed to create table');
        }
    }, [tables, pushHistory]);
    
    // Handle canvas click
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (currentTool === 'select') {
            clearSelection();
        } else if (currentTool === 'add' && ghostPosition) {
            setCreatePosition(ghostPosition);
            setShowCreateDialog(true);
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
        
        // Add tool ghost preview - cập nhật ngay lập tức không debounce
        if (currentTool === 'add' && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Tính toán vị trí chính xác với zoom và pan
            const x = (e.clientX - rect.left) / zoom - pan.x / zoom;
            const y = (e.clientY - rect.top) / zoom - pan.y / zoom;
            
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
    
    // Handle wheel for zoom (Ctrl+Scroll) with center-point
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            
            // Get cursor position relative to container
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const centerPoint = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                };
                
                const delta = -e.deltaY * 0.001;
                const newZoom = Math.max(0.25, Math.min(2.0, zoom + delta));
                setZoom(newZoom, centerPoint);
            }
        }
    }, [zoom, setZoom]);
    
    // Handle save
    const handleSave = useCallback(async () => {
        if (isSaving) return;
        
        try {
            setIsSaving(true);
            
            // Only save tables with positive IDs (existing in DB)
            // Tables with negative IDs are temporary and need to be created first
            const existingTables = tables.filter(table => table.tableId > 0);
            
            if (existingTables.length === 0) {
                toast.warning('No existing tables to save. New tables need to be created through the API.');
                setIsSaving(false);
                return;
            }
            
            const positions = existingTables.map((table) => ({
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
            
            const tempTablesCount = tables.length - existingTables.length;
            if (tempTablesCount > 0) {
                toast.success(`Layout saved successfully. ${tempTablesCount} new table(s) not saved (temporary).`);
            } else {
                toast.success('Layout saved successfully');
            }
        } catch (error) {
            toast.error('Failed to save layout');
        } finally {
            setIsSaving(false);
        }
    }, [tables, setUnsavedChanges, isSaving]);
    
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
                    setTablesToDelete(selectedTableIds);
                    setShowDeleteDialog(true);
                }
            } else if (e.key === 'Escape') {
                // Cancel current action
                e.preventDefault();
                
                // Exit fullscreen if active
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (draggedTable) {
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
                } else {
                    clearSelection();
                }
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
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    containerRef.current?.parentElement?.requestFullscreen();
                }
                useEditorStore.getState().toggleFullscreen();
            }
            
            // Arrow keys: Move selected table
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                if (selectedTableIds.length === 1 && currentTool === 'select') {
                    e.preventDefault();
                    const tableId = selectedTableIds[0];
                    const table = tables.find((t) => t.tableId === tableId);
                    if (table) {
                        const step = e.shiftKey ? 10 : 1; // Shift for faster movement
                        let newX = table.x;
                        let newY = table.y;
                        
                        switch (e.key) {
                            case 'ArrowUp':
                                newY -= step;
                                break;
                            case 'ArrowDown':
                                newY += step;
                                break;
                            case 'ArrowLeft':
                                newX -= step;
                                break;
                            case 'ArrowRight':
                                newX += step;
                                break;
                        }
                        
                        // Check for collision
                        const movedTable = { ...table, x: newX, y: newY };
                        const hasCollision = checkTableCollision(movedTable, tables, [tableId]);
                        
                        if (!hasCollision) {
                            updateTablePosition(tableId, { x: newX, y: newY });
                        }
                    }
                }
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
            {/* Fullscreen Exit Button */}
            {isFullscreen && (
                <div className="absolute top-4 right-4 z-50">
                    <Button
                        onClick={() => document.exitFullscreen()}
                        className="bg-black/50 hover:bg-black/70 text-white"
                        size="sm"
                    >
                        Exit Fullscreen (ESC)
                    </Button>
                </div>
            )}
            
            <EditorToolbar
                onSave={handleSave}
                onUndo={handleUndo}
                onRedo={handleRedo}
                hasUnsavedChanges={unsavedChanges}
                isSaving={isSaving}
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
                            
                            {/* Snap preview indicator */}
                            {snapPreview && draggedTable && (
                                <div
                                    className="absolute pointer-events-none z-10"
                                    style={{
                                        left: snapPreview.x,
                                        top: snapPreview.y,
                                        width: draggedTable.width,
                                        height: draggedTable.height,
                                    }}
                                >
                                    <div className="w-full h-full border-2 border-dashed border-blue-400 bg-blue-400/10 rounded" />
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                        Snap: ({Math.round(snapPreview.x)}, {Math.round(snapPreview.y)})
                                    </div>
                                </div>
                            )}
                            
                            {/* Ghost preview for Add Table tool */}
                            {currentTool === 'add' && ghostPosition && (() => {
                                const ghostWidth = 80;
                                const ghostHeight = 80;
                                const ghostTable: TablePosition = {
                                    tableId: -1,
                                    tableNumber: 'New',
                                    capacity: 4,
                                    shape: 'circle',
                                    x: ghostPosition.x - ghostWidth / 2,
                                    y: ghostPosition.y - ghostHeight / 2,
                                    width: ghostWidth,
                                    height: ghostHeight,
                                    rotation: 0,
                                    status: 'available',
                                };
                                const hasCollision = checkTableCollision(ghostTable, tables);
                                const colorClass = hasCollision 
                                    ? 'border-red-500 bg-red-500/20' 
                                    : 'border-green-500 bg-green-500/20';
                                const textClass = hasCollision ? 'text-red-600' : 'text-green-600';
                                
                                return (
                                    <div
                                        className={`absolute border-2 border-dashed ${colorClass} rounded-full pointer-events-none`}
                                        style={{
                                            left: ghostTable.x,
                                            top: ghostTable.y,
                                            width: ghostWidth,
                                            height: ghostHeight,
                                        }}
                                    >
                                        <div className={`flex items-center justify-center h-full ${textClass} font-medium text-2xl`}>
                                            {hasCollision ? '✕' : '✓'}
                                        </div>
                                    </div>
                                );
                            })()}
                        </EditorCanvas>
                    </DndContext>
                </div>
                
                <PropertiesPanel onDelete={handleDeleteFromPanel} />
            </div>
            
            {/* Keyboard Shortcuts Dialog */}
            <KeyboardShortcutsDialog
                open={showKeyboardShortcuts}
                onOpenChange={toggleKeyboardShortcuts}
            />
            
            {/* Quick Create Table Dialog */}
            <QuickCreateTableDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                position={createPosition}
                onCreateTable={handleCreateTable}
                existingTableNumbers={tables.map(t => t.tableNumber)}
            />
            
            {/* Delete Table Dialog */}
            <DeleteTableDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDeleteConfirm}
                tableNumbers={tablesToDelete.map(id => {
                    const table = tables.find(t => t.tableId === id);
                    return table?.tableNumber || 'Unknown';
                })}
            />
        </div>
    );
}
