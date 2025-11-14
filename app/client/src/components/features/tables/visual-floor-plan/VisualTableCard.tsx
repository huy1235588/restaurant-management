'use client';

import { Table } from '@/types';
import { TableStatusBadge } from '../TableStatusBadge';
import { cn } from '@/lib/utils';

interface VisualTableCardProps {
    table: Table;
    isSelected: boolean;
    isDragging: boolean;
    onEdit: (table: Table) => void;
    onChangeStatus: (table: Table) => void;
    onViewQR: (table: Table) => void;
}

export function VisualTableCard({
    table,
    isSelected,
    isDragging,
    onEdit,
    onChangeStatus,
    onViewQR,
}: VisualTableCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 border-green-300';
            case 'occupied':
                return 'bg-red-100 border-red-300';
            case 'reserved':
                return 'bg-yellow-100 border-yellow-300';
            case 'maintenance':
                return 'bg-blue-100 border-blue-300';
            default:
                return 'bg-gray-100 border-gray-300';
        }
    };

    return (
        <div
            className={cn(
                'h-full w-full flex flex-col items-center justify-center rounded border-2 cursor-move',
                'transition-all duration-150 select-none',
                getStatusColor(table.status),
                isSelected && 'ring-2 ring-blue-500 ring-offset-1 shadow-lg',
                isDragging && 'opacity-75 shadow-xl',
            )}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {/* Table Number */}
            <div className="text-sm font-bold text-gray-900">
                {table.tableNumber}
            </div>

            {/* Capacity */}
            <div className="text-xs text-gray-600 mt-1">
                {table.capacity} seats
            </div>

            {/* Status Indicator */}
            <div className="mt-1">
                <TableStatusBadge status={table.status} />
            </div>
        </div>
    );
}
