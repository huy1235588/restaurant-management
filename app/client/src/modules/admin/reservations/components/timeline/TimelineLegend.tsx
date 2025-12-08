'use client';

import { RESERVATION_STATUS_LABELS } from '../../constants';
import { TIMELINE_STATUS_BG_COLORS } from './timeline.constants';
import { ReservationStatus } from '../../types';

/**
 * TimelineLegend - Status color legend for the timeline
 */
export function TimelineLegend() {
    const statuses: ReservationStatus[] = [
        'pending',
        'confirmed',
        'seated',
        'completed',
        'cancelled',
        'no_show',
    ];

    return (
        <div className="flex flex-wrap items-center gap-4 text-sm">
            {statuses.map((status) => (
                <div key={status} className="flex items-center gap-1.5">
                    <div
                        className={`w-3 h-3 rounded-full ${TIMELINE_STATUS_BG_COLORS[status]}`}
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                        {RESERVATION_STATUS_LABELS[status]}
                    </span>
                </div>
            ))}
        </div>
    );
}
