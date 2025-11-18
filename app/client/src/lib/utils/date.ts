import { format, parse } from 'date-fns';

/**
 * Utility functions for handling date and time formatting
 * Handles both legacy ISO timestamp format and new separated date/time format
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
 * @param dateString - Date in "YYYY-MM-DD" format
 * @param timeString - Time in "HH:mm:ss" or "HH:mm" format
 */
export function combineDateAndTime(dateString: string, timeString: string): Date {
    const date = parseReservationDate(dateString);
    const time = parseReservationTime(timeString);
    const [hours, minutes, seconds = '0'] = time.split(':');
    
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(parseInt(seconds, 10));
    
    return date;
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
 * @param timestamp - ISO timestamp string
 */
export function formatTimestamp(timestamp?: string | null, formatString: string = 'MMM dd, yyyy • hh:mm a'): string {
    if (!timestamp) return 'N/A';
    
    try {
        return format(new Date(timestamp), formatString);
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
