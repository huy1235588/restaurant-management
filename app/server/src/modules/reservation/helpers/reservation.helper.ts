import { ReservationStatus } from '@/lib/prisma';
import { RESERVATION_CONSTANTS } from '../constants/reservation.constants';

/**
 * Default timezone for the application
 * This should match the TZ environment variable
 */
const DEFAULT_TIMEZONE = process.env['TZ'] || 'Asia/Ho_Chi_Minh';

/**
 * Reservation Module Helper Functions
 * Contains reusable business logic and utility functions
 *
 * IMPORTANT: All date/time operations use local timezone (Asia/Ho_Chi_Minh by default)
 */

export class ReservationHelper {
    /**
     * Get current date and time in local timezone as components
     * Returns { year, month, day, hours, minutes, seconds } in local timezone
     */
    static getNowInLocalTimezone(): {
        year: number;
        month: number;
        day: number;
        hours: number;
        minutes: number;
        seconds: number;
    } {
        const now = new Date();

        // Get local date string (YYYY-MM-DD)
        const localDateStr = now.toLocaleDateString('en-CA', {
            timeZone: DEFAULT_TIMEZONE,
        });

        // Get local time string (HH:mm:ss)
        const localTimeStr = now.toLocaleTimeString('en-GB', {
            timeZone: DEFAULT_TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        const [year, month, day] = localDateStr.split('-').map(Number);
        const [hours, minutes, seconds] = localTimeStr.split(':').map(Number);

        return { year, month, day, hours, minutes, seconds };
    }

    /**
     * Get current time as a comparable number (minutes since midnight in local timezone)
     */
    static getCurrentTimeMinutes(): number {
        const { hours, minutes } = this.getNowInLocalTimezone();
        return hours * 60 + minutes;
    }

    /**
     * Get current date string in local timezone (YYYY-MM-DD)
     */
    static getCurrentDateString(): string {
        const now = new Date();
        return now.toLocaleDateString('en-CA', {
            timeZone: DEFAULT_TIMEZONE,
        });
    }

    /**
     * Combine date and time strings into a Date object
     * Both date and time are interpreted in local timezone
     *
     * @param date - Date string in YYYY-MM-DD format
     * @param time - Time string in HH:mm or HH:mm:ss format
     * @returns Date object in local timezone
     */
    static combineDateTime(date: string, time: string): Date {
        // Handle ISO format date strings
        let datePart = date;
        if (date.includes('T')) {
            datePart = date.split('T')[0];
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            throw new Error(
                `Invalid date format: ${date}. Expected YYYY-MM-DD`,
            );
        }

        // Validate and normalize time format
        const timePart = time;
        if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
            throw new Error(
                `Invalid time format: ${time}. Expected HH:mm or HH:mm:ss`,
            );
        }

        // Parse date and time parts
        const [year, month, day] = datePart.split('-').map(Number);
        const timeParts = timePart.split(':').map(Number);
        const hours = timeParts[0];
        const minutes = timeParts[1];
        const seconds = timeParts[2] || 0;

        // Create date in local timezone
        // Using new Date(year, month-1, day, hours, minutes, seconds) creates in local timezone
        const result = new Date(year, month - 1, day, hours, minutes, seconds);

        return result;
    }

    /**
     * Extract date string (YYYY-MM-DD) from a Date object
     * Uses local timezone
     */
    static extractDateString(date: Date): string {
        return date.toLocaleDateString('en-CA', {
            timeZone: DEFAULT_TIMEZONE,
        }); // Format: YYYY-MM-DD
    }

    /**
     * Extract time string (HH:mm) from a Date object
     * Uses local timezone
     */
    static extractTimeString(date: Date): string {
        return date.toLocaleTimeString('en-GB', {
            timeZone: DEFAULT_TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }

    /**
     * Check if reservation date/time is in the future
     * Compares using local timezone to ensure correct validation
     */
    static isFutureDateTime(date: string, time: string): boolean {
        // Parse the reservation date
        let datePart = date;
        if (date.includes('T')) {
            datePart = date.split('T')[0];
        }

        // Get current date/time in local timezone
        const currentDateStr = this.getCurrentDateString();
        const currentTimeMinutes = this.getCurrentTimeMinutes();

        // Parse reservation time to minutes
        const timeParts = time.split(':').map(Number);
        const reservationTimeMinutes = timeParts[0] * 60 + timeParts[1];

        // Compare dates first
        if (datePart > currentDateStr) {
            // Reservation is on a future date
            return true;
        }

        if (datePart < currentDateStr) {
            // Reservation is on a past date
            return false;
        }

        // Same day - compare times
        return reservationTimeMinutes > currentTimeMinutes;
    }

    /**
     * Check if reservation is within minimum advance booking time
     * Uses local timezone for accurate comparison
     */
    static isWithinMinAdvanceTime(date: string, time: string): boolean {
        // Parse the reservation date
        let datePart = date;
        if (date.includes('T')) {
            datePart = date.split('T')[0];
        }

        // Parse reservation time
        const timeParts = time.split(':').map(Number);
        const reservationHours = timeParts[0];
        const reservationMinutes = timeParts[1];

        // Get current time in local timezone
        const now = this.getNowInLocalTimezone();

        // Calculate reservation datetime in minutes since a reference point
        const [resYear, resMonth, resDay] = datePart.split('-').map(Number);
        const reservationTotalMinutes =
            resYear * 525600 * 12 + // approximate
            resMonth * 525600 +
            resDay * 1440 +
            reservationHours * 60 +
            reservationMinutes;

        const currentTotalMinutes =
            now.year * 525600 * 12 +
            now.month * 525600 +
            now.day * 1440 +
            now.hours * 60 +
            now.minutes;

        const minAdvanceMinutes =
            RESERVATION_CONSTANTS.MIN_ADVANCE_BOOKING_MINUTES;

        return (
            reservationTotalMinutes - currentTotalMinutes >= minAdvanceMinutes
        );
    }

    /**
     * Check if reservation is within maximum advance booking time
     * Uses local timezone for accurate comparison
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static isWithinMaxAdvanceTime(date: string, time: string): boolean {
        // Parse the reservation date
        let datePart = date;
        if (date.includes('T')) {
            datePart = date.split('T')[0];
        }

        // Get current date in local timezone
        const currentDateStr = this.getCurrentDateString();
        const [currentYear, currentMonth, currentDay] = currentDateStr
            .split('-')
            .map(Number);
        const [resYear, resMonth, resDay] = datePart.split('-').map(Number);

        // Calculate days difference
        const currentDate = new Date(currentYear, currentMonth - 1, currentDay);
        const reservationDate = new Date(resYear, resMonth - 1, resDay);

        const daysDiff = Math.floor(
            (reservationDate.getTime() - currentDate.getTime()) /
                (1000 * 60 * 60 * 24),
        );

        return daysDiff <= RESERVATION_CONSTANTS.MAX_ADVANCE_BOOKING_DAYS;
    }

    /**
     * Validate party size
     */
    static isValidPartySize(partySize: number): boolean {
        return (
            partySize >= RESERVATION_CONSTANTS.MIN_PARTY_SIZE &&
            partySize <= RESERVATION_CONSTANTS.MAX_PARTY_SIZE
        );
    }

    /**
     * Check if reservation can be modified
     */
    static canModifyReservation(status: ReservationStatus): boolean {
        return status === ReservationStatus.pending;
    }

    /**
     * Check if reservation can be cancelled
     */
    static canCancelReservation(status: ReservationStatus): boolean {
        return (
            status === ReservationStatus.pending ||
            status === ReservationStatus.confirmed
        );
    }

    /**
     * Check if reservation can be confirmed
     */
    static canConfirmReservation(status: ReservationStatus): boolean {
        return status === ReservationStatus.pending;
    }

    /**
     * Check if reservation can be seated
     */
    static canSeatReservation(status: ReservationStatus): boolean {
        return status === ReservationStatus.confirmed;
    }

    /**
     * Check if order can be created from reservation
     */
    static canCreateOrder(status: ReservationStatus): boolean {
        return status === ReservationStatus.seated;
    }

    /**
     * Check if reservation can be completed
     */
    static canCompleteReservation(status: ReservationStatus): boolean {
        return status === ReservationStatus.seated;
    }

    /**
     * Check if reservation can be marked as no-show
     */
    static canMarkNoShow(status: ReservationStatus): boolean {
        return status === ReservationStatus.confirmed;
    }

    /**
     * Validate status transition
     */
    static isValidStatusTransition(
        currentStatus: ReservationStatus,
        newStatus: ReservationStatus,
    ): boolean {
        const transitions: Record<ReservationStatus, ReservationStatus[]> = {
            [ReservationStatus.pending]: [
                ReservationStatus.confirmed,
                ReservationStatus.cancelled,
            ],
            [ReservationStatus.confirmed]: [
                ReservationStatus.seated,
                ReservationStatus.cancelled,
                ReservationStatus.no_show,
            ],
            [ReservationStatus.seated]: [ReservationStatus.completed],
            [ReservationStatus.completed]: [],
            [ReservationStatus.cancelled]: [],
            [ReservationStatus.no_show]: [],
        };

        return transitions[currentStatus]?.includes(newStatus) ?? false;
    }

    /**
     * Calculate reservation end time
     */
    static calculateEndTime(
        date: string,
        time: string,
        durationMinutes?: number,
    ): Date {
        const startDateTime = this.combineDateTime(date, time);
        const duration =
            durationMinutes ||
            RESERVATION_CONSTANTS.DEFAULT_RESERVATION_DURATION_MINUTES;
        startDateTime.setMinutes(startDateTime.getMinutes() + duration);
        return startDateTime;
    }

    /**
     * Check if reservation is expired (past grace period)
     * Uses local timezone for accurate comparison
     */
    static isExpired(date: string, time: string): boolean {
        // Parse the reservation date
        let datePart = date;
        if (date.includes('T')) {
            datePart = date.split('T')[0];
        }

        // Parse reservation time
        const timeParts = time.split(':').map(Number);
        let reservationMinutes = timeParts[0] * 60 + timeParts[1];

        // Add grace period
        reservationMinutes += RESERVATION_CONSTANTS.GRACE_PERIOD_MINUTES;

        // Get current date/time in local timezone
        const currentDateStr = this.getCurrentDateString();
        const currentTimeMinutes = this.getCurrentTimeMinutes();

        // Compare dates first
        if (datePart > currentDateStr) {
            // Reservation is on a future date - not expired
            return false;
        }

        if (datePart < currentDateStr) {
            // Reservation is on a past date - expired
            return true;
        }

        // Same day - compare times (including grace period)
        return currentTimeMinutes > reservationMinutes;
    }

    /**
     * Check if within grace period
     * Uses local timezone for accurate comparison
     */
    static isWithinGracePeriod(date: string, time: string): boolean {
        // Parse the reservation date
        let datePart = date;
        if (date.includes('T')) {
            datePart = date.split('T')[0];
        }

        // Parse reservation time
        const timeParts = time.split(':').map(Number);
        const reservationMinutes = timeParts[0] * 60 + timeParts[1];
        const gracePeriodEnd =
            reservationMinutes + RESERVATION_CONSTANTS.GRACE_PERIOD_MINUTES;

        // Get current date/time in local timezone
        const currentDateStr = this.getCurrentDateString();
        const currentTimeMinutes = this.getCurrentTimeMinutes();

        // Must be same day
        if (datePart !== currentDateStr) {
            return false;
        }

        // Check if current time is between reservation time and grace period end
        return (
            currentTimeMinutes >= reservationMinutes &&
            currentTimeMinutes <= gracePeriodEnd
        );
    }

    /**
     * Format reservation code
     */
    static formatReservationCode(code: string): string {
        return code.toUpperCase();
    }

    /**
     * Check if reservation is active (not cancelled, completed, or no-show)
     */
    static isActiveReservation(status: ReservationStatus): boolean {
        return (
            status !== ReservationStatus.completed &&
            status !== ReservationStatus.cancelled &&
            status !== ReservationStatus.no_show
        );
    }

    /**
     * Get reservation status priority for sorting
     */
    static getStatusPriority(status: ReservationStatus): number {
        const priorities: Record<ReservationStatus, number> = {
            [ReservationStatus.seated]: 1, // Highest priority
            [ReservationStatus.confirmed]: 2,
            [ReservationStatus.pending]: 3,
            [ReservationStatus.no_show]: 4,
            [ReservationStatus.completed]: 5,
            [ReservationStatus.cancelled]: 6, // Lowest priority
        };
        return priorities[status] ?? 99;
    }

    /**
     * Calculate time until reservation
     */
    static getTimeUntilReservation(date: string, time: string): number {
        const reservationDateTime = this.combineDateTime(date, time);
        const now = new Date();
        return Math.floor(
            (reservationDateTime.getTime() - now.getTime()) / (1000 * 60),
        ); // Return in minutes
    }

    /**
     * Check if reservation is today
     */
    static isToday(date: string): boolean {
        const reservationDate = new Date(date);
        const today = new Date();
        return (
            reservationDate.getDate() === today.getDate() &&
            reservationDate.getMonth() === today.getMonth() &&
            reservationDate.getFullYear() === today.getFullYear()
        );
    }

    /**
     * Check if reservation time has passed
     */
    static hasReservationTimePassed(date: string, time: string): boolean {
        const reservationDateTime = this.combineDateTime(date, time);
        return new Date() > reservationDateTime;
    }

    /**
     * Format time for display (HH:MM)
     */
    static formatTime(time: string): string {
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    /**
     * Get reservation duration in minutes
     */
    static getReservationDuration(
        startDate: string,
        startTime: string,
        endDate: string,
        endTime: string,
    ): number {
        const start = this.combineDateTime(startDate, startTime);
        const end = this.combineDateTime(endDate, endTime);
        return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    }
}
