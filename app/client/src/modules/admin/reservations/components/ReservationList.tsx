import { Reservation } from '../types';
import { ReservationCard } from './ReservationCard';
import { Loader2, CalendarX, Filter } from 'lucide-react';

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
            <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
                    <div className="absolute inset-0 w-12 h-12 animate-ping text-blue-400 dark:text-blue-500 opacity-20">
                        <Loader2 className="w-12 h-12" />
                    </div>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Loading reservations...</p>
            </div>
        );
    }

    if (reservations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="relative mb-6">
                    <div className="w-20 h-20 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                        <CalendarX className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    No reservations found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                    Try adjusting your filters or create a new reservation to get started
                </p>

                <div className="mt-6 flex gap-3">
                    <button className="px-5 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                        Clear Filters
                    </button>
                    <button className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all shadow-sm hover:shadow-md">
                        New Reservation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between px-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Showing <span className="font-bold text-gray-900 dark:text-gray-100">{reservations.length}</span> reservation{reservations.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        </div>
    );
}