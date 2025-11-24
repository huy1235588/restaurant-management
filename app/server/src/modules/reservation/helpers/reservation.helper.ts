import { ReservationStatus } from '@/lib/prisma';
import { RESERVATION_CONSTANTS } from '../constants/reservation.constants';

/**
 * Reservation Module Helper Functions
 * Contains reusable business logic and utility functions
 */

export class ReservationHelper {
    /**
     * Combine date and time strings into a Date object
     */
    static combineDateTime(date: string, time: string): Date {
        const dateObj = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        dateObj.setHours(hours, minutes, 0, 0);
        return dateObj;
    }

    /**
     * Check if reservation date/time is in the future
     */
    static isFutureDateTime(date: string, time: string): boolean {
        const reservationDateTime = this.combineDateTime(date, time);
        return reservationDateTime > new Date();
    }

    /**
     * Check if reservation is within minimum advance booking time
     */
    static isWithinMinAdvanceTime(date: string, time: string): boolean {
        const reservationDateTime = this.combineDateTime(date, time);
        const minDateTime = new Date();
        minDateTime.setMinutes(
            minDateTime.getMinutes() +
                RESERVATION_CONSTANTS.MIN_ADVANCE_BOOKING_MINUTES,
        );
        return reservationDateTime >= minDateTime;
    }

    /**
     * Check if reservation is within maximum advance booking time
     */
    static isWithinMaxAdvanceTime(date: string, time: string): boolean {
        const reservationDateTime = this.combineDateTime(date, time);
        const maxDateTime = new Date();
        maxDateTime.setDate(
            maxDateTime.getDate() +
                RESERVATION_CONSTANTS.MAX_ADVANCE_BOOKING_DAYS,
        );
        return reservationDateTime <= maxDateTime;
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
     */
    static isExpired(date: string, time: string): boolean {
        const reservationDateTime = this.combineDateTime(date, time);
        const expiryTime = new Date(reservationDateTime);
        expiryTime.setMinutes(
            expiryTime.getMinutes() +
                RESERVATION_CONSTANTS.GRACE_PERIOD_MINUTES,
        );
        return new Date() > expiryTime;
    }

    /**
     * Check if within grace period
     */
    static isWithinGracePeriod(date: string, time: string): boolean {
        const reservationDateTime = this.combineDateTime(date, time);
        const now = new Date();
        const gracePeriodEnd = new Date(reservationDateTime);
        gracePeriodEnd.setMinutes(
            gracePeriodEnd.getMinutes() +
                RESERVATION_CONSTANTS.GRACE_PERIOD_MINUTES,
        );

        return now >= reservationDateTime && now <= gracePeriodEnd;
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
