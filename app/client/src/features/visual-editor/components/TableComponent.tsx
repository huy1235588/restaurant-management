'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { TablePosition } from '../types';
import { cn } from '@/lib/utils';

interface TableComponentProps {
    table: TablePosition;
    isSelected: boolean;
    isColliding?: boolean;
    onClick: (tableId: number, multi: boolean) => void;
    onDoubleClick?: (tableId: number) => void;
}

export function TableComponent({
    table,
    isSelected,
    isColliding = false,
    onClick,
    onDoubleClick,
}: TableComponentProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `table-${table.tableId}`,
        data: { table },
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
                return 'bg-green-100 border-green-500';
            case 'occupied':
                return 'bg-red-100 border-red-500';
            case 'reserved':
                return 'bg-yellow-100 border-yellow-500';
            case 'maintenance':
                return 'bg-gray-100 border-gray-500';
            default:
                return 'bg-white border-gray-300';
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
    
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={cn(
                'flex flex-col items-center justify-center',
                'border-2 cursor-move transition-all',
                'select-none',
                getShapeClass(),
                getStatusColor(),
                isSelected && 'ring-4 ring-blue-500 ring-opacity-50',
                isColliding && 'border-red-500 bg-red-100',
                isDragging && 'opacity-50 shadow-lg'
            )}
            role="button"
            tabIndex={0}
            aria-label={`Table ${table.tableNumber}, ${table.status}, capacity ${table.capacity}`}
            aria-pressed={isSelected}
        >
            <div className="text-lg font-bold">{table.tableNumber}</div>
            <div className="text-xs text-gray-600">
                {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
            </div>
            
            {/* Resize handles (only show when selected) */}
            {isSelected && (
                <>
                    {/* Corner handles */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" />
                    
                    {/* Edge handles */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize" />
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize" />
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize" />
                </>
            )}
        </div>
    );
}
