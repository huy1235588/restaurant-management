'use client';

import React, { useEffect, useState } from 'react';
import { useReservationStore } from '@/stores/reservationStore';
import { Reservation, ReservationStatus } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Phone,
    Users,
    MapPin,
    MoreVertical,
    Eye,
    Edit,
    XCircle,
    CheckCircle,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ReservationListViewProps {
    onReservationClick?: (reservation: Reservation) => void;
    onEditClick?: (reservation: Reservation) => void;
}

export function ReservationListView({
    onReservationClick,
    onEditClick,
}: ReservationListViewProps) {
    const {
        reservations,
        isLoading,
        filters,
        pagination,
        fetchReservations,
        setFilters,
        setPage,
        cancelReservation,
        confirmReservation,
        markAsSeated,
    } = useReservationStore();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');

    useEffect(() => {
        fetchReservations();
    }, [filters, pagination.page]);

    const handleSearch = () => {
        setFilters({ search: searchQuery });
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value as ReservationStatus | 'all');
        if (value === 'all') {
            setFilters({ status: undefined });
        } else {
            setFilters({ status: [value as ReservationStatus] });
        }
    };

    const handleAction = async (action: string, reservation: Reservation) => {
        switch (action) {
            case 'view':
                onReservationClick?.(reservation);
                break;
            case 'edit':
                onEditClick?.(reservation);
                break;
            case 'confirm':
                await confirmReservation(reservation.reservationId);
                break;
            case 'seat':
                await markAsSeated(reservation.reservationId);
                break;
            case 'cancel':
                if (confirm('Are you sure you want to cancel this reservation?')) {
                    await cancelReservation(reservation.reservationId);
                }
                break;
        }
    };

    const formatTime = (time: string) => {
        return time; // Already in HH:mm format
    };

    const formatDate = (date: string) => {
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return date;
        }
    };

    if (isLoading && reservations.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 dark:bg-muted/10 rounded-lg border-2 border-border/50">
                <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, phone, or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10 h-11 bg-background border-2 font-medium"
                        />
                    </div>
                    <Button onClick={handleSearch} size="lg" className="font-semibold">Search</Button>
                </div>

                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11 bg-background border-2 font-medium">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="seated">Seated</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Reservations Table */}
            <div className="rounded-xl border-2 shadow-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 dark:bg-muted/20 border-b-2">
                            <TableHead className="font-bold text-sm">Date & Time</TableHead>
                            <TableHead className="font-bold text-sm">Customer</TableHead>
                            <TableHead className="font-bold text-sm">Contact</TableHead>
                            <TableHead className="text-center font-bold text-sm">Party Size</TableHead>
                            <TableHead className="font-bold text-sm">Table</TableHead>
                            <TableHead className="font-bold text-sm">Status</TableHead>
                            <TableHead className="text-right font-bold text-sm">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reservations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                    No reservations found
                                </TableCell>
                            </TableRow>
                        ) : (
                            reservations.map((reservation) => (
                                <TableRow 
                                    key={reservation.reservationId}
                                    className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors"
                                    onClick={() => onReservationClick?.(reservation)}
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {formatDate(reservation.reservationDate)}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {formatTime(reservation.reservationTime)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {reservation.customer?.isVip && (
                                                <span className="text-yellow-500">⭐</span>
                                            )}
                                            <span className="font-medium">
                                                {reservation.customerName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            <span>{reservation.phoneNumber}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{reservation.headCount}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {reservation.table && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                <span>Table {reservation.table.tableNumber}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={reservation.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAction('view', reservation);
                                                    }}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAction('edit', reservation);
                                                    }}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {reservation.status === 'pending' && (
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAction('confirm', reservation);
                                                        }}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Confirm
                                                    </DropdownMenuItem>
                                                )}
                                                {reservation.status === 'confirmed' && (
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAction('seat', reservation);
                                                        }}
                                                    >
                                                        <Users className="mr-2 h-4 w-4" />
                                                        Mark as Seated
                                                    </DropdownMenuItem>
                                                )}
                                                {['pending', 'confirmed'].includes(reservation.status) && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAction('cancel', reservation);
                                                            }}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Cancel
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages >= 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} reservations
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === 1}
                            onClick={() => setPage(pagination.page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => setPage(pagination.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
