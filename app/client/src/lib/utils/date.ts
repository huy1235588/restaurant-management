import { format, parse } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Application timezone - should match server timezone
 * Vietnam timezone (UTC+7)
 */
export const APP_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Utility functions for handling date and time formatting
 * Handles both legacy ISO timestamp format and new separated date/time format
 * 
 * IMPORTANT: All operations use APP_TIMEZONE (Asia/Ho_Chi_Minh) for consistency
 * with the backend server
 */

/**
 * Parse reservation date to Date object
 * Handles both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss.sssZ" formats
 */
export function parseReservationDate(dateString: string | Date): Date {
    if (!dateString) return new Date();
    
    // If it's already a Date object, return it
    if (dateString instanceof Date) return dateString;
    
    // If it's ISO format with time (legacy: "2025-11-16T00:00:00.000Z")
    if (dateString.includes('T')) {
        return new Date(dateString);
    }
    
    // If it's date-only format (new: "2025-11-16")
    // Parse as local date at midnight
    return parse(dateString, 'yyyy-MM-dd', new Date());
}

/**
 * Format reservation date to display string
 * @param dateString - Date string in any format
 * @param formatString - Output format (default: 'yyyy-MM-dd')
 */
export function formatReservationDate(dateString: string, formatString: string = 'yyyy-MM-dd'): string {
    try {
        const date = parseReservationDate(dateString);
        return format(date, formatString);
    } catch {
        return dateString;
    }
}

/**
 * Parse reservation time to time string (HH:mm:ss or HH:mm)
 * Handles both "HH:mm:ss" and "1970-01-01THH:mm:ss.sssZ" (legacy) formats
 */
export function parseReservationTime(timeString: string): string {
    if (!timeString) return '00:00:00';
    
    // If it's already in HH:mm:ss or HH:mm format (new format)
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
        return timeString;
    }
    
    // If it's ISO format with date (legacy: "1970-01-01T05:30:00.000Z")
    if (timeString.includes('T')) {
        try {
            const date = new Date(timeString);
            return format(date, 'HH:mm:ss');
        } catch {
            return timeString;
        }
    }
    
    return timeString;
}

/**
 * Format reservation time for display (HH:mm)
 * @param timeString - Time string in any format
 */
export function formatReservationTime(timeString: string): string {
    try {
        const parsed = parseReservationTime(timeString);
        // Convert HH:mm:ss to HH:mm for display
        return parsed.substring(0, 5);
    } catch {
        return timeString;
    }
}

/**
 * Convert date and time to full Date object
 * Interprets both date and time in local timezone
 * @param dateString - Date in "YYYY-MM-DD" format
 * @param timeString - Time in "HH:mm:ss" or "HH:mm" format
 */
export function combineDateAndTime(dateString: string, timeString: string): Date {
    // Extract date part if ISO format
    let datePart = dateString;
    if (dateString.includes('T')) {
        datePart = dateString.split('T')[0];
    }
    
    // Parse time
    const time = parseReservationTime(timeString);
    const [hours, minutes, seconds = '0'] = time.split(':');
    
    // Parse date parts
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Create date in local timezone
    // new Date(year, month-1, day, hours, minutes, seconds) creates in local timezone
    return new Date(
        year, 
        month - 1, 
        day, 
        parseInt(hours, 10), 
        parseInt(minutes, 10), 
        parseInt(seconds, 10)
    );
}

/**
 * Format a Date to timezone-aware display string
 * @param date - Date object
 * @param formatStr - Format string (date-fns format)
 */
export function formatWithTimezone(date: Date, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
    try {
        return formatInTimeZone(date, APP_TIMEZONE, formatStr);
    } catch {
        return format(date, formatStr);
    }
}

/**
 * Get current date in app timezone formatted as YYYY-MM-DD
 */
export function getTodayDate(): string {
    return formatInTimeZone(new Date(), APP_TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Get current time in app timezone formatted as HH:mm
 */
export function getCurrentTime(): string {
    return formatInTimeZone(new Date(), APP_TIMEZONE, 'HH:mm');
}

/**
 * Format birthday date
 * @param birthdayString - Birthday in "YYYY-MM-DD" or ISO format
 */
export function formatBirthday(birthdayString?: string | null, formatString: string = 'MMM dd, yyyy'): string {
    if (!birthdayString) return 'N/A';
    
    try {
        const date = parseReservationDate(birthdayString);
        return format(date, formatString);
    } catch {
        return birthdayString;
    }
}

/**
 * Format timestamp for display
 * Uses app timezone for consistent display
 * @param timestamp - ISO timestamp string
 * @param formatString - Format string (default: 'MMM dd, yyyy • hh:mm a')
 */
export function formatTimestamp(timestamp?: string | null, formatString: string = 'MMM dd, yyyy • hh:mm a'): string {
    if (!timestamp) return 'N/A';
    
    try {
        return formatInTimeZone(new Date(timestamp), APP_TIMEZONE, formatString);
    } catch {
        return timestamp;
    }
}

/**
 * Check if a date string is in the new format (YYYY-MM-DD without time)
 */
export function isNewDateFormat(dateString: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

/**
 * Check if a time string is in the new format (HH:mm:ss or HH:mm)
 */
export function isNewTimeFormat(timeString: string): boolean {
    return /^\d{2}:\d{2}(:\d{2})?$/.test(timeString);
}

/**
 * Check if a date/time is in the future
 * @param dateString - Date in YYYY-MM-DD format
 * @param timeString - Optional time in HH:mm format
 */
export function isFutureDateTime(dateString: string, timeString?: string): boolean {
    const now = new Date();
    let targetDate: Date;
    
    if (timeString) {
        targetDate = combineDateAndTime(dateString, timeString);
    } else {
        targetDate = parseReservationDate(dateString);
    }
    
    return targetDate > now;
}

/**
 * Check if a date is today
 * @param dateString - Date string in any format
 */
export function isToday(dateString: string | Date): boolean {
    const today = getTodayDate();
    
    if (dateString instanceof Date) {
        return formatInTimeZone(dateString, APP_TIMEZONE, 'yyyy-MM-dd') === today;
    }
    
    // Extract date part if it's ISO format
    const datePart = dateString.includes('T') 
        ? dateString.split('T')[0] 
        : dateString;
    
    return datePart === today;
}

/**
 * Calculate elapsed time in seconds from a timestamp
 * @param timestamp - ISO timestamp string
 */
export function getElapsedSeconds(timestamp: string): number {
    const created = new Date(timestamp);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / 1000);
}

/**
 * Calculate elapsed time in minutes from a timestamp
 * @param timestamp - ISO timestamp string
 */
export function getElapsedMinutes(timestamp: string): number {
    return Math.floor(getElapsedSeconds(timestamp) / 60);
}

/**
 * Format duration in human readable format
 * @param minutes - Duration in minutes
 */
export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins} min`;
    }
    if (mins === 0) {
        return `${hours} hr`;
    }
    return `${hours}h ${mins}m`;
}
