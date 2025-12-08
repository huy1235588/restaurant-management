'use client';

import { Reservation } from '../../types';
import { calculateEndTime } from './timeline.utils';
import { RESERVATION_STATUS_LABELS } from '../../constants';
import { Clock, Users, Phone, MessageSquare } from 'lucide-react';

interface TimelineTooltipProps {
    reservation: Reservation;
}

/**
 * TimelineTooltip - Hover tooltip component showing reservation details
 */
export function TimelineTooltip({ reservation }: TimelineTooltipProps) {
    // Format time for display
    const startTime = reservation.reservationTime.includes('T')
        ? new Date(reservation.reservationTime).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : reservation.reservationTime.substring(0, 5);
    
    const endTime = calculateEndTime(startTime, reservation.duration);

    return (
        <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 min-w-[200px] max-w-[280px]">
            {/* Customer Name */}
            <div className="font-semibold text-sm mb-2">
                {reservation.customerName}
            </div>

            {/* Status */}
            <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/20 mb-2">
                {RESERVATION_STATUS_LABELS[reservation.status]}
            </div>

            {/* Details */}
            <div className="space-y-1.5">
                {/* Time */}
                <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                        {startTime} - {endTime} ({reservation.duration} phút)
                    </span>
                </div>

                {/* Party Size */}
                <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{reservation.partySize} người</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{reservation.phoneNumber}</span>
                </div>

                {/* Special Request */}
                {reservation.specialRequest && (
                    <div className="flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                        <span className="text-gray-300 line-clamp-2">
                            {reservation.specialRequest}
                        </span>
                    </div>
                )}
            </div>

            {/* Arrow */}
            <div className="absolute left-1/2 -bottom-1.5 transform -translate-x-1/2">
                <div className="w-3 h-3 bg-gray-900 rotate-45" />
            </div>
        </div>
    );
}
