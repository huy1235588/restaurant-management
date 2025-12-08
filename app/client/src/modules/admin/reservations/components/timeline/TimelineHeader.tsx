'use client';

import { TIMELINE_CONFIG, getHourLabels } from './timeline.constants';

interface TimelineHeaderProps {
    scrollLeft?: number;
}

/**
 * TimelineHeader - Time axis header with hour markers
 */
export function TimelineHeader({ scrollLeft = 0 }: TimelineHeaderProps) {
    const hourLabels = getHourLabels();
    const { hourWidth, tableColumnWidth, headerHeight } = TIMELINE_CONFIG;

    return (
        <div
            className="sticky top-0 z-20 flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
            style={{ height: headerHeight }}
        >
            {/* Table column header */}
            <div
                className="sticky left-0 z-30 flex items-center justify-center bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 font-semibold text-sm text-gray-700 dark:text-gray-300"
                style={{ 
                    width: tableColumnWidth, 
                    minWidth: tableColumnWidth,
                }}
            >
                Bàn
            </div>

            {/* Hour labels */}
            <div className="flex">
                {hourLabels.map((label, index) => (
                    <div
                        key={label}
                        className="flex items-center justify-center border-r border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400"
                        style={{ 
                            width: hourWidth,
                            minWidth: hourWidth,
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
}
