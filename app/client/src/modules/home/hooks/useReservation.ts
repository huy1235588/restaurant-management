"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { homeApi } from "../services/home.service";
import type { ReservationFormData, ReservationResponse } from "../types";

interface UseReservationOptions {
    onSuccess?: (reservation: ReservationResponse) => void;
    onError?: (error: Error) => void;
}

export function useReservation(options: UseReservationOptions = {}) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [reservation, setReservation] = useState<ReservationResponse | null>(null);

    const submitReservation = async (data: ReservationFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await homeApi.createReservation(data);
            setReservation(result);
            toast.success(t("home.reservation.successMessage", {
                code: result.reservationCode,
                defaultValue: `Đặt bàn thành công! Mã đặt bàn: ${result.reservationCode}`
            }));
            options.onSuccess?.(result);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to create reservation");
            setError(error);
            toast.error(t("home.reservation.errorMessage", {
                defaultValue: "Không thể đặt bàn. Vui lòng thử lại sau."
            }));
            options.onError?.(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setReservation(null);
        setError(null);
    };

    return {
        submitReservation,
        isLoading,
        error,
        reservation,
        reset,
    };
}
