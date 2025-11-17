import { BadRequestError } from '@/shared/utils/errors';

export const RESERVATION_DEFAULTS = {
    durationMinutes: 120,
    bufferMinutes: 15,
    maxAdvanceDays: 90,
    openingHour: 10,
    closingHour: 22,
    slotIntervalMinutes: 30,
};

const MS_IN_MINUTE = 60 * 1000;

const ensureDate = (value: string | Date): Date => {
    if (value instanceof Date) {
        return new Date(value);
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestError('Invalid date provided');
    }
    return parsed;
};

const parseTimeString = (time: string | Date): { hours: number; minutes: number } => {
    if (time instanceof Date) {
        return { hours: time.getHours(), minutes: time.getMinutes() };
    }
    const parts = time.split(':').map((part) => Number(part));
    const [hours = 0, minutes = 0] = parts;
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        throw new BadRequestError('Invalid time format. Expected HH:mm');
    }
    return { hours, minutes };
};

const combineDateAndTime = (date: Date, time: string | Date): Date => {
    const normalized = ensureDate(date);
    const { hours, minutes } = parseTimeString(time);
    const combined = new Date(normalized);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
};

const addMinutes = (date: Date, minutes: number): Date => new Date(date.getTime() + minutes * MS_IN_MINUTE);

const startOfDay = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const endOfDay = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

const overlaps = (startA: Date, endA: Date, startB: Date, endB: Date, bufferMinutes: number): boolean => {
    const bufferedStartA = addMinutes(startA, -bufferMinutes);
    const bufferedEndA = addMinutes(endA, bufferMinutes);
    const bufferedStartB = addMinutes(startB, -bufferMinutes);
    const bufferedEndB = addMinutes(endB, bufferMinutes);
    return bufferedStartA < bufferedEndB && bufferedStartB < bufferedEndA;
};

export const ReservationDateUtils = {
    ensureDate,
    parseTimeString,
    combineDateAndTime,
    addMinutes,
    startOfDay,
    endOfDay,
    overlaps,
};

export const ReservationRules = {
    validateDateWithinWindow(reservationDate: Date) {
        const today = ReservationDateUtils.startOfDay(new Date());
        const requested = ReservationDateUtils.startOfDay(reservationDate);
        const maxDate = ReservationDateUtils.addMinutes(today, RESERVATION_DEFAULTS.maxAdvanceDays * 24 * 60);
        if (requested < today) {
            throw new BadRequestError('Cannot create reservation in the past');
        }
        if (requested > maxDate) {
            throw new BadRequestError(`Reservations can only be made up to ${RESERVATION_DEFAULTS.maxAdvanceDays} days in advance`);
        }
    },

    validateTimeSlot(time: string | Date) {
        const { hours, minutes } = ReservationDateUtils.parseTimeString(time);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            throw new BadRequestError('Time must be a valid 24h format (HH:mm)');
        }
        if (minutes % RESERVATION_DEFAULTS.slotIntervalMinutes !== 0) {
            throw new BadRequestError(
                `Time must align with ${RESERVATION_DEFAULTS.slotIntervalMinutes}-minute intervals`
            );
        }
        if (hours < RESERVATION_DEFAULTS.openingHour || hours >= RESERVATION_DEFAULTS.closingHour) {
            throw new BadRequestError('Reservation time is outside of operating hours');
        }
    },

    validatePartySize(partySize: number) {
        if (!Number.isInteger(partySize) || partySize <= 0) {
            throw new BadRequestError('Party size must be a positive integer');
        }
    },

    validateDuration(duration: number) {
        if (!Number.isInteger(duration) || duration < 30 || duration > 360) {
            throw new BadRequestError('Reservation duration must be between 30 and 360 minutes');
        }
    },
};
