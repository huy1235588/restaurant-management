import {
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';

/**
 * Custom exceptions for Reservation module
 * Provides better error context for reservation workflow
 */

export class ReservationNotFoundException extends NotFoundException {
    constructor(identifier?: number | string) {
        const message = identifier
            ? `Reservation with ${typeof identifier === 'number' ? 'ID' : 'code'} ${identifier} not found`
            : 'Reservation not found';
        super(message);
    }
}

export class TableNotAvailableException extends ConflictException {
    constructor(
        tableId: number,
        reservationDate?: string,
        reservationTime?: string,
    ) {
        const message =
            reservationDate && reservationTime
                ? `Table ${tableId} is not available at ${reservationDate} ${reservationTime}`
                : `Table ${tableId} is not available`;
        super(message);
    }
}

export class TablesNotAvailableException extends ConflictException {
    constructor(tableIds: number[]) {
        super(
            `Tables ${tableIds.join(', ')} are not available for the requested time slot`,
        );
    }
}

export class InvalidReservationDateException extends BadRequestException {
    constructor(reason: string = 'Reservation date must be in the future') {
        super(reason);
    }
}

export class ReservationTooEarlyException extends BadRequestException {
    constructor(minMinutes: number) {
        super(`Reservation must be at least ${minMinutes} minutes in advance`);
    }
}

export class ReservationTooFarException extends BadRequestException {
    constructor(maxDays: number) {
        super(`Reservation cannot be more than ${maxDays} days in advance`);
    }
}

export class InvalidPartySizeException extends BadRequestException {
    constructor(min: number, max: number) {
        super(`Party size must be between ${min} and ${max}`);
    }
}

export class ReservationAlreadyConfirmedException extends ConflictException {
    constructor(reservationCode: string | number) {
        super(`Reservation ${reservationCode} is already confirmed`);
    }
}

export class ReservationAlreadyCancelledException extends ConflictException {
    constructor(reservationCode: string | number) {
        super(`Reservation ${reservationCode} is already cancelled`);
    }
}

export class ReservationAlreadyCompletedException extends ConflictException {
    constructor(reservationCode: string | number) {
        super(`Reservation ${reservationCode} is already completed`);
    }
}

export class CannotModifyReservationException extends BadRequestException {
    constructor(status: string, action: string = 'modify') {
        super(
            `Cannot ${action} ${status} reservation. Please cancel and create a new one.`,
        );
    }
}

export class CannotCancelReservationException extends BadRequestException {
    constructor(status: string) {
        super(`Cannot cancel ${status} reservation`);
    }
}

export class OrderAlreadyExistsException extends ConflictException {
    constructor(reservationCode: string | number) {
        super(`An order already exists for reservation ${reservationCode}`);
    }
}

export class ReservationNotConfirmedException extends BadRequestException {
    constructor(action: string = 'proceed') {
        super(`Reservation must be confirmed before you can ${action}`);
    }
}

export class ReservationNotSeatedException extends BadRequestException {
    constructor() {
        super('Customer must be seated before creating an order');
    }
}

export class CustomerNotArrivedException extends BadRequestException {
    constructor() {
        super('Customer has not arrived yet');
    }
}

export class TableOccupiedException extends ConflictException {
    constructor(tableId: number) {
        super(`Table ${tableId} is currently occupied`);
    }
}

export class DuplicateReservationException extends ConflictException {
    constructor(customerPhone: string, date: string, time: string) {
        super(
            `Customer ${customerPhone} already has a reservation on ${date} at ${time}`,
        );
    }
}

export class InvalidStatusTransitionException extends BadRequestException {
    constructor(currentStatus: string, newStatus: string) {
        super(
            `Invalid status transition from ${currentStatus} to ${newStatus}`,
        );
    }
}

export class ReservationExpiredException extends BadRequestException {
    constructor(reservationCode: string) {
        super(
            `Reservation ${reservationCode} has expired. Customer did not arrive within grace period.`,
        );
    }
}
