'use client';

import { useState, useCallback, useMemo } from 'react';
import { Table } from '@/types';
import { Reservation } from '../../types';
import { ReservationBar } from './ReservationBar';
import { TIMELINE_CONFIG, getHourLabels } from './timeline.constants';
import { getTimeFromPosition, calculateReservationTracks } from './timeline.utils';
import { Plus } from 'lucide-react';

interface TimelineRowProps {
    table: Table;
    reservations: Reservation[];
    onReservationClick?: (reservation: Reservation) => void;
    onEmptyCellClick?: (tableId: number, time: string) => void;
}

// Ghost bar width: 1.5 hours in pixels
const GHOST_BAR_WIDTH = TIMELINE_CONFIG.hourWidth * 1.5;

/**
 * TimelineRow - Single table row containing reservation bars
 */
export function TimelineRow({
    table,
    reservations,
    onReservationClick,
    onEmptyCellClick,
}: TimelineRowProps) {
    const { hourWidth, tableColumnWidth, rowHeight } = TIMELINE_CONFIG;
    const hourLabels = getHourLabels();
    const gridWidth = hourLabels.length * hourWidth;

    // Calculate tracks to prevent overlap
    const reservationTracks = useMemo(() => {
        return calculateReservationTracks(reservations);
    }, [reservations]);
    
    // Calculate number of tracks needed (max track + 1)
    const trackCount = useMemo(() => {
        if (reservationTracks.size === 0) return 1;
        return Math.max(...Array.from(reservationTracks.values())) + 1;
    }, [reservationTracks]);
    
    // Dynamic height based on tracks (48px per track + 16px padding)
    const dynamicHeight = Math.max(rowHeight, trackCount * 48 + 16);

    // Track mouse position for ghost bar
    const [ghostPosition, setGhostPosition] = useState<{ x: number; time: string } | null>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const time = getTimeFromPosition(clickX);
        setGhostPosition({ x: clickX, time });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setGhostPosition(null);
    }, []);

    const handleEmptyCellClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!onEmptyCellClick) return;

        // Calculate click position relative to grid
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        // Convert to time
        const time = getTimeFromPosition(clickX);
        onEmptyCellClick(table.tableId, time);
    };

    return (
        <div
            className="flex border-b border-gray-100 dark:border-gray-700"
            style={{ height: dynamicHeight }}
        >
            {/* Table info column */}
            <div
                className="sticky left-0 z-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700"
                style={{ 
                    width: tableColumnWidth, 
                    minWidth: tableColumnWidth,
                }}
            >
                <div className="truncate">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {table.tableNumber}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {table.capacity}P • Tầng {table.floor}
                    </div>
                </div>
            </div>

            {/* Timeline area with reservations */}
            <div
                className="relative bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                style={{ 
                    width: gridWidth,
                    minWidth: gridWidth,
                }}
                onClick={handleEmptyCellClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Ghost bar indicator following mouse */}
                {ghostPosition && (
                    <div 
                        className="absolute top-2 pointer-events-none z-5 transition-all duration-75"
                        style={{ 
                            height: 44,
                            left: Math.max(0, ghostPosition.x - GHOST_BAR_WIDTH / 2),
                            width: GHOST_BAR_WIDTH,
                        }}
                    >
                        <div className="h-full rounded-md border-2 border-dashed border-blue-400 dark:border-blue-500 bg-blue-100/70 dark:bg-blue-900/40 flex items-center justify-center gap-1.5">
                            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                {ghostPosition.time}
                            </span>
                        </div>
                    </div>
                )}

                {/* Reservation bars */}
                {reservations.map((reservation) => (
                    <ReservationBar
                        key={reservation.reservationId}
                        reservation={reservation}
                        track={reservationTracks.get(reservation.reservationId) || 0}
                        onClick={onReservationClick}
                    />
                ))}
            </div>
        </div>
    );
}
