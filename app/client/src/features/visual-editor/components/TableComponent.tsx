'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { TablePosition, Tool } from '../types';
import { cn } from '@/lib/utils';

interface TableComponentProps {
    table: TablePosition;
    isSelected: boolean;
    isColliding?: boolean;
    currentTool?: Tool;
    onClick: (tableId: number, multi: boolean) => void;
    onDoubleClick?: (tableId: number) => void;
}

export function TableComponent({
    table,
    isSelected,
    isColliding = false,
    currentTool = 'select',
    onClick,
    onDoubleClick,
}: TableComponentProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `table-${table.tableId}`,
        data: { table },
        disabled: currentTool !== 'select',
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
            {isSelected && (
                <>
                    {/* Corner handles */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-nw-resize" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-ne-resize" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-sw-resize" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-se-resize" />
                    
                    {/* Edge handles */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-n-resize" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-s-resize" />
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-w-resize" />
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-e-resize" />
                </>
            )}
        </div>
    );
}
