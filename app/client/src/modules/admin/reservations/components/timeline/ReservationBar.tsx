'use client';

import { useState } from 'react';
import { Reservation } from '../../types';
import {
    TIMELINE_STATUS_BG_COLORS,
    TIMELINE_STATUS_HOVER_COLORS,
} from './timeline.constants';
import { getBarStyle, calculateEndTime } from './timeline.utils';
import { TimelineTooltip } from './TimelineTooltip';

interface ReservationBarProps {
    reservation: Reservation;
    onClick?: (reservation: Reservation) => void;
}

/**
 * ReservationBar - Individual reservation bar component
 */
export function ReservationBar({ reservation, onClick }: ReservationBarProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const { left, width } = getBarStyle(reservation);

    const bgColor = TIMELINE_STATUS_BG_COLORS[reservation.status];
    const hoverColor = TIMELINE_STATUS_HOVER_COLORS[reservation.status];

    // Format display time
    const startTime = reservation.reservationTime.includes('T')
        ? new Date(reservation.reservationTime).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : reservation.reservationTime.substring(0, 5);

    // Truncate name if bar is too small
    const displayName =
        width < 80
            ? reservation.customerName.substring(0, 3) + '...'
            : width < 120
            ? reservation.customerName.substring(0, 8) + '...'
            : reservation.customerName;

    const handleClick = () => {
        if (onClick) {
            onClick(reservation);
        }
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <button
                onClick={handleClick}
                className={`
                    absolute top-2 rounded-md shadow-sm
                    flex items-center gap-1 px-2 text-white text-xs font-medium
                    cursor-pointer transition-all duration-200
                    ${bgColor} ${hoverColor}
                    hover:shadow-md hover:scale-[1.02] hover:z-10
                    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                `}
                style={{
                    left,
                    width: Math.max(width - 4, 26),
                    height: 44,
                }}
                title={`${reservation.customerName} - ${reservation.partySize}P - ${startTime}`}
            >
                {width >= 50 && (
                    <>
                        <span className="truncate">{displayName}</span>
                        {width >= 100 && (
                            <span className="opacity-80 shrink-0">
                                {reservation.partySize}P
                            </span>
                        )}
                    </>
                )}
            </button>

            {/* Tooltip */}
            {showTooltip && (
                <div
                    className="absolute z-50"
                    style={{
                        left: left + width / 2,
                        top: -8,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <TimelineTooltip reservation={reservation} />
                </div>
            )}
        </div>
    );
}
