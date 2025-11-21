import { Reservation } from '../types';
import { StatusBadge } from './StatusBadge';
import {
    formatReservationDateTime,
    formatDuration,
    formatPhoneNumber,
    isUpcoming,
} from '../utils';
import { Calendar, Clock, Users, Phone, MapPin } from 'lucide-react';

interface ReservationCardProps {
    reservation: Reservation;
    onClick?: () => void;
    showActions?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    onCheckIn?: () => void;
}

export function ReservationCard({
    reservation,
    onClick,
    showActions = false,
    onConfirm,
    onCancel,
    onCheckIn,
}: ReservationCardProps) {
    const upcoming = isUpcoming(reservation.reservationDate);

    return (
        <div
            className={`bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${upcoming ? 'border-l-4 border-l-blue-500' : ''
                }`}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">
                            {reservation.reservationCode}
                        </span>
                        <StatusBadge status={reservation.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {reservation.customer?.name}
                    </p>
                </div>
                {upcoming && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Upcoming
                    </span>
                )}
            </div>

            {/* Details */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatReservationDateTime(reservation.reservationDate, reservation.reservationTime)}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(reservation.duration)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{reservation.partySize} guests</span>
                    </div>
                </div>

                {reservation.table && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>Table {reservation.table.tableNumber}</span>
                    </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{formatPhoneNumber(reservation.customer?.phoneNumber || '')}</span>
                </div>

                {reservation.specialRequest && (
                    <p className="text-sm text-gray-500 italic">
                        &quot;{reservation.specialRequest}&quot;
                    </p>
                )}
            </div>

            {/* Actions */}
            {showActions && (
                <div className="mt-4 flex gap-2">
                    {reservation.status === 'pending' && onConfirm && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onConfirm();
                            }}
                            className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                        >
                            Confirm
                        </button>
                    )}
                    {reservation.status === 'confirmed' && onCheckIn && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCheckIn();
                            }}
                            className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                        >
                            Check In
                        </button>
                    )}
                    {['pending', 'confirmed'].includes(reservation.status) && onCancel && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancel();
                            }}
                            className="flex-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
