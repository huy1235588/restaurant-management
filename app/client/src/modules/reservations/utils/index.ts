import { ReservationStatus } from "../types";

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
    [ReservationStatus.PENDING]: "Pending",
    [ReservationStatus.CONFIRMED]: "Confirmed",
    [ReservationStatus.SEATED]: "Seated",
    [ReservationStatus.COMPLETED]: "Completed",
    [ReservationStatus.CANCELLED]: "Cancelled",
    [ReservationStatus.NO_SHOW]: "No Show",
};

export const RESERVATION_STATUS_COLORS: Record<
    ReservationStatus,
    "default" | "secondary" | "success" | "warning" | "destructive"
> = {
    [ReservationStatus.PENDING]: "warning",
    [ReservationStatus.CONFIRMED]: "default",
    [ReservationStatus.SEATED]: "secondary",
    [ReservationStatus.COMPLETED]: "success",
    [ReservationStatus.CANCELLED]: "destructive",
    [ReservationStatus.NO_SHOW]: "destructive",
};

export function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(dateString));
}

export function formatTime(timeString: string): string {
    return timeString.substring(0, 5); // HH:MM
}

export function formatDateTime(dateString: string): string {
    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateString));
}
