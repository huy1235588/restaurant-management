import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * DateTime Service
 * Centralized datetime handling with timezone awareness
 *
 * Key principles:
 * 1. Store all dates in UTC in the database
 * 2. Convert to local timezone only for display/business logic
 * 3. Accept dates from frontend in local timezone and convert to UTC
 */
@Injectable()
export class DateTimeService {
    private readonly logger = new Logger(DateTimeService.name);
    private readonly timezone: string;

    constructor(private readonly configService: ConfigService) {
        this.timezone =
            this.configService.get<string>('timezone') ||
            process.env['TZ'] ||
            'Asia/Ho_Chi_Minh';
        this.logger.log(
            `DateTimeService initialized with timezone: ${this.timezone}`,
        );
    }

    /**
     * Get current timezone
     */
    getTimezone(): string {
        return this.timezone;
    }

    /**
     * Get current time in UTC
     */
    nowUtc(): Date {
        return new Date();
    }

    /**
     * Get current time formatted as ISO string
     */
    nowIsoString(): string {
        return new Date().toISOString();
    }

    /**
     * Get the start of today in local timezone, returned as Date in UTC
     */
    startOfToday(): Date {
        const now = new Date();
        const localDateString = now.toLocaleDateString('en-CA', {
            timeZone: this.timezone,
        }); // Format: YYYY-MM-DD
        return this.parseLocalDate(localDateString);
    }

    /**
     * Get the end of today in local timezone (23:59:59.999), returned as Date in UTC
     */
    endOfToday(): Date {
        const endOfDay = this.startOfToday();
        endOfDay.setUTCHours(23, 59, 59, 999);
        // Adjust for timezone offset
        const offset = this.getTimezoneOffsetMinutes();
        endOfDay.setMinutes(endOfDay.getMinutes() - offset);
        return endOfDay;
    }

    /**
     * Parse a local date string (YYYY-MM-DD) to Date object
     * The date is interpreted in the configured timezone
     */
    parseLocalDate(dateString: string): Date {
        if (!dateString) {
            throw new Error('Date string is required');
        }

        // Validate format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            // If ISO format, parse directly
            if (dateString.includes('T')) {
                return new Date(dateString);
            }
            throw new Error(
                `Invalid date format: ${dateString}. Expected YYYY-MM-DD`,
            );
        }

        // Create date at midnight in local timezone
        const localDateTimeString = `${dateString}T00:00:00`;

        // Create a date object and adjust for timezone
        const date = new Date(localDateTimeString);

        // Get the timezone offset in minutes for the target date
        const offset = this.getTimezoneOffsetMinutes(date);

        // Adjust the date to represent UTC
        date.setMinutes(date.getMinutes() - offset);

        return date;
    }

    /**
     * Parse a local time string (HH:mm or HH:mm:ss) to a Date object
     * Returns a Date object with time set (date part is 1970-01-01)
     */
    parseLocalTime(timeString: string): Date {
        if (!timeString) {
            throw new Error('Time string is required');
        }

        // Validate format
        if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
            throw new Error(
                `Invalid time format: ${timeString}. Expected HH:mm or HH:mm:ss`,
            );
        }

        const parts = timeString.split(':').map(Number);
        const hours = parts[0];
        const minutes = parts[1];
        const seconds = parts[2] || 0;

        // Create a date object with the time
        const date = new Date(1970, 0, 1, hours, minutes, seconds);

        return date;
    }

    /**
     * Combine date and time strings into a single Date object
     * Both date and time are interpreted in local timezone
     * Returns UTC Date
     *
     * @param dateString - Date in YYYY-MM-DD format (local timezone)
     * @param timeString - Time in HH:mm or HH:mm:ss format (local timezone)
     */
    combineDateTime(dateString: string, timeString: string): Date {
        // Validate inputs
        if (!dateString || !timeString) {
            throw new Error('Both date and time strings are required');
        }

        // Extract date parts
        let datePart = dateString;
        if (dateString.includes('T')) {
            datePart = dateString.split('T')[0];
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            throw new Error(
                `Invalid date format: ${dateString}. Expected YYYY-MM-DD`,
            );
        }

        // Validate and normalize time format
        let timePart = timeString;
        if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
            throw new Error(
                `Invalid time format: ${timeString}. Expected HH:mm or HH:mm:ss`,
            );
        }

        // Ensure time has seconds
        if (timeString.length === 5) {
            timePart = `${timeString}:00`;
        }

        // Parse as local time
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);

        // Create date in local timezone
        const date = new Date(year, month - 1, day, hours, minutes, seconds);

        return date;
    }

    /**
     * Create a Time-only Date object for storing in @db.Time fields
     * This creates a Date with date part 1970-01-01 and the specified time in UTC
     *
     * IMPORTANT: Uses UTC to avoid timezone conversion issues when storing to DB
     *
     * @param timeString - Time in HH:mm or HH:mm:ss format
     */
    createTimeDate(timeString: string): Date {
        if (!timeString) {
            throw new Error('Time string is required');
        }

        const parts = timeString.split(':').map(Number);
        const hours = parts[0];
        const minutes = parts[1];
        const seconds = parts[2] || 0;

        // Create date with epoch date but specified time in UTC
        // Using Date.UTC prevents timezone conversion issues
        const date = new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds, 0));

        return date;
    }

    /**
     * Format a Date to date string (YYYY-MM-DD) in local timezone
     */
    formatDate(date: Date): string {
        return date.toLocaleDateString('en-CA', {
            timeZone: this.timezone,
        }); // Format: YYYY-MM-DD
    }

    /**
     * Format a Date to time string (HH:mm:ss) in local timezone
     */
    formatTime(date: Date): string {
        return date.toLocaleTimeString('en-GB', {
            timeZone: this.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    }

    /**
     * Format a Date to short time string (HH:mm) in local timezone
     */
    formatTimeShort(date: Date): string {
        return date.toLocaleTimeString('en-GB', {
            timeZone: this.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }

    /**
     * Format a Date to full datetime string in local timezone
     */
    formatDateTime(date: Date): string {
        return date.toLocaleString('en-GB', {
            timeZone: this.timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    }

    /**
     * Format a Date to ISO string
     */
    formatIso(date: Date): string {
        return date.toISOString();
    }

    /**
     * Extract time string (HH:mm) from a Date object in local timezone
     * Useful for extracting time from reservationTime field
     */
    extractTimeString(date: Date): string {
        return this.formatTimeShort(date);
    }

    /**
     * Extract date string (YYYY-MM-DD) from a Date object in local timezone
     * Useful for extracting date from reservationDate field
     */
    extractDateString(date: Date): string {
        return this.formatDate(date);
    }

    /**
     * Check if a date/time is in the future
     */
    isFuture(dateString: string, timeString?: string): boolean {
        const now = new Date();
        let targetDate: Date;

        if (timeString) {
            targetDate = this.combineDateTime(dateString, timeString);
        } else {
            targetDate = this.parseLocalDate(dateString);
        }

        return targetDate > now;
    }

    /**
     * Check if a date is today in local timezone
     */
    isToday(dateString: string | Date): boolean {
        const today = this.formatDate(new Date());

        if (dateString instanceof Date) {
            return this.formatDate(dateString) === today;
        }

        // Extract date part if it's ISO format
        const datePart = dateString.includes('T')
            ? dateString.split('T')[0]
            : dateString;

        return datePart === today;
    }

    /**
     * Check if a date/time has passed
     */
    hasPassed(dateString: string, timeString?: string): boolean {
        return !this.isFuture(dateString, timeString);
    }

    /**
     * Get timezone offset in minutes for a given date
     * Positive values = behind UTC (e.g., UTC-5 = 300)
     * Negative values = ahead of UTC (e.g., UTC+7 = -420)
     */
    getTimezoneOffsetMinutes(date?: Date): number {
        const d = date || new Date();

        // Get the offset by comparing local and UTC times
        const localTime = new Date(
            d.toLocaleString('en-US', { timeZone: this.timezone }),
        );
        const utcTime = new Date(
            d.toLocaleString('en-US', { timeZone: 'UTC' }),
        );

        return (utcTime.getTime() - localTime.getTime()) / 60000;
    }

    /**
     * Add days to a date
     */
    addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * Add hours to a date
     */
    addHours(date: Date, hours: number): Date {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    }

    /**
     * Add minutes to a date
     */
    addMinutes(date: Date, minutes: number): Date {
        const result = new Date(date);
        result.setMinutes(result.getMinutes() + minutes);
        return result;
    }

    /**
     * Calculate duration between two dates in minutes
     */
    getDurationMinutes(start: Date, end: Date): number {
        return Math.floor((end.getTime() - start.getTime()) / 60000);
    }

    /**
     * Calculate duration between two dates in seconds
     */
    getDurationSeconds(start: Date, end: Date): number {
        return Math.floor((end.getTime() - start.getTime()) / 1000);
    }

    /**
     * Get the start of a day for a given date in local timezone
     */
    startOfDay(date: Date): Date {
        const dateString = this.formatDate(date);
        return this.parseLocalDate(dateString);
    }

    /**
     * Get the end of a day for a given date in local timezone
     */
    endOfDay(date: Date): Date {
        // Get the date string in local timezone (YYYY-MM-DD)
        const dateString = this.formatDate(date);

        // Parse date parts
        const [year, month, day] = dateString.split('-').map(Number);

        // Create date at 23:59:59.999 using local time constructor
        // This automatically handles timezone conversion
        const result = new Date(year, month - 1, day, 23, 59, 59, 999);

        return result;
    }

    /**
     * Compare two dates (ignoring time)
     * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
     */
    compareDates(date1: Date, date2: Date): number {
        const d1 = this.formatDate(date1);
        const d2 = this.formatDate(date2);

        if (d1 < d2) return -1;
        if (d1 > d2) return 1;
        return 0;
    }

    /**
     * Check if two dates are on the same day in local timezone
     */
    isSameDay(date1: Date, date2: Date): boolean {
        return this.compareDates(date1, date2) === 0;
    }

    /**
     * Create a date range filter for Prisma queries
     * Useful for querying records within a date range
     */
    createDateRangeFilter(
        startDate: string,
        endDate: string,
    ): { gte: Date; lte: Date } {
        return {
            gte: this.parseLocalDate(startDate),
            lte: this.endOfDay(this.parseLocalDate(endDate)),
        };
    }

    /**
     * Create a single day filter for Prisma queries
     */
    createDayFilter(dateString: string): { gte: Date; lte: Date } {
        const date = this.parseLocalDate(dateString);
        return {
            gte: date,
            lte: this.endOfDay(date),
        };
    }
}
