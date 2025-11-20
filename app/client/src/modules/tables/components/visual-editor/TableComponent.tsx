'use client';

import React, { useState, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { TablePosition, Tool } from '../../types';
import { cn } from '@/lib/utils';
import { snapSizeToGrid } from '../../utils/geometry';
import { useEditorStore } from '../../stores';

interface TableComponentProps {
    table: TablePosition;
    isSelected: boolean;
    isColliding?: boolean;
    currentTool?: Tool;
    onClick: (tableId: number, multi: boolean) => void;
    onDoubleClick?: (tableId: number) => void;
    onResize?: (tableId: number, width: number, height: number) => void;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e' | null;

const MIN_SIZE = 40;
const MAX_SIZE = 200;

const TableComponentRaw = ({
    table,
    isSelected,
    isColliding = false,
    currentTool = 'select',
    onClick,
    onDoubleClick,
    onResize,
}: TableComponentProps) => {
    const [resizing, setResizing] = useState<ResizeHandle>(null);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `table-${table.tableId}`,
        data: { table },
        disabled: currentTool !== 'select' || resizing !== null,
    });
    
    const style = {
        position: 'absolute' as const,
        left: table.x,
        top: table.y,
        width: table.width,
        height: table.height,
        transform: CSS.Translate.toString(transform),
        rotate: `${table.rotation}deg`,
    };
    
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(table.tableId, e.shiftKey);
    };
    
    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDoubleClick?.(table.tableId);
    };
    
    const handleResizeStart = useCallback((handle: ResizeHandle, e: React.MouseEvent) => {
        e.stopPropagation();
        setResizing(handle);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: table.width,
            height: table.height,
        });
    }, [table.width, table.height]);
    
    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!resizing || !onResize) return;
        
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        
        // Calculate new dimensions based on handle
        switch (resizing) {
            case 'se':
                newWidth = resizeStart.width + deltaX;
                newHeight = resizeStart.height + deltaY;
                break;
            case 'sw':
                newWidth = resizeStart.width - deltaX;
                newHeight = resizeStart.height + deltaY;
                break;
            case 'ne':
                newWidth = resizeStart.width + deltaX;
                newHeight = resizeStart.height - deltaY;
                break;
            case 'nw':
                newWidth = resizeStart.width - deltaX;
                newHeight = resizeStart.height - deltaY;
                break;
            case 'e':
                newWidth = resizeStart.width + deltaX;
                break;
            case 'w':
                newWidth = resizeStart.width - deltaX;
                break;
            case 's':
                newHeight = resizeStart.height + deltaY;
                break;
            case 'n':
                newHeight = resizeStart.height - deltaY;
                break;
        }
        
        // Apply constraints
        newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newWidth));
        newHeight = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newHeight));
        
        onResize(table.tableId, newWidth, newHeight);
    }, [resizing, resizeStart, table.tableId, onResize]);
    
    const handleResizeEnd = useCallback(() => {
        if (!resizing || !onResize) {
            setResizing(null);
            return;
        }
        
        // Get current size
        const currentWidth = table.width;
        const currentHeight = table.height;
        
        // Apply grid snapping on resize end
        const { grid } = useEditorStore.getState();
        if (grid.snapEnabled) {
            const snappedSize = snapSizeToGrid(
                { width: currentWidth, height: currentHeight },
                grid.size
            );
            onResize(table.tableId, snappedSize.width, snappedSize.height);
        }
        
        setResizing(null);
    }, [resizing, onResize, table.tableId, table.width, table.height]);
    
    React.useEffect(() => {
        if (resizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [resizing, handleResizeMove, handleResizeEnd]);
    
    const getStatusColor = () => {
        switch (table.status) {
            case 'available':
                return 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600';
            case 'occupied':
                return 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-600';
            case 'reserved':
                return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-600';
            case 'maintenance':
                return 'bg-gray-100 dark:bg-gray-800 border-gray-500 dark:border-gray-600';
            default:
                return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600';
        }
    };
    
    const getShapeClass = () => {
        switch (table.shape) {
            case 'circle':
            case 'oval':
                return 'rounded-full';
            case 'square':
            case 'rectangle':
            default:
                return 'rounded-lg';
        }
    };
    
    const getCursorClass = () => {
        if (currentTool === 'select') return 'cursor-move';
        if (currentTool === 'delete') return 'cursor-not-allowed';
        return 'cursor-pointer';
    };
    
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(currentTool === 'select' ? listeners : {})}
            {...(currentTool === 'select' ? attributes : {})}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={cn(
                'flex flex-col items-center justify-center',
                'border-2 transition-all',
                'select-none text-gray-900 dark:text-gray-100',
                getShapeClass(),
                getStatusColor(),
                getCursorClass(),
                isSelected && 'ring-4 ring-blue-500 dark:ring-blue-400 ring-opacity-50',
                isColliding && 'border-red-500 dark:border-red-600 bg-red-100 dark:bg-red-900/30',
                isDragging && 'opacity-50 shadow-lg dark:shadow-gray-900/50'
            )}
            role="button"
            tabIndex={0}
            aria-label={`Table ${table.tableNumber}, ${table.status}, capacity ${table.capacity}`}
            aria-pressed={isSelected}
        >
            <div className="text-lg font-bold">{table.tableNumber}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
                {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
            </div>
            
            {/* Resize handles (only show when selected) */}
            {isSelected && currentTool === 'select' && (
                <>
                    {/* Corner handles */}
                    <div 
                        className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-nw-resize z-10"
                        onMouseDown={(e) => handleResizeStart('nw', e)}
                    />
                    <div 
                        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-ne-resize z-10"
                        onMouseDown={(e) => handleResizeStart('ne', e)}
                    />
                    <div 
                        className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-sw-resize z-10"
                        onMouseDown={(e) => handleResizeStart('sw', e)}
                    />
                    <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-se-resize z-10"
                        onMouseDown={(e) => handleResizeStart('se', e)}
                    />
                    
                    {/* Edge handles */}
                    <div 
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-n-resize z-10"
                        onMouseDown={(e) => handleResizeStart('n', e)}
                    />
                    <div 
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-s-resize z-10"
                        onMouseDown={(e) => handleResizeStart('s', e)}
                    />
                    <div 
                        className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-w-resize z-10"
                        onMouseDown={(e) => handleResizeStart('w', e)}
                    />
                    <div 
                        className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-e-resize z-10"
                        onMouseDown={(e) => handleResizeStart('e', e)}
                    />
                </>
            )}
        </div>
    );
};

// Memoize component for performance optimization
export const TableComponent = React.memo(TableComponentRaw, (prevProps, nextProps) => {
    return (
        prevProps.table.tableId === nextProps.table.tableId &&
        prevProps.table.x === nextProps.table.x &&
        prevProps.table.y === nextProps.table.y &&
        prevProps.table.width === nextProps.table.width &&
        prevProps.table.height === nextProps.table.height &&
        prevProps.table.rotation === nextProps.table.rotation &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isColliding === nextProps.isColliding &&
        prevProps.currentTool === nextProps.currentTool
    );
});
