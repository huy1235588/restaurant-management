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
    Clock,
    Users,
} from 'lucide-react';
import {
    format,
    parse,
    addMinutes,
    subDays,
    addDays,
    isSameDay,
} from 'date-fns';
import { formatReservationDate, formatReservationTime, parseReservationTime } from '@/lib/utils/date';

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
            const resDate = formatReservationDate(r.reservationDate);
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

            const timeStr = parseReservationTime(res.reservationTime);
            const resStart = parse(timeStr.substring(0, 5), 'HH:mm', new Date());
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {dateReservations.length} reservation{dateReservations.length !== 1 ? 's' : ''} scheduled
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleToday} className="font-medium">
                        Today
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={handlePrevDay} className="hover:bg-primary/10">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleNextDay} className="hover:bg-primary/10">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Floor Filter */}
            {floors.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-muted/30 dark:bg-muted/10 rounded-lg border border-border/50">
                    <span className="text-sm font-semibold">Floor:</span>
                    <Select
                        value={selectedFloor.toString()}
                        onValueChange={(value) =>
                            setSelectedFloor(value === 'all' ? 'all' : parseInt(value))
                        }
                    >
                        <SelectTrigger className="w-[160px] bg-background">
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
            <Card className="p-6 overflow-x-auto shadow-lg border-2">
                {tables.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg font-medium">No reservations found</p>
                        <p className="text-sm mt-1">No tables with reservations for the selected date and floor</p>
                    </div>
                ) : (
                    <div className="min-w-max">
                        {/* Table Headers */}
                        <div className="flex gap-3 mb-6">
                            {/* Time column header */}
                            <div className="w-24 shrink-0 font-bold text-sm text-primary">Time</div>

                            {/* Table columns */}
                            {tables.map((table) => (
                                <div
                                    key={table.tableId}
                                    className="w-36 shrink-0 font-semibold text-sm text-center border-b-2 border-primary/20 pb-3 bg-gradient-to-b from-muted/50 to-transparent rounded-t-lg"
                                >
                                    <div className="text-base font-bold">Table {table.tableNumber}</div>
                                    <div className="text-xs text-muted-foreground font-normal mt-1">
                                        <Users className="inline h-3 w-3 mr-1" />
                                        {table.capacity} seats
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Timeline Grid */}
                        <div className="space-y-1">
                            {TIME_SLOTS.map((time, idx) => (
                                <div key={time}>
                                    <div className="flex gap-3 min-h-[64px]">
                                        {/* Time label */}
                                        <div className="w-24 shrink-0 text-sm font-semibold text-muted-foreground py-2">
                                            {time}
                                        </div>

                                        {/* Table slots */}
                                        {tables.map((table) => {
                                            const reservation = getReservationForSlot(table, time);

                                            return (
                                                <div
                                                    key={`${table.tableId}-${time}`}
                                                    className="w-36 shrink-0 border-2 border-border/50 rounded-md relative bg-gradient-to-br from-muted/20 to-muted/40 dark:from-muted/5 dark:to-muted/15 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                                                >
                                                    {reservation && idx === 0 && (
                                                        <div
                                                            className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-600 dark:via-blue-700 dark:to-indigo-700 rounded-md cursor-pointer p-3 text-white text-xs overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                                                            style={{ height: getReservationHeight(reservation) }}
                                                            onClick={() => onReservationClick?.(reservation)}
                                                            title={`${reservation.customerName} (${reservation.headCount} guests)`}
                                                        >
                                                            <div className="font-bold text-sm mb-1">
                                                                {reservation.customerName}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs opacity-95">
                                                                <Clock className="h-3 w-3" />
                                                                {formatReservationTime(reservation.reservationTime)}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
                                                                <Users className="h-3 w-3" />
                                                                {reservation.headCount} guest{reservation.headCount > 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {idx < TIME_SLOTS.length - 1 && <Separator className="my-1 opacity-50" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 p-4 bg-muted/30 dark:bg-muted/10 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-md shadow-md" />
                    <span className="text-sm font-medium">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-muted/20 to-muted/40 dark:from-muted/5 dark:to-muted/15 border-2 border-border/50 rounded-md" />
                    <span className="text-sm font-medium">Available</span>
                </div>
            </div>
        </div>
    );
}
