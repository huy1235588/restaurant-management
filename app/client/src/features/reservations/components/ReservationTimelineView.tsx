'use client';

import React, { useMemo } from 'react';
import { useReservationStore } from '@/stores/reservationStore';
import { Reservation, Table } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    format,
    parse,
    addMinutes,
    subDays,
    addDays,
    isSameDay,
} from 'date-fns';

interface ReservationTimelineViewProps {
    onReservationClick?: (reservation: Reservation) => void;
}

const TIME_SLOTS = Array.from({ length: 26 }, (_, i) => {
    const hour = Math.floor(i / 2) + 10;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

export function ReservationTimelineView({
    onReservationClick,
}: ReservationTimelineViewProps) {
    const {
        reservations,
        selectedDate,
        setSelectedDate,
    } = useReservationStore();

    const [selectedFloor, setSelectedFloor] = React.useState<number | 'all'>('all');

    // Get unique floors from tables
    const floors = useMemo(() => {
        const floorSet = new Set<number>();
        reservations.forEach((res) => {
            if (res.table?.floor) floorSet.add(res.table.floor);
        });
        return Array.from(floorSet).sort();
    }, [reservations]);

    // Get reservations for selected date
    const dateReservations = useMemo(() => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        return reservations.filter((r) => {
            // Handle both Date objects and string formats
            const resDate = typeof r.reservationDate === 'string' 
                ? r.reservationDate.split('T')[0] // ISO string: "2024-11-18T00:00:00.000Z" -> "2024-11-18"
                : format(new Date(r.reservationDate), 'yyyy-MM-dd');
            return resDate === dateStr;
        });
    }, [reservations, selectedDate]);

    // Get unique tables for selected floor
    const tables = useMemo(() => {
        const tableMap = new Map<number, Table>();
        dateReservations.forEach((res) => {
            if (res.table) {
                const floor = res.table.floor || 0;
                if (selectedFloor === 'all' || selectedFloor === floor) {
                    if (!tableMap.has(res.table.tableId)) {
                        tableMap.set(res.table.tableId, res.table);
                    }
                }
            }
        });
        return Array.from(tableMap.values()).sort((a, b) => {
            const aNum = parseInt(a.tableNumber) || 0;
            const bNum = parseInt(b.tableNumber) || 0;
            return aNum - bNum;
        });
    }, [dateReservations, selectedFloor]);

    // Check if reservation occupies a time slot
    const getReservationForSlot = (table: Table, time: string): Reservation | undefined => {
        return dateReservations.find((res) => {
            if (res.tableId !== table.tableId) return false;

            const resStart = parse(res.reservationTime, 'HH:mm', new Date());
            const resEnd = addMinutes(resStart, res.duration || 120);

            const slotStart = parse(time, 'HH:mm', new Date());
            const slotEnd = addMinutes(slotStart, 30);

            return (
                (slotStart >= resStart && slotStart < resEnd) ||
                (slotEnd > resStart && slotEnd <= resEnd) ||
                (slotStart <= resStart && slotEnd >= resEnd)
            );
        });
    };

    // Get reservation height based on duration
    const getReservationHeight = (reservation: Reservation) => {
        const duration = reservation.duration || 120;
        const slots = duration / 30;
        return `${slots * 100}%`;
    };

    // Navigation handlers
    const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
    const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
    const handleToday = () => setSelectedDate(new Date());

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {dateReservations.length} reservation{dateReservations.length !== 1 ? 's' : ''} for this date
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleToday}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={handlePrevDay}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextDay}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Floor Filter */}
            {floors.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Floor:</span>
                    <Select
                        value={selectedFloor.toString()}
                        onValueChange={(value) =>
                            setSelectedFloor(value === 'all' ? 'all' : parseInt(value))
                        }
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Floors</SelectItem>
                            {floors.map((floor) => (
                                <SelectItem key={floor} value={floor.toString()}>
                                    Floor {floor}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Timeline */}
            <Card className="p-4 overflow-x-auto">
                {tables.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No tables with reservations for the selected date and floor
                    </div>
                ) : (
                    <div className="min-w-max">
                        {/* Table Headers */}
                        <div className="flex gap-2 mb-4">
                            {/* Time column header */}
                            <div className="w-24 flex-shrink-0 font-semibold text-sm">Time</div>

                            {/* Table columns */}
                            {tables.map((table) => (
                                <div
                                    key={table.tableId}
                                    className="w-32 flex-shrink-0 font-semibold text-sm text-center border-b pb-2"
                                >
                                    <div>Table {table.tableNumber}</div>
                                    <div className="text-xs text-muted-foreground font-normal">
                                        Capacity: {table.capacity}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Timeline Grid */}
                        <div className="space-y-0.5">
                            {TIME_SLOTS.map((time, idx) => (
                                <div key={time}>
                                    <div className="flex gap-2 min-h-[60px]">
                                        {/* Time label */}
                                        <div className="w-24 flex-shrink-0 text-xs font-medium text-muted-foreground py-1">
                                            {time}
                                        </div>

                                        {/* Table slots */}
                                        {tables.map((table) => {
                                            const reservation = getReservationForSlot(table, time);

                                            return (
                                                <div
                                                    key={`${table.tableId}-${time}`}
                                                    className="w-32 flex-shrink-0 border border-border/50 rounded relative bg-muted/30 dark:bg-muted/10 hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors"
                                                >
                                                    {reservation && idx === 0 && (
                                                        <div
                                                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded cursor-pointer p-2 text-white text-xs overflow-hidden hover:shadow-lg transition-shadow"
                                                            style={{ height: getReservationHeight(reservation) }}
                                                            onClick={() => onReservationClick?.(reservation)}
                                                            title={`${reservation.customerName} (${reservation.headCount} guests)`}
                                                        >
                                                            <div className="font-semibold text-xs">
                                                                {reservation.customerName}
                                                            </div>
                                                            <div className="text-xs opacity-90">
                                                                {reservation.reservationTime}
                                                            </div>
                                                            <div className="text-xs opacity-80">
                                                                {reservation.headCount} guest{reservation.headCount > 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {idx < TIME_SLOTS.length - 1 && <Separator className="my-0.5" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded shadow-sm" />
                    <span>Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-muted/30 dark:bg-muted/10 border border-border/50 rounded" />
                    <span>Available</span>
                </div>
            </div>
        </div>
    );
}
