'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Reservation } from '../types';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import { formatDate, formatTime } from '../utils';
import { Calendar, Clock, Users, Phone, Mail } from 'lucide-react';

interface ReservationCardProps {
    reservation: Reservation;
    onClick?: () => void;
}

export function ReservationCard({ reservation, onClick }: ReservationCardProps) {
    return (
        <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">
                            {reservation.customerName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{reservation.phoneNumber}</span>
                        </div>
                        {reservation.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span>{reservation.email}</span>
                            </div>
                        )}
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
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        Note: {reservation.specialRequest}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
