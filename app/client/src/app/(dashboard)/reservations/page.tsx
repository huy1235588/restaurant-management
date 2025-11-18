'use client';

import React, { useState, useEffect } from 'react';
import { useReservationStore, ViewMode } from '@/stores/reservationStore';
import { Reservation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar,
    List,
    LayoutGrid,
    Plus,
    Filter,
    RefreshCw,
} from 'lucide-react';
import { 
    ReservationListView,
    ReservationFormDialog,
    ReservationDetailsDialog,
    ReservationCalendarView,
    ReservationTimelineView
} from '@/features/reservations/components';
import { format } from 'date-fns';

export default function ReservationsPage() {
    const {
        viewMode,
        setViewMode,
        selectedDate,
        setSelectedDate,
        fetchReservations,
        isLoading,
    } = useReservationStore();

    const [showNewDialog, setShowNewDialog] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    useEffect(() => {
        // Fetch initial reservations for selected date
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        fetchReservations({ date: dateStr });
    }, [selectedDate]);

    const handleReservationClick = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setShowDetailsDialog(true);
    };

    const handleEditClick = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setShowEditDialog(true);
    };

    const handleRefresh = () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        fetchReservations({ date: dateStr });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
                    <p className="text-muted-foreground">
                        Manage restaurant reservations and table bookings
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>

                    <Button onClick={() => setShowNewDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Reservation
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Today's Total
                            </p>
                            <p className="text-2xl font-bold">24</p>
                        </div>
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Confirmed
                            </p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">18</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="text-lg text-green-700 dark:text-green-400">✓</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Pending
                            </p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">6</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <span className="text-lg">⏳</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Special
                            </p>
                            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">2</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                            <span className="text-lg">🎂</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* View Tabs */}
            <Tabs 
                value={viewMode} 
                onValueChange={(value) => setViewMode(value as ViewMode)}
                className="space-y-4"
            >
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="calendar" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Calendar</span>
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            <span className="hidden sm:inline">Timeline</span>
                        </TabsTrigger>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            <span className="hidden sm:inline">List</span>
                        </TabsTrigger>
                    </TabsList>

                    <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>

                <TabsContent value="calendar" className="space-y-4">
                    <ReservationCalendarView
                        onReservationClick={handleReservationClick}
                        onDateSelect={setSelectedDate}
                    />
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                    <ReservationTimelineView
                        onReservationClick={handleReservationClick}
                    />
                </TabsContent>

                <TabsContent value="list" className="space-y-4">
                    <ReservationListView
                        onReservationClick={handleReservationClick}
                        onEditClick={handleEditClick}
                    />
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <ReservationFormDialog 
                open={showNewDialog} 
                onOpenChange={setShowNewDialog}
                onSuccess={handleRefresh}
            />
            
            <ReservationDetailsDialog 
                reservation={selectedReservation} 
                open={showDetailsDialog} 
                onOpenChange={setShowDetailsDialog}
                onEdit={() => {
                    setShowDetailsDialog(false);
                    setShowEditDialog(true);
                }}
            />
            
            <ReservationFormDialog 
                reservation={selectedReservation} 
                open={showEditDialog} 
                onOpenChange={setShowEditDialog}
                onSuccess={handleRefresh}
            />
        </div>
    );
}
