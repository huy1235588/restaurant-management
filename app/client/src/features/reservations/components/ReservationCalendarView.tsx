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
    Users,
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
import { formatReservationDate } from '@/lib/utils/date';
import { ReservationCard } from './ReservationCard';
import { Badge } from '@/components/ui/badge';

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
            const resDate = formatReservationDate(r.reservationDate);
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
            const resDate = formatReservationDate(r.reservationDate);
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
                <TabsContent value="month" className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {format(selectedDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleToday} className="font-medium">
                                Today
                            </Button>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" onClick={handlePrevMonth} className="hover:bg-primary/10">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleNextMonth} className="hover:bg-primary/10">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <Card className="p-6 shadow-lg border-2">
                        <div className="grid grid-cols-7 gap-3 mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-center font-bold text-sm h-10 flex items-center justify-center text-primary">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-3">
                            {monthDays.map((day) => {
                                const isCurrentMonth = isSameMonth(day, selectedDate);
                                const isSelected = isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, new Date());
                                const count = getReservationCount(day);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => {
                                            setSelectedDate(day);
                                            onDateSelect?.(day);
                                        }}
                                        className={`
                                            h-24 p-3 rounded-xl border-2 transition-all duration-200
                                            flex flex-col items-start justify-between
                                            hover:shadow-md hover:scale-105
                                            ${isSelected
                                                ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 shadow-lg'
                                                : isToday
                                                    ? 'border-primary/50 bg-primary/5 dark:bg-primary/5'
                                                    : isCurrentMonth
                                                        ? 'border-border hover:border-primary/50 bg-background'
                                                        : 'border-border/30 bg-muted/20 dark:bg-muted/5 text-muted-foreground'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className={`text-sm font-semibold ${isSelected || isToday ? 'flex items-center justify-center h-7 w-7 rounded-full bg-blue-500 text-white' :
                                                !isCurrentMonth ? 'text-muted-foreground' : ''
                                                }`}>
                                                {format(day, 'd')}
                                            </span>

                                            {count > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="h-5 min-w-5 px-1.5 text-xs font-bold bg-primary/20 text-primary border-primary/30"
                                                >
                                                    {count}
                                                </Badge>
                                            )}
                                        </div>

                                        {count > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
                                                <Users className="h-3 w-3" />
                                                <span className="font-medium">
                                                    {reservations.filter(r => {
                                                        const resDate = typeof r.reservationDate === 'string'
                                                            ? r.reservationDate.split('T')[0]
                                                            : format(new Date(r.reservationDate), 'yyyy-MM-dd');
                                                        return resDate === format(day, 'yyyy-MM-dd');
                                                    }).reduce((sum, r) => sum + r.headCount, 0)}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>
                </TabsContent>

                {/* Week View */}
                <TabsContent value="week" className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Week of {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleToday} className="font-medium">
                                Today
                            </Button>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" onClick={handlePrevWeek} className="hover:bg-primary/10">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleNextWeek} className="hover:bg-primary/10">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Card className="p-6 shadow-lg border-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                            {weekDays.map((day) => {
                                const isSelected = isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, new Date());
                                const count = getReservationCount(day);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => {
                                            setSelectedDate(day);
                                            onDateSelect?.(day);
                                        }}
                                        className={`
                                            p-6 rounded-xl border-2 transition-all duration-200
                                            flex flex-col items-center justify-center gap-3
                                            hover:shadow-lg hover:scale-105
                                            ${isSelected
                                                ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 shadow-lg'
                                                : isToday
                                                    ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                                                    : 'border-border hover:border-primary/50 bg-background'
                                            }
                                        `}
                                    >
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isSelected || isToday ? 'text-primary' : 'text-muted-foreground'
                                            }`}>
                                            {format(day, 'EEE')}
                                        </span>
                                        <span className={`text-2xl font-bold ${isToday ? 'flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white' : ''
                                            }`}>
                                            {format(day, 'd')}
                                        </span>

                                        {count > 0 ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <Badge className="bg-primary/20 text-primary border-primary/30 font-bold">
                                                    {count} res.
                                                </Badge>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Users className="h-3 w-3" />
                                                    <span>
                                                        {reservations.filter(r => {
                                                            const resDate = typeof r.reservationDate === 'string'
                                                                ? r.reservationDate.split('T')[0]
                                                                : format(new Date(r.reservationDate), 'yyyy-MM-dd');
                                                            return resDate === format(day, 'yyyy-MM-dd');
                                                        }).reduce((sum, r) => sum + r.headCount, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No bookings</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>
                </TabsContent>

                {/* Day View */}
                <TabsContent value="day" className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {reservationsForDate.length} reservation{reservationsForDate.length !== 1 ? 's' : ''} scheduled
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

                    <Card className="p-6 shadow-lg border-2">
                        {reservationsForDate.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-lg font-semibold text-muted-foreground">No reservations</p>
                                <p className="text-sm text-muted-foreground mt-1">No reservations scheduled for this date</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reservationsForDate.map((reservation) => (
                                    <div
                                        key={reservation.reservationId}
                                        onClick={() => onReservationClick?.(reservation)}
                                        className="transition-all duration-200 hover:scale-[1.01]"
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
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">
                            Reservations - {format(selectedDate, 'MMM d, yyyy')}
                        </h3>
                        <span className="text-sm font-medium text-muted-foreground">
                            {reservationsForDate.length} {reservationsForDate.length === 1 ? 'booking' : 'bookings'}
                        </span>
                    </div>
                    {reservationsForDate.length === 0 ? (
                        <Card className="p-8 text-center border-2 border-dashed">
                            <p className="text-muted-foreground">No reservations for this date</p>
                        </Card>
                    ) : (
                        <div className="grid gap-3">
                            {reservationsForDate.map((reservation) => (
                                <div
                                    key={reservation.reservationId}
                                    onClick={() => onReservationClick?.(reservation)}
                                    className="transition-all duration-200 hover:scale-[1.01]"
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
