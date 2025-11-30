import { useState, useEffect } from "react";
import { reservationApi } from "../services/reservation.service";
import {
    Reservation,
    PaginatedResponse,
    ReservationFilterOptions,
} from "../types";

// Hook to fetch reservations with pagination and filters
export function useReservations(params?: ReservationFilterOptions) {
    const [data, setData] = useState<PaginatedResponse<Reservation>>({
        items: [],
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await reservationApi.getAll(params);
            setData(result);
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to fetch reservations"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        params?.page,
        params?.limit,
        params?.status,
        params?.date,
        params?.startDate,
        params?.endDate,
        params?.tableId,
        params?.search,
        params?.sortBy,
        params?.sortOrder,
    ]);

    return {
        data,
        reservations: data.items,
        pagination: data.pagination,
        loading,
        error,
        refetch,
    };
}

// Hook to fetch single reservation by ID
export function useReservation(id: number | null) {
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        if (!id) {
            setReservation(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await reservationApi.getById(id);
            setReservation(data);
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to fetch reservation"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return { reservation, loading, error, refetch };
}

// Hook to fetch reservation by code
export function useReservationByCode(code: string | null) {
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        if (!code) {
            setReservation(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await reservationApi.getByCode(code);
            setReservation(data);
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to fetch reservation"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    return { reservation, loading, error, refetch };
}
