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
import { checkTableCollision, snapPositionToGrid } from '../utils/geometry';
import { floorPlanApi } from '@/services/floor-plan.service';
import type { TablePosition } from '../types';

export function VisualEditorPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
    const [draggedTable, setDraggedTable] = useState<TablePosition | null>(null);
    const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(null);
    
    // Load floor plan data
    useFloorPlanData();
    
    const {
        currentTool,
        selectedTableIds,
        selectTable,
        clearSelection,
        grid,
        zoom,
    } = useEditorStore();
    
    const {
        tables,
        updateTablePosition,
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
    
    // Handle drag move (real-time collision detection)
    const handleDragMove = useCallback((event: DragMoveEvent) => {
        if (!draggedTable) return;
        
        const delta = event.delta;
        const newX = draggedTable.x + delta.x / zoom;
        const newY = draggedTable.y + delta.y / zoom;
        
        setTempPosition({ x: newX, y: newY });
    }, [draggedTable, zoom]);
    
    // Handle drag end
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (!draggedTable) return;
        
        const delta = event.delta;
        let newX = draggedTable.x + delta.x / zoom;
        let newY = draggedTable.y + delta.y / zoom;
        
        // Apply grid snapping if enabled
        if (grid.snapEnabled) {
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
        
        // Update position
        updateTablePosition(draggedTable.tableId, { x: newX, y: newY });
        
        setDraggedTable(null);
        setTempPosition(null);
    }, [draggedTable, tables, grid, zoom, updateTablePosition, pushHistory, toast]);
    
    // Handle table click
    const handleTableClick = useCallback((tableId: number, multi: boolean) => {
        if (currentTool === 'select') {
            selectTable(tableId, multi);
        } else if (currentTool === 'delete') {
            // TODO: Implement delete
        }
    }, [currentTool, selectTable]);
    
    // Handle canvas click (deselect)
    const handleCanvasClick = useCallback(() => {
        if (currentTool === 'select') {
            clearSelection();
        }
    }, [currentTool, clearSelection]);
    
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
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, handleUndo, handleRedo]);
    
    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] border rounded-lg bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
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
                    onClick={handleCanvasClick}
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
                                        onClick={handleTableClick}
                                    />
                                );
                            })}
                        </EditorCanvas>
                    </DndContext>
                </div>
                
                <PropertiesPanel />
            </div>
        </div>
    );
}
