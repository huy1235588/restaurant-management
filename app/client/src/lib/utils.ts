import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

export function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

// Re-export date utilities
export {
    parseReservationDate,
    formatReservationDate,
    parseReservationTime,
    formatReservationTime,
    combineDateAndTime,
    formatBirthday,
    formatTimestamp,
    isNewDateFormat,
    isNewTimeFormat,
} from './utils/date';

// Re-export image utilities
export { getImageUrl, hasImagePath } from './utils/image';
