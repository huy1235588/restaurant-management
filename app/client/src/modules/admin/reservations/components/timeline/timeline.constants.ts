/**
 * Timeline Constants
 * Configuration for Gantt Timeline display
 */

import { ReservationStatus } from '../../types';

/**
 * Timeline display configuration
 */
export const TIMELINE_CONFIG = {
    /** Restaurant opening hour (24h format) */
    startHour: 9,
    /** Restaurant closing hour (24h format) - last reservation slot */
    endHour: 23,
    /** Pixels per hour on the timeline */
    hourWidth: 120,
    /** Height of each table row in pixels */
    rowHeight: 60,
    /** Minimum width of reservation bar in pixels */
    minBarWidth: 30,
    /** Width of table column on the left */
    tableColumnWidth: 100,
    /** Height of timeline header */
    headerHeight: 48,
} as const;

/**
 * Status colors for reservation bars (solid colors for timeline)
 */
export const TIMELINE_STATUS_COLORS: Record<ReservationStatus, string> = {
    pending: '#fbbf24',     // Yellow/Amber
    confirmed: '#22c55e',   // Green
    seated: '#3b82f6',      // Blue
    completed: '#6b7280',   // Gray
    cancelled: '#ef4444',   // Red
    no_show: '#f97316',     // Orange
};

/**
 * Status background colors (with transparency for bars)
 */
export const TIMELINE_STATUS_BG_COLORS: Record<ReservationStatus, string> = {
    pending: 'bg-amber-400',
    confirmed: 'bg-green-500',
    seated: 'bg-blue-500',
    completed: 'bg-gray-400',
    cancelled: 'bg-red-500',
    no_show: 'bg-orange-500',
};

/**
 * Status hover colors for bars
 */
export const TIMELINE_STATUS_HOVER_COLORS: Record<ReservationStatus, string> = {
    pending: 'hover:bg-amber-500',
    confirmed: 'hover:bg-green-600',
    seated: 'hover:bg-blue-600',
    completed: 'hover:bg-gray-500',
    cancelled: 'hover:bg-red-600',
    no_show: 'hover:bg-orange-600',
};

/**
 * View modes for reservation page
 */
export type ViewMode = 'list' | 'timeline';

/**
 * Default view mode
 */
export const DEFAULT_VIEW_MODE: ViewMode = 'list';

/**
 * LocalStorage key for view preference
 */
export const VIEW_PREFERENCE_KEY = 'reservation-view-mode';

/**
 * Calculate total timeline width
 */
export function getTimelineWidth(): number {
    const hours = TIMELINE_CONFIG.endHour - TIMELINE_CONFIG.startHour;
    return TIMELINE_CONFIG.tableColumnWidth + hours * TIMELINE_CONFIG.hourWidth;
}

/**
 * Generate hour labels for timeline header
 */
export function getHourLabels(): string[] {
    const labels: string[] = [];
    for (let hour = TIMELINE_CONFIG.startHour; hour <= TIMELINE_CONFIG.endHour; hour++) {
        labels.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return labels;
}
