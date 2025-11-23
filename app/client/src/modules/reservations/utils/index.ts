import { ReservationStatus } from '../types';
import {
    RESERVATION_STATUS_LABELS,
    RESERVATION_STATUS_COLORS,
    RESERVATION_STATUS_GRADIENTS,
    RESERVATION_WORKFLOW,
    EDITABLE_RESERVATION_STATUSES,
    CANCELLABLE_RESERVATION_STATUSES,
    ACTIVE_RESERVATION_STATUSES,
    FINALIZED_RESERVATION_STATUSES,
    TIME_SLOT_LABELS,
} from '../constants';

// Format reservation code for display
export function formatReservationCode(code: string): string {
    return code.toUpperCase();
}

// Get status display text
export function getStatusText(status: ReservationStatus): string {
    return RESERVATION_STATUS_LABELS[status] || status;
}

// Get status display color for badges
export function getStatusColor(status: ReservationStatus): string {
    return RESERVATION_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
}

// Get next available status transitions
export function getAvailableActions(status: ReservationStatus): string[] {
    return RESERVATION_WORKFLOW.ACTIONS[status] || [];
}

// Check if reservation can be edited
export function canEditReservation(status: ReservationStatus): boolean {
    return EDITABLE_RESERVATION_STATUSES.includes(status);
}

// Check if reservation can be cancelled
export function canCancelReservation(status: ReservationStatus): boolean {
    return CANCELLABLE_RESERVATION_STATUSES.includes(status);
}

// Combine date and time strings from backend into a single Date object
export function combineDateTime(dateStr: string, timeStr: string): Date {
    // dateStr format: "2024-12-25" or "2024-12-25T00:00:00.000Z"
    // timeStr format: "19:00:00" or "1970-01-01T19:00:00.000Z"
    
    // Extract date part
    const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    
    // Extract time part
    let timePart: string;
    if (timeStr.includes('T')) {
        // If it's an ISO timestamp, extract HH:mm:ss
        timePart = timeStr.split('T')[1].split('.')[0];
    } else {
        timePart = timeStr;
    }
    
    // Combine: "2024-12-25T19:00:00"
    const combined = `${datePart}T${timePart}`;
    return new Date(combined);
}

// Format date and time for display
export function formatReservationDateTime(date: string | Date, time?: string): string {
    let d: Date;
    
    if (typeof date === 'string' && time) {
        // If both date and time strings provided (from backend)
        d = combineDateTime(date, time);
    } else {
        // If single date/datetime provided
        d = typeof date === 'string' ? new Date(date) : date;
    }
    
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

// Format time only
export function formatTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

// Format date only
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(d);
}

// Calculate duration in readable format
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

// Check if reservation is upcoming (within next 24 hours)
export function isUpcoming(date: string | Date): boolean {
    const reservationDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return reservationDate > now && reservationDate <= tomorrow;
}

// Check if reservation is today
export function isToday(date: string | Date): boolean {
    const reservationDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    return (
        reservationDate.getFullYear() === now.getFullYear() &&
        reservationDate.getMonth() === now.getMonth() &&
        reservationDate.getDate() === now.getDate()
    );
}

// Check if reservation is past
export function isPast(date: string | Date): boolean {
    const reservationDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    return reservationDate < now;
}

// Get time slot label (e.g., "Lunch", "Dinner")
export function getTimeSlotLabel(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const hour = d.getHours();

    if (hour < 11) return TIME_SLOT_LABELS.breakfast;
    if (hour < 14) return TIME_SLOT_LABELS.lunch;
    if (hour < 17) return TIME_SLOT_LABELS.afternoon;
    if (hour < 21) return TIME_SLOT_LABELS.dinner;
    return TIME_SLOT_LABELS.late_night;
}

// Validate phone number (basic)
export function isValidPhone(phone: string): boolean {
    // Simple validation - at least 10 digits
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return phone;
}

/**
 * New workflow helper functions
 */

// Get status gradient color for enhanced badges
export function getStatusGradient(status: ReservationStatus): string {
    return RESERVATION_STATUS_GRADIENTS[status] || RESERVATION_STATUS_COLORS[status];
}

// Get next possible statuses for transition
export function getNextPossibleStatuses(currentStatus: ReservationStatus): ReservationStatus[] {
    return RESERVATION_WORKFLOW.TRANSITIONS[currentStatus] || [];
}

// Check if reservation is active (not finalized)
export function isReservationActive(status: ReservationStatus): boolean {
    return ACTIVE_RESERVATION_STATUSES.includes(status);
}

// Check if reservation is finalized
export function isReservationFinalized(status: ReservationStatus): boolean {
    return FINALIZED_RESERVATION_STATUSES.includes(status);
}

// Check if can seat reservation (confirmed status)
export function canSeatReservation(status: ReservationStatus): boolean {
    return status === 'confirmed';
}

// Check if can complete reservation (seated status)
export function canCompleteReservation(status: ReservationStatus): boolean {
    return status === 'seated';
}

// Check if can create order (seated status)
export function canCreateOrder(status: ReservationStatus): boolean {
    return status === 'seated';
}

// Check if can mark as no-show
export function canMarkNoShow(status: ReservationStatus): boolean {
    return status === 'confirmed';
}

// Check if reservation time has passed
export function hasReservationTimePassed(date: string, time: string): boolean {
    const reservationDateTime = combineDateTime(date, time);
    return reservationDateTime < new Date();
}

// Check if within grace period
export function isWithinGracePeriod(date: string, time: string): boolean {
    const reservationDateTime = combineDateTime(date, time);
    const now = new Date();
    const minutesPassed = (now.getTime() - reservationDateTime.getTime()) / 60000;
    
    return (
        minutesPassed > 0 &&
        minutesPassed <= RESERVATION_WORKFLOW.GRACE_PERIOD_MINUTES
    );
}

// Check if should auto mark as no-show
export function shouldAutoNoShow(date: string, time: string): boolean {
    const reservationDateTime = combineDateTime(date, time);
    const now = new Date();
    const minutesPassed = (now.getTime() - reservationDateTime.getTime()) / 60000;
    
    return minutesPassed > RESERVATION_WORKFLOW.AUTO_NO_SHOW_MINUTES;
}

// Calculate minutes until reservation
export function getMinutesUntilReservation(date: string, time: string): number {
    const reservationDateTime = combineDateTime(date, time);
    const now = new Date();
    return Math.floor((reservationDateTime.getTime() - now.getTime()) / 60000);
}

// Get time until reservation (formatted)
export function getTimeUntilReservation(date: string, time: string): string {
    const minutes = getMinutesUntilReservation(date, time);
    
    if (minutes < 0) return 'Đã qua';
    if (minutes === 0) return 'Bây giờ';
    if (minutes < 60) return `${minutes} phút nữa`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} giờ nữa`;
    return `${hours} giờ ${remainingMinutes} phút nữa`;
}

// Validate reservation date/time
export function validateReservationDateTime(date: string, time: string): {
    valid: boolean;
    error?: string;
} {
    const reservationDateTime = combineDateTime(date, time);
    const now = new Date();
    
    // Check if in past
    if (reservationDateTime < now) {
        return { valid: false, error: 'Không thể đặt bàn trong quá khứ' };
    }
    
    // Check minimum advance booking
    const minutesInAdvance = (reservationDateTime.getTime() - now.getTime()) / 60000;
    if (minutesInAdvance < RESERVATION_WORKFLOW.MIN_ADVANCE_BOOKING_MINUTES) {
        return {
            valid: false,
            error: `Vui lòng đặt trước ít nhất ${RESERVATION_WORKFLOW.MIN_ADVANCE_BOOKING_MINUTES} phút`,
        };
    }
    
    // Check maximum advance booking
    const daysInAdvance = minutesInAdvance / (24 * 60);
    if (daysInAdvance > RESERVATION_WORKFLOW.MAX_ADVANCE_BOOKING_DAYS) {
        return {
            valid: false,
            error: `Chỉ có thể đặt trong vòng ${RESERVATION_WORKFLOW.MAX_ADVANCE_BOOKING_DAYS} ngày`,
        };
    }
    
    return { valid: true };
}

// Get reservation priority (for sorting)
export function getReservationPriority(status: ReservationStatus): number {
    const priorities: Record<ReservationStatus, number> = {
        seated: 1, // Highest priority
        confirmed: 2,
        pending: 3,
        completed: 4,
        cancelled: 5,
        no_show: 6, // Lowest priority
    };
    return priorities[status] ?? 999;
}

// Sort reservations by priority and time
export function sortReservationsByPriority<
    T extends { status: ReservationStatus; reservationDate: string; reservationTime: string },
>(reservations: T[]): T[] {
    return [...reservations].sort((a, b) => {
        // First by status priority
        const priorityDiff = getReservationPriority(a.status) - getReservationPriority(b.status);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by reservation time (earliest first)
        const aTime = combineDateTime(a.reservationDate, a.reservationTime);
        const bTime = combineDateTime(b.reservationDate, b.reservationTime);
        return aTime.getTime() - bTime.getTime();
    });
}

// Get action button config
export function getActionButtonConfig(action: string) {
    // This would be imported from constants in real usage
    return null; // Placeholder
}

// Format party size
export function formatPartySize(size: number): string {
    return `${size} ${size === 1 ? 'người' : 'người'}`;
}

// Format reservation code for display
export function formatReservationCodeDisplay(code: string): string {
    return `#${code.toUpperCase()}`;
}
