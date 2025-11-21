import { Reservation } from '../types';
import { StatusBadge } from './StatusBadge';
import {
    formatReservationDateTime,
    formatDuration,
    formatPhoneNumber,
    isUpcoming,
} from '../utils';
import { Calendar, Clock, Users, Phone, MapPin, CheckCircle, XCircle, LogIn } from 'lucide-react';

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
            className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 overflow-hidden cursor-pointer ${
                upcoming ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-opacity-50' : ''
            }`}
            onClick={onClick}
        >
            {/* Accent Bar */}
            {upcoming && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500" />
            )}

            <div className="p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                {reservation.reservationCode}
                            </span>
                            {upcoming && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 px-2.5 py-1 rounded-full">
                                    <Clock className="w-3 h-3" />
                                    Upcoming
                                </span>
                            )}
                        </div>
                        <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                            {reservation.customer?.name}
                        </p>
                    </div>
                    <StatusBadge status={reservation.status} />
                </div>

                {/* Details Grid */}
                <div className="space-y-3 mb-4">
                    {/* Date & Time */}
                    <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">
                            {formatReservationDateTime(reservation.reservationDate, reservation.reservationTime)}
                        </span>
                    </div>

                    {/* Duration & Party Size */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center justify-center w-8 h-8 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="font-medium">{formatDuration(reservation.duration)}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-50 dark:bg-green-950 rounded-lg">
                                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="font-medium">{reservation.partySize} guests</span>
                        </div>
                    </div>

                    {/* Table */}
                    {reservation.table && (
                        <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center justify-center w-8 h-8 bg-orange-50 dark:bg-orange-950 rounded-lg">
                                <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="font-medium">Table {reservation.table.tableNumber}</span>
                        </div>
                    )}

                    {/* Phone */}
                    <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                            <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-medium">
                            {formatPhoneNumber(reservation.customer?.phoneNumber || '')}
                        </span>
                    </div>
                </div>

                {/* Special Request */}
                {reservation.specialRequest && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                            &quot;{reservation.specialRequest}&quot;
                        </p>
                    </div>
                )}

                {/* Actions */}
                {showActions && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                        {reservation.status === 'pending' && onConfirm && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onConfirm();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Confirm
                            </button>
                        )}
                        {reservation.status === 'confirmed' && onCheckIn && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCheckIn();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 rounded-lg hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <LogIn className="w-4 h-4" />
                                Check In
                            </button>
                        )}
                        {['pending', 'confirmed'].includes(reservation.status) && onCancel && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCancel();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-all duration-200 border border-red-200 dark:border-red-800"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 dark:group-hover:from-blue-400/10 dark:group-hover:to-purple-400/10 transition-all duration-300 pointer-events-none rounded-xl" />
        </div>
    );
}