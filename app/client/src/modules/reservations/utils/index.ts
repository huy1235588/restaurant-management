import { ReservationStatus } from '../types';

// Format reservation code for display
export function formatReservationCode(code: string): string {
    return code.toUpperCase();
}

// Get status display text
export function getStatusText(status: ReservationStatus): string {
    const statusMap: Record<ReservationStatus, string> = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        seated: 'Seated',
        completed: 'Completed',
        cancelled: 'Cancelled',
        no_show: 'No Show',
    };
    return statusMap[status] || status;
}

// Get status display color for badges
export function getStatusColor(status: ReservationStatus): string {
    const colorMap: Record<ReservationStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
        seated: 'bg-green-100 text-green-800 border-green-200',
        completed: 'bg-gray-100 text-gray-800 border-gray-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
        no_show: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
}

// Get next available status transitions
export function getAvailableActions(status: ReservationStatus): string[] {
    const actionsMap: Record<ReservationStatus, string[]> = {
        pending: ['confirm', 'cancel'],
        confirmed: ['seat', 'cancel'],
        seated: ['complete'],
        completed: [],
        cancelled: [],
        no_show: [],
    };
    return actionsMap[status] || [];
}

// Check if reservation can be edited
export function canEditReservation(status: ReservationStatus): boolean {
    return ['pending', 'confirmed'].includes(status);
}

// Check if reservation can be cancelled
export function canCancelReservation(status: ReservationStatus): boolean {
    return ['pending', 'confirmed'].includes(status);
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

    if (hour < 11) return 'Breakfast';
    if (hour < 14) return 'Lunch';
    if (hour < 17) return 'Afternoon';
    if (hour < 21) return 'Dinner';
    return 'Late Night';
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
