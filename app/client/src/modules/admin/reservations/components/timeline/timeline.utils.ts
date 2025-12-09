/**
 * Timeline Utility Functions
 * Time calculations and positioning for Gantt Timeline
 */

import { TIMELINE_CONFIG } from './timeline.constants';
import { Reservation } from '../../types';

/**
 * Convert time string to minutes from midnight
 * @param timeStr - Time in format "HH:mm:ss" or "HH:mm" or ISO timestamp "YYYY-MM-DDTHH:mm:ss.sssZ"
 * 
 * IMPORTANT: For ISO timestamps, we extract HH:mm directly from the string
 * to avoid timezone conversion issues. The server sends "1970-01-01T16:00:00.000Z"
 * where the actual time is in the HH:mm part, not subject to Date() parsing.
 */
export function timeToMinutes(timeStr: string): number {
    // Handle ISO timestamp format - extract HH:mm directly from string
    // This avoids timezone conversion that happens with new Date().getHours()
    if (timeStr.includes('T')) {
        const timeMatch = timeStr.match(/T(\d{2}):(\d{2})/);
        if (timeMatch) {
            const hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            return hours * 60 + minutes;
        }
    }
    
    // Handle HH:mm:ss or HH:mm format
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to time string
 * @param minutes - Total minutes from midnight
 */
export function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate left position for a reservation bar
 * @param startTime - Reservation start time string
 */
export function getBarLeft(startTime: string): number {
    const startMinutes = timeToMinutes(startTime);
    const timelineStartMinutes = TIMELINE_CONFIG.startHour * 60;
    const offsetMinutes = startMinutes - timelineStartMinutes;
    
    // Convert minutes to pixels
    return (offsetMinutes / 60) * TIMELINE_CONFIG.hourWidth;
}

/**
 * Calculate width for a reservation bar
 * @param duration - Duration in minutes
 */
export function getBarWidth(duration: number): number {
    const width = (duration / 60) * TIMELINE_CONFIG.hourWidth;
    return Math.max(width, TIMELINE_CONFIG.minBarWidth);
}

/**
 * Get bar position and width for a reservation
 */
export function getBarStyle(reservation: Reservation): { left: number; width: number } {
    const left = getBarLeft(reservation.reservationTime);
    const width = getBarWidth(reservation.duration);
    
    return { left, width };
}

/**
 * Calculate current time position on the timeline
 * Returns null if current time is outside business hours
 */
export function getCurrentTimePosition(): number | null {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = TIMELINE_CONFIG.startHour * 60;
    const endMinutes = TIMELINE_CONFIG.endHour * 60;
    
    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
        return null;
    }
    
    const offsetMinutes = currentMinutes - startMinutes;
    return (offsetMinutes / 60) * TIMELINE_CONFIG.hourWidth;
}

/**
 * Check if a date is today
 */
export function isToday(dateStr: string): boolean {
    const date = new Date(dateStr);
    const today = new Date();
    
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Get date string in YYYY-MM-DD format
 */
export function toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Calculate end time from start time and duration
 */
export function calculateEndTime(startTime: string, duration: number): string {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration;
    return minutesToTime(endMinutes);
}

/**
 * Get time slot from click position
 * @param clickX - X position relative to timeline grid
 * @returns Time string in HH:mm format
 */
export function getTimeFromPosition(clickX: number): string {
    const minutesFromStart = (clickX / TIMELINE_CONFIG.hourWidth) * 60;
    const totalMinutes = TIMELINE_CONFIG.startHour * 60 + minutesFromStart;
    
    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(totalMinutes / 15) * 15;
    
    return minutesToTime(roundedMinutes);
}

/**
 * Group reservations by table
 * @param reservations - List of reservations
 * @returns Map of tableId to reservations
 */
export function groupReservationsByTable(
    reservations: Reservation[]
): Map<number, Reservation[]> {
    const grouped = new Map<number, Reservation[]>();
    
    for (const reservation of reservations) {
        const tableId = reservation.tableId;
        if (!grouped.has(tableId)) {
            grouped.set(tableId, []);
        }
        grouped.get(tableId)!.push(reservation);
    }
    
    return grouped;
}

/**
 * Check if two reservations overlap
 */
export function checkOverlap(res1: Reservation, res2: Reservation): boolean {
    if (res1.tableId !== res2.tableId) return false;
    
    const start1 = timeToMinutes(res1.reservationTime);
    const end1 = start1 + res1.duration;
    const start2 = timeToMinutes(res2.reservationTime);
    const end2 = start2 + res2.duration;
    
    return start1 < end2 && start2 < end1;
}

/**
 * Calculate track (row) positions for reservations to prevent overlap
 * Returns a map of reservation ID to track number (0-based)
 */
export function calculateReservationTracks(reservations: Reservation[]): Map<number, number> {
    const tracks = new Map<number, number>();
    
    // Sort by start time
    const sorted = [...reservations].sort((a, b) => {
        return timeToMinutes(a.reservationTime) - timeToMinutes(b.reservationTime);
    });
    
    for (const reservation of sorted) {
        // Find the first available track (row)
        let track = 0;
        let foundTrack = false;
        
        while (!foundTrack) {
            // Check if this track has any overlapping reservations
            let hasOverlap = false;
            
            for (const [otherId, otherTrack] of tracks.entries()) {
                if (otherTrack === track) {
                    const other = sorted.find(r => r.reservationId === otherId);
                    if (other && checkOverlap(reservation, other)) {
                        hasOverlap = true;
                        break;
                    }
                }
            }
            
            if (!hasOverlap) {
                tracks.set(reservation.reservationId, track);
                foundTrack = true;
            } else {
                track++;
            }
        }
    }
    
    return tracks;
}
