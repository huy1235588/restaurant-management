'use client';

import { useEffect, useState } from 'react';
import { TIMELINE_CONFIG, getHourLabels } from './timeline.constants';
import { getCurrentTimePosition, isToday } from './timeline.utils';

interface TimelineGridProps {
    tableCount: number;
    selectedDate: string;
}

/**
 * TimelineGrid - Background grid with current time marker
 */
export function TimelineGrid({ tableCount, selectedDate }: TimelineGridProps) {
    const [currentTimePos, setCurrentTimePos] = useState<number | null>(null);
    const hourLabels = getHourLabels();
    const { hourWidth, tableColumnWidth, rowHeight } = TIMELINE_CONFIG;

    // Update current time position every minute
    useEffect(() => {
        const updateTimePosition = () => {
            if (isToday(selectedDate)) {
                setCurrentTimePos(getCurrentTimePosition());
            } else {
                setCurrentTimePos(null);
            }
        };

        updateTimePosition();
        const interval = setInterval(updateTimePosition, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [selectedDate]);

    const gridHeight = tableCount * rowHeight;
    const gridWidth = hourLabels.length * hourWidth;

    return (
        <div
            className="absolute top-0 left-0 pointer-events-none"
            style={{
                marginLeft: tableColumnWidth,
                width: gridWidth,
                height: gridHeight,
            }}
        >
            {/* Vertical grid lines (hour separators) */}
            {hourLabels.map((_, index) => (
                <div
                    key={index}
                    className="absolute top-0 bottom-0 border-l border-gray-100 dark:border-gray-700"
                    style={{ left: index * hourWidth }}
                />
            ))}

            {/* Horizontal grid lines (row separators) */}
            {Array.from({ length: tableCount }).map((_, index) => (
                <div
                    key={index}
                    className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-700"
                    style={{ top: index * rowHeight }}
                />
            ))}

            {/* Current time marker */}
            {currentTimePos !== null && (
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: currentTimePos }}
                >
                    {/* Time indicator dot */}
                    <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </div>
            )}
        </div>
    );
}
