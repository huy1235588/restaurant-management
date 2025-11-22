'use client';

import { useParams } from 'next/navigation';
import { useReservation } from '@/modules/reservations/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReservationStatusBadge } from '@/modules/reservations/components';
import {
    useConfirmReservation,
    useSeatCustomer,
    useMarkNoShow,
    useCancelReservation,
} from '@/modules/reservations/hooks';
import { formatDate, formatTime, formatDateTime } from '@/modules/reservations/utils';
import { ReservationStatus } from '@/modules/reservations/types';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    Phone,
    Mail,
    CheckCircle,
    UserCheck,
    UserX,
    XCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function ReservationDetailsPage() {
    const params = useParams();
    const reservationId = Number(params.id);

    const { data: reservation, isLoading } = useReservation(reservationId);
    const { mutate: confirm } = useConfirmReservation();
    const { mutate: seat } = useSeatCustomer();
    const { mutate: markNoShow } = useMarkNoShow();
    const { mutate: cancel } = useCancelReservation();

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-8">Loading reservation details...</div>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p>Reservation not found</p>
                        <Link href="/reservations">
                            <Button variant="outline" className="mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Reservations
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const canConfirm = reservation.status === ReservationStatus.PENDING;
    const canSeat = reservation.status === ReservationStatus.CONFIRMED;
    const canMarkNoShow = [ReservationStatus.PENDING, ReservationStatus.CONFIRMED].includes(
        reservation.status
    );
    const canCancel = ![
        ReservationStatus.COMPLETED,
        ReservationStatus.CANCELLED,
        ReservationStatus.NO_SHOW,
    ].includes(reservation.status);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/reservations">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Reservation Details</h1>
                </div>
                <ReservationStatusBadge status={reservation.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {reservation.customer.customerName}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>{reservation.customer.phoneNumber}</span>
                            </div>
                            {reservation.customer.email && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <span>{reservation.customer.email}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reservation Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Date:</span>
                                <span>{formatDate(reservation.reservationDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Time:</span>
                                <span>{formatTime(reservation.reservationTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Party Size:</span>
                                <span>{reservation.partySize} guests</span>
                            </div>
                            {reservation.table && (
                                <div>
                                    <span className="font-medium">Table:</span>
                                    <span className="ml-2">
                                        {reservation.table.tableNumber} (Capacity:{' '}
                                        {reservation.table.capacity})
                                    </span>
                                </div>
                            )}
                            {reservation.specialRequest && (
                                <div>
                                    <span className="font-medium">Special Requests:</span>
                                    <p className="mt-1 text-muted-foreground">
                                        {reservation.specialRequest}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {canConfirm && (
                                <Button
                                    className="w-full"
                                    onClick={() => confirm(reservationId)}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Confirm Reservation
                                </Button>
                            )}
                            {canSeat && (
                                <Button
                                    className="w-full"
                                    onClick={() => seat(reservationId)}
                                >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Seat Customer
                                </Button>
                            )}
                            {canMarkNoShow && (
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => markNoShow(reservationId)}
                                >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Mark No-Show
                                </Button>
                            )}
                            {canCancel && (
                                <Button
                                    className="w-full"
                                    variant="destructive"
                                    onClick={() => cancel(reservationId)}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Reservation
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Created:</span>
                                <p className="font-medium">
                                    {formatDateTime(reservation.createdAt)}
                                </p>
                            </div>
                            {reservation.updatedAt !== reservation.createdAt && (
                                <div>
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <p className="font-medium">
                                        {formatDateTime(reservation.updatedAt)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
