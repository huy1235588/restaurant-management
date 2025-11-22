/**
 * Reservation Module Constants
 * Defines all constant values used throughout the reservation module
 */

export const RESERVATION_CONSTANTS = {
    // Default pagination
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,

    // Reservation code format
    RESERVATION_CODE_PREFIX: 'RSV',
    RESERVATION_CODE_LENGTH: 10,

    // Business rules
    MIN_PARTY_SIZE: 1,
    MAX_PARTY_SIZE: 20,
    MAX_CUSTOMER_NAME_LENGTH: 100,
    MAX_CUSTOMER_EMAIL_LENGTH: 100,
    MAX_CUSTOMER_PHONE_LENGTH: 20,
    MAX_SPECIAL_REQUESTS_LENGTH: 500,
    MAX_CANCELLATION_REASON_LENGTH: 500,
    MAX_NOTES_LENGTH: 1000,

    // Time rules (in minutes)
    MIN_ADVANCE_BOOKING_MINUTES: 30, // Minimum 30 minutes in advance
    MAX_ADVANCE_BOOKING_DAYS: 90, // Maximum 90 days in advance
    DEFAULT_RESERVATION_DURATION_MINUTES: 120, // Default 2 hours
    GRACE_PERIOD_MINUTES: 15, // Grace period for late arrivals
    AUTO_CANCEL_NO_SHOW_MINUTES: 30, // Auto-cancel if no-show after 30 minutes

    // Table allocation rules
    MAX_TABLES_PER_RESERVATION: 3,
} as const;

export const RESERVATION_MESSAGES = {
    // Success messages
    SUCCESS: {
        RESERVATION_CREATED: 'Reservation created successfully',
        RESERVATION_UPDATED: 'Reservation updated successfully',
        RESERVATION_CONFIRMED: 'Reservation confirmed successfully',
        RESERVATION_CANCELLED: 'Reservation cancelled successfully',
        RESERVATION_COMPLETED: 'Reservation completed successfully',
        RESERVATION_NO_SHOW: 'Reservation marked as no-show',
        RESERVATION_SEATED: 'Customer seated successfully',
        ORDER_CREATED: 'Order created from reservation successfully',
        RESERVATIONS_RETRIEVED: 'Reservations retrieved successfully',
        RESERVATION_RETRIEVED: 'Reservation retrieved successfully',
        AVAILABILITY_CHECKED: 'Table availability checked successfully',
        COUNT_RETRIEVED: 'Reservations count retrieved successfully',
    },

    // Error messages
    ERROR: {
        RESERVATION_NOT_FOUND: 'Reservation not found',
        TABLE_NOT_FOUND: 'Table not found',
        TABLES_NOT_AVAILABLE: 'Requested tables are not available',
        INVALID_RESERVATION_DATE: 'Reservation date must be in the future',
        RESERVATION_TOO_EARLY:
            'Reservation must be at least 30 minutes in advance',
        RESERVATION_TOO_FAR:
            'Reservation cannot be more than 90 days in advance',
        INVALID_PARTY_SIZE: 'Party size must be between 1 and 20',
        INVALID_TIME_SLOT: 'Invalid reservation time slot',
        RESERVATION_ALREADY_CONFIRMED: 'Reservation is already confirmed',
        RESERVATION_ALREADY_CANCELLED: 'Reservation is already cancelled',
        RESERVATION_ALREADY_COMPLETED: 'Reservation is already completed',
        CANNOT_MODIFY_CONFIRMED:
            'Cannot modify confirmed reservation. Please cancel and create new one.',
        CANNOT_MODIFY_CANCELLED: 'Cannot modify cancelled reservation',
        CANNOT_MODIFY_COMPLETED: 'Cannot modify completed reservation',
        CANNOT_CANCEL_COMPLETED: 'Cannot cancel completed reservation',
        CANNOT_CANCEL_NO_SHOW: 'Cannot cancel no-show reservation',
        ORDER_ALREADY_EXISTS: 'Order already exists for this reservation',
        RESERVATION_NOT_CONFIRMED: 'Reservation must be confirmed first',
        RESERVATION_NOT_SEATED: 'Customer must be seated first',
        CUSTOMER_NOT_ARRIVED: 'Customer has not arrived yet',
        TABLE_OCCUPIED: 'One or more tables are currently occupied',
        DUPLICATE_RESERVATION:
            'Customer already has a reservation for this time slot',
    },
} as const;

export const RESERVATION_STATUS_MESSAGES: Record<
    string,
    { title: string; description: string }
> = {
    pending: {
        title: 'Pending',
        description: 'Reservation is pending confirmation',
    },
    confirmed: {
        title: 'Confirmed',
        description: 'Reservation has been confirmed',
    },
    seated: {
        title: 'Seated',
        description: 'Customer has arrived and been seated',
    },
    completed: {
        title: 'Completed',
        description: 'Customer has finished dining',
    },
    cancelled: {
        title: 'Cancelled',
        description: 'Reservation has been cancelled',
    },
    noshow: {
        title: 'No-Show',
        description: 'Customer did not show up',
    },
} as const;

export const RESERVATION_WORKFLOW = {
    STEPS: [
        'Customer books a table (pending)',
        'Staff confirms reservation (confirmed)',
        'Customer arrives and is seated (seated)',
        'Staff creates order from reservation',
        'Customer finishes dining (completed)',
    ],
    TRANSITIONS: {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['seated', 'cancelled', 'noshow'],
        seated: ['completed'],
        completed: [],
        cancelled: [],
        noshow: [],
    },
} as const;
