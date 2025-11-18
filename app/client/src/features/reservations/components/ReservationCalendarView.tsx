'use client';

import React, { useMemo } from 'react';
import { useReservationStore } from '@/stores/reservationStore';
import { Reservation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    getDay,
} from 'date-fns';
import { ReservationCard } from './ReservationCard';

type CalendarViewType = 'month' | 'week' | 'day';

interface ReservationCalendarViewProps {
    onReservationClick?: (reservation: Reservation) => void;
    onDateSelect?: (date: Date) => void;
}

export function ReservationCalendarView({
    onReservationClick,
    onDateSelect,
}: ReservationCalendarViewProps) {
    const {
        reservations,
        selectedDate,
        setSelectedDate,
        isLoading,
    } = useReservationStore();

    const [viewType, setViewType] = React.useState<CalendarViewType>('month');

    // Get reservations for selected date
    const reservationsForDate = useMemo(() => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        return reservations.filter((r) => {
            // Handle both Date objects and string formats
            const resDate = typeof r.reservationDate === 'string' 
                ? r.reservationDate.split('T')[0] // ISO string: "2024-11-18T00:00:00.000Z" -> "2024-11-18"
                : format(new Date(r.reservationDate), 'yyyy-MM-dd');
            return resDate === dateStr;
        }).sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));
    }, [reservations, selectedDate]);

    // Get calendar days for month view
    const monthDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(selectedDate));
        const end = endOfWeek(endOfMonth(selectedDate));
        return eachDayOfInterval({ start, end });
    }, [selectedDate]);

    // Get days for week view
    const weekDays = useMemo(() => {
        const start = startOfWeek(selectedDate);
        const end = endOfWeek(selectedDate);
        return eachDayOfInterval({ start, end });
    }, [selectedDate]);

    // Count reservations for a specific date
    const getReservationCount = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return reservations.filter((r) => {
            const resDate = typeof r.reservationDate === 'string' 
                ? r.reservationDate.split('T')[0]
                : format(new Date(r.reservationDate), 'yyyy-MM-dd');
            return resDate === dateStr;
        }).length;
    };

    // Navigate functions
    const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
    const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));
    const handlePrevWeek = () => setSelectedDate(subWeeks(selectedDate, 1));
    const handleNextWeek = () => setSelectedDate(addWeeks(selectedDate, 1));
    const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
    const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
    const handleToday = () => setSelectedDate(new Date());

    return (
        <div className="space-y-4">
            {/* View Type Tabs */}
            <Tabs 
                value={viewType} 
                onValueChange={(value) => setViewType(value as CalendarViewType)}
            >
                <TabsList>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>

                {/* Month View */}
                <TabsContent value="month" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            {format(selectedDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleToday}>
                                Today
                            </Button>
                            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <Card className="p-4">
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-center font-semibold text-sm h-10 flex items-center justify-center">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {monthDays.map((day) => {
                                const isCurrentMonth = isSameMonth(day, selectedDate);
                                const isSelected = isSameDay(day, selectedDate);
                                const count = getReservationCount(day);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => {
                                            setSelectedDate(day);
                                            onDateSelect?.(day);
                                        }}
                                        className={`
                                            h-20 p-2 rounded-lg border-2 transition-all
                                            flex flex-col items-start justify-start
                                            ${isSelected 
                                                ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                                                : isCurrentMonth
                                                ? 'border-border hover:border-primary/50 hover:bg-accent/50'
                                                : 'border-border/50 bg-muted/30 dark:bg-muted/10 text-muted-foreground'
                                            }
                                        `}
                                    >
                                        <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-muted-foreground' : ''}`}>
                                            {format(day, 'd')}
                                        </span>
                                        {count > 0 && (
                                            <span className="text-xs font-semibold text-primary mt-1">
                                                {count} {count === 1 ? 'reservation' : 'reservations'}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>
                </TabsContent>

                {/* Week View */}
                <TabsContent value="week" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Week of {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleToday}>
                                Today
                            </Button>
                            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNextWeek}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Card className="p-4">
                        <div className="grid grid-cols-7 gap-2">
                            {weekDays.map((day) => {
                                const isSelected = isSameDay(day, selectedDate);
                                const count = getReservationCount(day);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => {
                                            setSelectedDate(day);
                                            onDateSelect?.(day);
                                        }}
                                        className={`
                                            p-4 rounded-lg border-2 transition-all
                                            flex flex-col items-center justify-center gap-2
                                            ${isSelected 
                                                ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                                                : 'border-border hover:border-primary/50 hover:bg-accent/50'
                                            }
                                        `}
                                    >
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {format(day, 'EEE')}
                                        </span>
                                        <span className="text-lg font-semibold">
                                            {format(day, 'd')}
                                        </span>
                                        {count > 0 && (
                                            <span className="text-xs text-primary font-semibold">
                                                {count} res.
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>
                </TabsContent>

                {/* Day View */}
                <TabsContent value="day" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </h2>
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

                    <Card className="p-4">
                        {reservationsForDate.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No reservations for this date
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reservationsForDate.map((reservation) => (
                                    <div
                                        key={reservation.reservationId}
                                        onClick={() => onReservationClick?.(reservation)}
                                    >
                                        <ReservationCard
                                            reservation={reservation}
                                            compact={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Reservations for selected date (always visible) */}
            {viewType !== 'day' && (
                <div className="space-y-3">
                    <h3 className="font-semibold">
                        Reservations - {format(selectedDate, 'MMM d, yyyy')}
                    </h3>
                    {reservationsForDate.length === 0 ? (
                        <Card className="p-4 text-center text-muted-foreground">
                            No reservations for this date
                        </Card>
                    ) : (
                        <div className="grid gap-3">
                            {reservationsForDate.map((reservation) => (
                                <div
                                    key={reservation.reservationId}
                                    onClick={() => onReservationClick?.(reservation)}
                                >
                                    <ReservationCard
                                        reservation={reservation}
                                        compact={true}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
