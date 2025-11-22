'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useReservations } from '../hooks';
import { ReservationStatusBadge } from '../components';
import { ReservationStatus, ReservationFilters } from '../types';
import { formatDate, formatTime } from '../utils';
import { Plus, Search, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export function ReservationListView() {
    const [filters, setFilters] = useState<ReservationFilters>({});
    const { data: reservations = [], isLoading } = useReservations(filters);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Reservations</h1>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Reservation
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter Reservations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer Name</label>
                            <Input
                                placeholder="Search by name..."
                                value={filters.customerName || ''}
                                onChange={(e) =>
                                    setFilters({ ...filters, customerName: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) =>
                                    setFilters({
                                        ...filters,
                                        status: value as ReservationStatus,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All statuses</SelectItem>
                                    <SelectItem value={ReservationStatus.PENDING}>Pending</SelectItem>
                                    <SelectItem value={ReservationStatus.CONFIRMED}>
                                        Confirmed
                                    </SelectItem>
                                    <SelectItem value={ReservationStatus.SEATED}>Seated</SelectItem>
                                    <SelectItem value={ReservationStatus.COMPLETED}>
                                        Completed
                                    </SelectItem>
                                    <SelectItem value={ReservationStatus.NO_SHOW}>No Show</SelectItem>
                                    <SelectItem value={ReservationStatus.CANCELLED}>
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">From Date</label>
                            <Input
                                type="date"
                                value={filters.fromDate || ''}
                                onChange={(e) =>
                                    setFilters({ ...filters, fromDate: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">To Date</label>
                            <Input
                                type="date"
                                value={filters.toDate || ''}
                                onChange={(e) =>
                                    setFilters({ ...filters, toDate: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="text-center py-8">Loading reservations...</div>
            ) : reservations.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No reservations found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reservations.map((reservation) => (
                        <Link
                            key={reservation.reservationId}
                            href={`/reservations/${reservation.reservationId}`}
                        >
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg">
                                                {reservation.customer.customerName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {reservation.customer.phoneNumber}
                                            </p>
                                        </div>
                                        <ReservationStatusBadge status={reservation.status} />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span>
                                            {formatDate(reservation.reservationDate)} at{' '}
                                            {formatTime(reservation.reservationTime)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span>{reservation.partySize} guests</span>
                                    </div>
                                    {reservation.table && (
                                        <div className="text-sm font-medium">
                                            Table: {reservation.table.tableNumber}
                                        </div>
                                    )}
                                    {reservation.specialRequest && (
                                        <p className="text-xs text-muted-foreground">
                                            Note: {reservation.specialRequest}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
