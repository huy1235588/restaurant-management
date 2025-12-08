'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Reservation } from '../../types';
import { TimelineHeader } from './TimelineHeader';
import { TimelineGrid } from './TimelineGrid';
import { TimelineRow } from './TimelineRow';
import { TimelineLegend } from './TimelineLegend';
import { TimelineControls } from './TimelineControls';
import { useTimelineData, TimelineTableData } from './useTimelineData';
import { TIMELINE_CONFIG, getTimelineWidth } from './timeline.constants';
import { getCurrentTimePosition, isToday, toDateString } from './timeline.utils';
import { Loader2 } from 'lucide-react';

interface GanttTimelineProps {
    reservations: Reservation[];
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onReservationClick?: (reservation: Reservation) => void;
    onEmptyCellClick?: (tableId: number, time: string, date: string) => void;
    loading?: boolean;
}

/**
 * GanttTimeline - Main container composing all timeline parts
 */
export function GanttTimeline({
    reservations,
    selectedDate,
    onDateChange,
    onReservationClick,
    onEmptyCellClick,
    loading: reservationsLoading,
}: GanttTimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hasScrolledRef = useRef(false);

    // Drag-to-scroll state
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

    const {
        tableData,
        loading: tablesLoading,
        error,
        floors,
        selectedFloor,
        setSelectedFloor,
    } = useTimelineData(reservations);

    const isLoading = reservationsLoading || tablesLoading;
    const dateString = toDateString(selectedDate);

    // Auto-scroll to current time on initial load for today
    useEffect(() => {
        if (hasScrolledRef.current || isLoading) return;

        if (isToday(dateString) && scrollContainerRef.current) {
            const currentPos = getCurrentTimePosition();
            if (currentPos !== null) {
                const containerWidth = scrollContainerRef.current.clientWidth;
                const scrollTo = currentPos - containerWidth / 2 + TIMELINE_CONFIG.tableColumnWidth;
                
                scrollContainerRef.current.scrollLeft = Math.max(0, scrollTo);
                hasScrolledRef.current = true;
            }
        }
    }, [isLoading, dateString]);

    // Reset scroll flag when date changes
    useEffect(() => {
        hasScrolledRef.current = false;
    }, [dateString]);

    // Drag-to-scroll handlers (middle mouse button or right mouse button)
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Middle mouse button (1) or right mouse button (2)
        if (e.button === 1 || e.button === 2) {
            e.preventDefault();
            const container = scrollContainerRef.current;
            if (container) {
                setIsDragging(true);
                dragStartRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    scrollLeft: container.scrollLeft,
                    scrollTop: container.scrollTop,
                };
            }
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !dragStartRef.current || !scrollContainerRef.current) return;
        
        e.preventDefault();
        const container = scrollContainerRef.current;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        
        container.scrollLeft = dragStartRef.current.scrollLeft - dx;
        container.scrollTop = dragStartRef.current.scrollTop - dy;
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        dragStartRef.current = null;
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            dragStartRef.current = null;
        }
    }, [isDragging]);

    // Prevent context menu (right-click is used for drag-to-scroll)
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    const handleEmptyCellClick = (tableId: number, time: string) => {
        if (onEmptyCellClick) {
            onEmptyCellClick(tableId, time, dateString);
        }
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <TimelineControls
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                floors={floors}
                selectedFloor={selectedFloor}
                onFloorChange={setSelectedFloor}
            />

            {/* Timeline Container */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : tableData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <p className="text-lg font-medium">Không có bàn nào</p>
                        <p className="text-sm">Vui lòng thêm bàn trong phần quản lý bàn</p>
                    </div>
                ) : (
                    <div
                        ref={scrollContainerRef}
                        className={`overflow-x-auto overflow-y-auto max-h-[600px] select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        style={{ minWidth: '100%' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onContextMenu={handleContextMenu}
                    >
                        <div style={{ width: getTimelineWidth() }}>
                            {/* Header */}
                            <TimelineHeader />

                            {/* Grid and Rows */}
                            <div className="relative">
                                {/* Background Grid */}
                                <TimelineGrid
                                    tableCount={tableData.length}
                                    selectedDate={dateString}
                                />

                                {/* Table Rows */}
                                {tableData.map(({ table, reservations }) => (
                                    <TimelineRow
                                        key={table.tableId}
                                        table={table}
                                        reservations={reservations}
                                        onReservationClick={onReservationClick}
                                        onEmptyCellClick={handleEmptyCellClick}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            {!isLoading && tableData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <TimelineLegend />
                </div>
            )}

            {/* No reservations message */}
            {!isLoading && tableData.length > 0 && reservations.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Không có đặt bàn nào cho ngày này
                </div>
            )}
        </div>
    );
}
