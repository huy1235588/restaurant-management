import { Reservation } from '../types';
import { ReservationCard } from './ReservationCard';
import { Loader2 } from 'lucide-react';

interface ReservationListProps {
    reservations: Reservation[];
    loading?: boolean;
    onReservationClick: (reservation: Reservation) => void;
    onConfirm?: (reservation: Reservation) => void;
    onCancel?: (reservation: Reservation) => void;
    onCheckIn?: (reservation: Reservation) => void;
    showActions?: boolean;
}

export function ReservationList({
    reservations,
    loading = false,
    onReservationClick,
    onConfirm,
    onCancel,
    onCheckIn,
    showActions = false,
}: ReservationListProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (reservations.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No reservations found</p>
                <p className="text-gray-400 text-sm mt-2">
                    Try adjusting your filters or create a new reservation
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservations.map((reservation) => (
                <ReservationCard
                    key={reservation.reservationId}
                    reservation={reservation}
                    onClick={() => onReservationClick(reservation)}
                    showActions={showActions}
                    onConfirm={onConfirm ? () => onConfirm(reservation) : undefined}
                    onCancel={onCancel ? () => onCancel(reservation) : undefined}
                    onCheckIn={onCheckIn ? () => onCheckIn(reservation) : undefined}
                />
            ))}
        </div>
    );
}
